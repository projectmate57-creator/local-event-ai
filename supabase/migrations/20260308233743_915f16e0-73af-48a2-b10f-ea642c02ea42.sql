-- 1. Create helper to escape ILIKE wildcards
CREATE OR REPLACE FUNCTION public.escape_ilike(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(replace(replace(input, '\', '\\'), '%', '\%'), '_', '\_')
$$;

-- 2. Recreate check_duplicate_events with escaped ILIKE patterns
CREATE OR REPLACE FUNCTION public.check_duplicate_events(
  p_title text,
  p_city text,
  p_start_at timestamp with time zone,
  p_exclude_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(id uuid, title text, city text, start_at timestamp with time zone, venue text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.title,
    ep.city,
    ep.start_at,
    ep.venue
  FROM events_public ep
  WHERE 
    (p_exclude_id IS NULL OR ep.id != p_exclude_id)
    AND ep.status = 'published'
    AND LOWER(TRIM(ep.city)) = LOWER(TRIM(p_city))
    AND ep.start_at BETWEEN (p_start_at - INTERVAL '24 hours') AND (p_start_at + INTERVAL '24 hours')
    AND (
      LOWER(ep.title) ILIKE '%' || escape_ilike(LOWER(TRIM(p_title))) || '%'
      OR escape_ilike(LOWER(TRIM(p_title))) ILIKE '%' || LOWER(ep.title) || '%'
    );
END;
$function$;

-- 3. Add file size limit (5MB) to posters storage bucket
UPDATE storage.buckets 
SET file_size_limit = 5242880
WHERE id = 'posters';

-- 4. Add allowed MIME types to restrict uploads to images only
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'posters';