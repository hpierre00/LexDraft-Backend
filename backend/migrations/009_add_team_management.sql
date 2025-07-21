-- Migration: Add comprehensive team management system
-- Description: Teams, invitations, document collaboration, and notifications

-- Team roles enum
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Invitation status enum
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Notification types enum
CREATE TYPE notification_type AS ENUM ('team_invitation', 'document_shared', 'team_activity', 'role_changed');

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_active BOOLEAN DEFAULT TRUE
);

-- Team members join table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    invited_by UUID REFERENCES auth.users(id),
    UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role team_role NOT NULL DEFAULT 'viewer',
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status invitation_status DEFAULT 'pending',
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(team_id, email, status) -- Prevent duplicate pending invitations
);

-- Document collaborators table (for individual document sharing)
CREATE TABLE IF NOT EXISTS document_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255), -- For users who don't have accounts yet
    role team_role NOT NULL DEFAULT 'viewer',
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(document_id, user_id),
    UNIQUE(document_id, email),
    CHECK (user_id IS NOT NULL OR email IS NOT NULL) -- Either user_id or email must be provided
);

-- Team documents table (documents shared at team level)
CREATE TABLE IF NOT EXISTS team_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(team_id, document_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data specific to notification type
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE -- Optional expiration
);

-- Add team_id to documents table for team-owned documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_document_id ON document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_user_id ON document_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_team_documents_team_id ON team_documents(team_id);
CREATE INDEX IF NOT EXISTS idx_team_documents_document_id ON team_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_documents_team_id ON documents(team_id);

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams table
CREATE POLICY "Users can view teams they own or are members of" ON teams
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON teams
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON teams
    FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for team_members table
CREATE POLICY "Users can view team members of teams they belong to" ON team_members
    FOR SELECT USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()) OR
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

CREATE POLICY "Team owners and admins can manage team members" ON team_members
    FOR ALL USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()) OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- RLS Policies for team_invitations table
CREATE POLICY "Users can view invitations for teams they own" ON team_invitations
    FOR SELECT USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()) OR
        invited_by = auth.uid()
    );

CREATE POLICY "Team owners and admins can create invitations" ON team_invitations
    FOR INSERT WITH CHECK (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()) OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Team owners and admins can update invitations" ON team_invitations
    FOR UPDATE USING (
        team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()) OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- RLS Policies for document_collaborators table
CREATE POLICY "Users can view collaborators of documents they own or collaborate on" ON document_collaborators
    FOR SELECT USING (
        document_id IN (SELECT id FROM documents WHERE user_id = auth.uid()) OR
        user_id = auth.uid() OR
        shared_by = auth.uid()
    );

CREATE POLICY "Document owners can manage collaborators" ON document_collaborators
    FOR ALL USING (
        document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
    );

-- RLS Policies for team_documents table
CREATE POLICY "Team members can view team documents" ON team_documents
    FOR SELECT USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Team members with editor+ role can share documents to team" ON team_documents
    FOR INSERT WITH CHECK (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users" ON notifications
    FOR INSERT WITH CHECK (TRUE); -- Allow system to create notifications

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically add team owner as member
CREATE OR REPLACE FUNCTION add_team_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role, joined_at, invited_by)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW(), NEW.owner_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_team_owner_as_member
    AFTER INSERT ON teams
    FOR EACH ROW EXECUTE FUNCTION add_team_owner_as_member();

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE team_invitations 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql; 