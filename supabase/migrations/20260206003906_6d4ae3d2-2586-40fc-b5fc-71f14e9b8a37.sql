-- Create a public view that excludes sensitive fields for anonymous access
-- Sensitive fields excluded: owner_id, source_url, confidence_overall, confidence_json, evidence_json, poster_path

CREATE VIEW public.events_public
WITH (security_invoker = on) AS
SELECT 
  id,
  title,
  description,
  city,
  venue,
  address,
  start_at,
  end_at,
  timezone,
  status,
  slug,
  tags,
  ticket_url,
  poster_public_url,
  created_at,
  updated_at
FROM public.events
WHERE status = 'published';

-- Drop the existing policy that exposes all columns to public
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;

-- Create a new policy that only allows owners to view published events directly
-- Public users must use the events_public view instead
CREATE POLICY "Owner can view own published events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() AND status = 'published');

-- Grant SELECT on the public view to anon and authenticated roles
GRANT SELECT ON public.events_public TO anon, authenticated;