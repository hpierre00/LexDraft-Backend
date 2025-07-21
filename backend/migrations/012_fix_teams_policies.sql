-- Proper fix: Fix circular dependency in teams policies
-- Migration: 012_fix_teams_policies.sql

-- Drop the problematic teams policy
DROP POLICY IF EXISTS "Users can view teams they own or are members of" ON teams;

-- Create fixed policies without circular dependencies

-- Policy 1: Users can view teams they own (no circular reference)
CREATE POLICY "Users can view teams they own" ON teams
    FOR SELECT USING (owner_id = auth.uid());

-- Policy 2: Create a simpler approach - users can view teams if they have ANY membership record
-- This avoids the circular dependency by not checking team access within team policies
CREATE POLICY "Users can view teams they are members of" ON teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = teams.id 
            AND tm.user_id = auth.uid()
        )
    );

-- Alternative: If the above still causes issues, use a function-based approach
-- Create a function to check team membership without policy recursion
CREATE OR REPLACE FUNCTION user_is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = team_uuid 
        AND user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_is_team_member(UUID, UUID) TO authenticated;

-- Alternative policy using the function (comment out the above policy if using this)
-- CREATE POLICY "Users can view teams via function" ON teams
--     FOR SELECT USING (
--         owner_id = auth.uid() OR 
--         user_is_team_member(id, auth.uid())
--     ); 