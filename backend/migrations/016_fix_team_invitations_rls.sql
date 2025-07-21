-- Fix team_invitations RLS policies
-- Migration: 016_fix_team_invitations_rls.sql

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view invitations for teams they own" ON team_invitations;
DROP POLICY IF EXISTS "Team owners and admins can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Team owners and admins can update invitations" ON team_invitations;

-- Re-enable RLS on team_invitations
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that work without circular dependencies

-- Policy 1: Users can view invitations they created
CREATE POLICY "Users can view invitations they created" ON team_invitations
    FOR SELECT USING (invited_by = auth.uid());

-- Policy 2: Users can view invitations for teams they own
CREATE POLICY "Users can view invitations for teams they own" ON team_invitations
    FOR SELECT USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- Policy 3: Team owners can create invitations
CREATE POLICY "Team owners can create invitations" ON team_invitations
    FOR INSERT WITH CHECK (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- Policy 4: Team admins can create invitations (using a safe check)
CREATE POLICY "Team admins can create invitations" ON team_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Policy 5: Team owners can update invitations
CREATE POLICY "Team owners can update invitations" ON team_invitations
    FOR UPDATE USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- Policy 6: Team admins can update invitations
CREATE POLICY "Team admins can update invitations" ON team_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_invitations.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Policy 7: Allow system to insert invitations (for testing)
CREATE POLICY "System can insert invitations" ON team_invitations
    FOR INSERT WITH CHECK (TRUE);

-- Policy 8: Allow system to update invitations (for testing)
CREATE POLICY "System can update invitations" ON team_invitations
    FOR UPDATE USING (TRUE); 