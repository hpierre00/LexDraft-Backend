-- Migration: Create support_tickets table and attachments bucket.

-- This migration creates the 'support_tickets' table to store user support requests
-- and a 'attachments' bucket in Supabase storage for file uploads.

-- Create the support_tickets table
CREATE TABLE public.support_tickets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT,
    subject TEXT,
    description TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'open'
);

-- Create the attachments bucket in Supabase storage
-- Note: This is a pseudo-SQL command. You will need to create the bucket manually
-- in your Supabase dashboard under Storage > Buckets > Create Bucket.
-- The bucket should be named 'attachments' and can be public or private depending on your needs.
-- For this example, we'll assume a public bucket.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true); 