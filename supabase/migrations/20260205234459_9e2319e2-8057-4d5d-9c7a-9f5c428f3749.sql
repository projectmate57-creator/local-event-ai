-- Fix: Restrict storage INSERT to owner-scoped paths only
-- This prevents authenticated users from uploading to other users' folders

-- Drop the permissive INSERT policies
DROP POLICY IF EXISTS "Authenticated users can upload posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload posters" ON storage.objects;

-- Create owner-scoped INSERT policy (same pattern as UPDATE/DELETE)
CREATE POLICY "Users can upload to own folder only"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'posters' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );