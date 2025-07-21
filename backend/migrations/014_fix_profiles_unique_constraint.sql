-- Fix profiles table unique constraint and add foreign key relationships
-- Migration: 014_fix_profiles_unique_constraint.sql

-- First, add unique constraint on profiles.user_id if it doesn't exist
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_unique 
UNIQUE (user_id);

-- Now add the foreign key relationships that were failing

-- Add foreign key relationship between team_members.user_id and profiles.user_id
ALTER TABLE team_members 
ADD CONSTRAINT fk_team_members_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
ON DELETE CASCADE;

-- Add foreign key for team_invitations.invited_by -> profiles.user_id  
ALTER TABLE team_invitations 
ADD CONSTRAINT fk_team_invitations_invited_by 
FOREIGN KEY (invited_by) REFERENCES profiles(user_id) 
ON DELETE SET NULL;

-- Add foreign key for team_documents.shared_by -> profiles.user_id
ALTER TABLE team_documents 
ADD CONSTRAINT fk_team_documents_shared_by 
FOREIGN KEY (shared_by) REFERENCES profiles(user_id) 
ON DELETE SET NULL;

-- Add foreign key for document_collaborators.user_id -> profiles.user_id
ALTER TABLE document_collaborators 
ADD CONSTRAINT fk_document_collaborators_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
ON DELETE CASCADE;

-- Add foreign key for notifications.user_id -> profiles.user_id
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
ON DELETE CASCADE; 