-- Migration: Add research history table
-- Description: Store legal research sessions with preliminary results, clarifying questions, and final results

CREATE TABLE IF NOT EXISTS research_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    preliminary_result TEXT,
    clarifying_questions JSONB,
    clarifying_answers JSONB,
    final_result TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'preliminary' CHECK (status IN ('preliminary', 'questions_pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies
ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own research history
CREATE POLICY "Users can view own research history" ON research_history
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own research history
CREATE POLICY "Users can insert own research history" ON research_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own research history
CREATE POLICY "Users can update own research history" ON research_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own research history
CREATE POLICY "Users can delete own research history" ON research_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_research_history_user_id ON research_history(user_id);
CREATE INDEX IF NOT EXISTS idx_research_history_created_at ON research_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_history_status ON research_history(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_research_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_research_history_updated_at
    BEFORE UPDATE ON research_history
    FOR EACH ROW
    EXECUTE FUNCTION update_research_history_updated_at(); 