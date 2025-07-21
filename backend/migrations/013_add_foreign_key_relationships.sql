-- Add missing foreign key relationships
-- Migration: 013_add_foreign_key_relationships.sql

-- Add foreign key relationship between team_members.user_id and profiles.user_id
-- This will enable proper joins in Supabase queries

-- First, ensure the relationship exists
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