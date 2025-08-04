/*
  # Fix bodyguards table RLS issues

  1. Changes
    - Remove password column from bodyguards table (security vulnerability)
    - Update RLS policies to work with proper authentication flow
    - Ensure storage policies are correctly configured

  2. Security
    - Remove password storage (handled by Supabase Auth)
    - Fix RLS policies for authenticated operations
*/

-- Remove password column as it's a security vulnerability
-- Passwords are handled by Supabase Auth
ALTER TABLE bodyguards DROP COLUMN IF EXISTS password;

-- Update the insert policy to ensure proper authentication
DROP POLICY IF EXISTS "Anyone can insert bodyguard profile" ON bodyguards;

CREATE POLICY "Authenticated users can insert their bodyguard profile"
  ON bodyguards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- Ensure storage policies are properly configured
DROP POLICY IF EXISTS "Authenticated users can upload bodyguard files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view bodyguard files" ON storage.objects;

CREATE POLICY "Authenticated users can upload bodyguard files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bodyguard-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view bodyguard files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'bodyguard-files');