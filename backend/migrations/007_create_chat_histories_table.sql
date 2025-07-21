-- Migration: Create chat_histories table with title support
-- Description: Store chat sessions with history, titles, and metadata

CREATE TABLE IF NOT EXISTS chat_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    history JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(session_id, user_id)
);

-- Add RLS policies
ALTER TABLE chat_histories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own chat histories
CREATE POLICY "Users can view own chat histories" ON chat_histories
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own chat histories
CREATE POLICY "Users can insert own chat histories" ON chat_histories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own chat histories
CREATE POLICY "Users can update own chat histories" ON chat_histories
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own chat histories
CREATE POLICY "Users can delete own chat histories" ON chat_histories
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_histories_user_id ON chat_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_histories_session_id ON chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_histories_updated_at ON chat_histories(updated_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_chat_histories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chat_histories_updated_at
    BEFORE UPDATE ON chat_histories
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_histories_updated_at(); 