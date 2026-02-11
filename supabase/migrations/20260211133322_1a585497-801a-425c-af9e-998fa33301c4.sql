
-- Step 1: Drop the public SELECT policy that exposes edit_token
DROP POLICY IF EXISTS "Anyone can view published approved events" ON public.events;

-- Step 2: Recreate events_public view with security_invoker = false (definer mode)
-- This allows the view to bypass RLS on the underlying events table,
-- while only exposing safe columns and filtering to published+approved events.
CREATE OR REPLACE VIEW public.events_public
WITH (security_invoker = false)
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
WHERE status = 'published' AND moderation_status = 'approved';

-- Step 3: Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.events_public TO anon, authenticated;
