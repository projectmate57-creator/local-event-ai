-- Fix RESTRICTIVE policy conflict by converting to PERMISSIVE policies (OR logic)
-- Drop all existing RESTRICTIVE SELECT policies on events table
DROP POLICY IF EXISTS "Owner can view own drafts" ON public.events;
DROP POLICY IF EXISTS "Owner can view own published events" ON public.events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view published approved events" ON public.events;

-- Recreate as PERMISSIVE policies (default - uses OR logic)
-- Policy 1: Owners can view ALL their own events (any status)
CREATE POLICY "Owner can view own events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Policy 2: Admins can view all events
CREATE POLICY "Admins can view all events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Policy 3: Anyone (including anonymous) can view published approved events
CREATE POLICY "Anyone can view published approved events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND moderation_status = 'approved');