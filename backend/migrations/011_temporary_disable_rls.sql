-- Temporary fix: Disable RLS for testing
-- Migration: 011_temporary_disable_rls.sql
-- ⚠️ WARNING: This removes security - only for testing!

-- Disable RLS on teams and team_members tables
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Note: Run this only for testing purposes
-- You should re-enable RLS with proper policies later 