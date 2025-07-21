-- Migration: Update support_tickets table for text extraction.

-- This migration updates the 'support_tickets' table to store the
-- filename and extracted text content of attachments directly in the database.

-- Drop the old attachment_url column
ALTER TABLE public.support_tickets DROP COLUMN attachment_url;

-- Add new columns for attachment filename and content
ALTER TABLE public.support_tickets
ADD COLUMN attachment_filename TEXT,
ADD COLUMN attachment_content TEXT; 