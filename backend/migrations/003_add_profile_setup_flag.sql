-- Migration: Final schema update for profile completion and admin flag.

-- This migration ensures the profiles table has:
-- 1. A single TEXT 'role' column.
-- 2. An 'is_admin' boolean flag.
-- 3. A 'profile_setup_complete' boolean flag.
-- It also ensures the 'contacts' table exists.

-- Add 'is_admin' and 'profile_setup_complete' columns if they don't exist.
-- The previous migration might have failed, so we ensure these are present.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_setup_complete BOOLEAN DEFAULT FALSE;

-- Attempt to revert 'role' from array to text, if it's an array.
-- This is a more robust way to handle the reversion.
DO $$
BEGIN
    IF (SELECT data_type FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role') = 'ARRAY' THEN
            ALTER TABLE public.profiles
                ALTER COLUMN role TYPE TEXT
                USING (role[1]);
    END IF;
END $$;


-- Create the contacts table if it does not already exist.
CREATE TABLE IF NOT EXISTS public.contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
); 