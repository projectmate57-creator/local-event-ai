-- FINAL FIX: Use security definer view (standard pattern for public column-restricted access)
-- This is the correct approach for exposing a subset of columns publicly

-- 1. Remove the policy that exposes all columns to public
DROP POLICY IF EXISTS "Allow view access to published events" ON public.events;

-- 2. Drop the security_invoker view
DROP VIEW IF EXISTS public.events_public;

-- 3. Recreate as a standard view (security definer is the default)
-- This view provides read-only access to ONLY the safe columns
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

-- 4. Grant SELECT on the view to anon and authenticated roles
-- This is the ONLY way public users can access event data
GRANT SELECT ON public.events_public TO anon, authenticated;

-- 5. Ensure direct table access is blocked for public (verify existing policies)
-- The existing policies only allow:
-- - Owner can view own drafts (auth.uid() = owner_id AND status = 'draft')
-- - Owner can view own published events (auth.uid() = owner_id AND status = 'published')
-- These are correct - no anonymous access to base table