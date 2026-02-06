-- Create function to check for duplicate events
CREATE OR REPLACE FUNCTION public.check_duplicate_events(
  p_title TEXT,
  p_city TEXT,
  p_start_at TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  city TEXT,
  start_at TIMESTAMPTZ,
  venue TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- Exclude the current event being edited
    (p_exclude_id IS NULL OR ep.id != p_exclude_id)
    -- Only published events
    AND ep.status = 'published'
    -- City match (case-insensitive)
    AND LOWER(TRIM(ep.city)) = LOWER(TRIM(p_city))
    -- Date within 24 hours
    AND ep.start_at BETWEEN (p_start_at - INTERVAL '24 hours') AND (p_start_at + INTERVAL '24 hours')
    -- Title similarity (case-insensitive, checking if words overlap)
    AND (
      LOWER(ep.title) ILIKE '%' || LOWER(TRIM(p_title)) || '%'
      OR LOWER(TRIM(p_title)) ILIKE '%' || LOWER(ep.title) || '%'
    );
END;
$$;