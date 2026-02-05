-- Check existing storage policies and only create missing ones
DROP POLICY IF EXISTS "Public can view posters" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update own posters" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete own posters" ON storage.objects;

CREATE POLICY "Public can view posters"
ON storage.objects
FOR SELECT
USING (bucket_id = 'posters');

CREATE POLICY "Owners can update own posters"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'posters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete own posters"
ON storage.objects
FOR DELETE
USING (bucket_id = 'posters' AND auth.uid()::text = (storage.foldername(name))[1]);