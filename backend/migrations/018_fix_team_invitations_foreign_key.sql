-- Fix team_invitations foreign key constraint
-- Migration: 018_fix_team_invitations_foreign_key.sql

-- Drop the conflicting foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_team_invitations_invited_by'
    ) THEN
        ALTER TABLE team_invitations 
        DROP CONSTRAINT fk_team_invitations_invited_by;
    END IF;
END $$;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE team_invitations 
ADD CONSTRAINT fk_team_invitations_invited_by 
FOREIGN KEY (invited_by) REFERENCES auth.users(id) 
ON DELETE CASCADE; 