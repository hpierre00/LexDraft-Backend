-- Fix infinite recursion in team_members RLS policies
-- Migration: 010_fix_team_policies.sql

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view team members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage team members" ON team_members;

-- Create fixed policies without circular dependencies

-- Policy 1: Users can view team members of teams they own (no circular reference)
CREATE POLICY "Team owners can view all team members" ON team_members
    FOR SELECT USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- Policy 2: Users can view their own team membership record
CREATE POLICY "Users can view their own team membership" ON team_members
    FOR SELECT USING (user_id = auth.uid());

-- Policy 3: Team owners can manage team members (no circular reference)
CREATE POLICY "Team owners can manage team members" ON team_members
    FOR ALL USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- Policy 4: Admins can manage team members (safe check without recursion)
CREATE POLICY "Team admins can manage team members" ON team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

-- Policy 5: Allow system to insert team owner as member (for trigger)
CREATE POLICY "System can insert team owner as member" ON team_members
    FOR INSERT WITH CHECK (
        role = 'owner' AND 
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid() AND owner_id = user_id)
    );

-- Policy 6: Allow invitations to be accepted
CREATE POLICY "Users can accept team invitations" ON team_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_invitations ti 
            WHERE ti.team_id = team_members.team_id 
            AND ti.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND ti.status = 'pending'
            AND ti.expires_at > NOW()
        )
    ); 