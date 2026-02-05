-- Fix security issues: storage policies and events delete policy

-- 1. Drop overly permissive storage policies that allow anonymous access
DROP POLICY IF EXISTS "Anyone can delete posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload posters" ON storage.objects;

-- Also drop duplicate/redundant policies
DROP POLICY IF EXISTS "Anyone can read posters" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own posters" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own posters" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete own posters" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update own posters" ON storage.objects;

-- 2. Keep the public read policies (needed for displaying posters)
-- "Anyone can view posters" and "Public can view posters" provide SELECT access

-- 3. Create owner-scoped UPDATE policy for storage
DROP POLICY IF EXISTS "Owners can update own posters v2" ON storage.objects;
CREATE POLICY "Owners can update own posters v2"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'posters' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Create owner-scoped DELETE policy for storage
DROP POLICY IF EXISTS "Owners can delete own posters v2" ON storage.objects;
CREATE POLICY "Owners can delete own posters v2"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'posters' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Add missing DELETE policy for events table
DROP POLICY IF EXISTS "Owner can delete own events" ON public.events;
CREATE POLICY "Owner can delete own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());