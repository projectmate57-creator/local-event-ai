-- Fix the events_public view security by using SECURITY INVOKER (default)
-- and ensuring it only shows approved published events

DROP VIEW IF EXISTS public.events_public;

CREATE VIEW public.events_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  status,
  slug,
  title,
  start_at,
  end_at,
  timezone,
  city,
  venue,
  address,
  description,
  ticket_url,
  tags,
  poster_public_url,
  age_restriction,
  created_at,
  updated_at
FROM public.events
WHERE status = 'published' 
  AND moderation_status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.events_public TO anon, authenticated;