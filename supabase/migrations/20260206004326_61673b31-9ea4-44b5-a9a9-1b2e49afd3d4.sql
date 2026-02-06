-- Fix: Remove the policy that exposes all columns to public
-- The view should provide read access, not direct table access

DROP POLICY IF EXISTS "Public can view published events via view" ON public.events;

-- Drop and recreate the view WITHOUT security_invoker
-- This way the view runs with definer privileges and doesn't need RLS on base table
DROP VIEW IF EXISTS public.events_public;

CREATE VIEW public.events_public AS
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

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.events_public TO anon, authenticated;