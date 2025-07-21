-- Migration: Add title field to existing chat_histories table
-- Description: Add title support for intelligent chat naming

-- Add title column to existing chat_histories table
ALTER TABLE public.chat_histories 
ADD COLUMN title VARCHAR(255) DEFAULT 'New Chat';

-- Update existing records to have a default title
UPDATE public.chat_histories 
SET title = 'New Chat' 
WHERE title IS NULL; 