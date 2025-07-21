-- Safely add constraints only if they don't exist
-- Migration: 015_safe_add_constraints.sql

-- Add unique constraint on profiles.user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_unique'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_user_id_unique 
        UNIQUE (user_id);
    END IF;
END $$;

-- Add foreign key constraints only if they don't exist

-- team_members.user_id -> profiles.user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_team_members_user_id'
    ) THEN
        ALTER TABLE team_members 
        ADD CONSTRAINT fk_team_members_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- team_invitations.invited_by -> profiles.user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_team_invitations_invited_by'
    ) THEN
        ALTER TABLE team_invitations 
        ADD CONSTRAINT fk_team_invitations_invited_by 
        FOREIGN KEY (invited_by) REFERENCES profiles(user_id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- team_documents.shared_by -> profiles.user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_team_documents_shared_by'
    ) THEN
        ALTER TABLE team_documents 
        ADD CONSTRAINT fk_team_documents_shared_by 
        FOREIGN KEY (shared_by) REFERENCES profiles(user_id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- document_collaborators.user_id -> profiles.user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_document_collaborators_user_id'
    ) THEN
        ALTER TABLE document_collaborators 
        ADD CONSTRAINT fk_document_collaborators_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- notifications.user_id -> profiles.user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_notifications_user_id'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
        ON DELETE CASCADE;
    END IF;
END $$; 