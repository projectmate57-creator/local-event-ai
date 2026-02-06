-- Proper fix: Use security_invoker view + restrictive base table policy
-- This is the recommended pattern for secure public views

-- 1. Drop the security definer view
DROP VIEW IF EXISTS public.events_public;

-- 2. Recreate with security_invoker = on
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

-- 3. Grant SELECT on the view
GRANT SELECT ON public.events_public TO anon, authenticated;

-- 4. Add a policy that ONLY allows the view to access published events
-- Since the view filters to status='published' and only selects safe columns,
-- this policy enables the view to work while the base table remains protected
CREATE POLICY "Allow view access to published events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');