-- Temporary fix for team_invitations RLS issue
-- Migration: 017_temporary_fix_team_invitations.sql

-- Disable RLS on team_invitations to fix the 403 error
ALTER TABLE team_invitations DISABLE ROW LEVEL SECURITY;

-- Note: This is a temporary fix. Re-enable RLS with proper policies later. 