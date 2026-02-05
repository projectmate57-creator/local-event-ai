-- Allow anyone to upload to posters bucket (for testing)
DROP POLICY IF EXISTS "Anyone can upload posters" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read posters" ON storage.objects;

CREATE POLICY "Anyone can upload posters" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posters');

CREATE POLICY "Anyone can read posters" ON storage.objects
  FOR SELECT USING (bucket_id = 'posters');

CREATE POLICY "Anyone can update posters" ON storage.objects
  FOR UPDATE USING (bucket_id = 'posters');

CREATE POLICY "Anyone can delete posters" ON storage.objects
  FOR DELETE USING (bucket_id = 'posters');