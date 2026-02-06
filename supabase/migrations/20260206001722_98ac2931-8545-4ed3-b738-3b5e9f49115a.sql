-- Fix analytics spam: Block direct client inserts, allow only via service role in edge function

-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Insert analytics for published events only" ON public.event_analytics;

-- Create a restrictive policy that blocks all direct client inserts
-- Only service_role (used by edge function) can insert
CREATE POLICY "Block direct analytics inserts"
  ON public.event_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- Ensure analytics SELECT is properly restricted to event owners only
-- (This policy may already exist, but we ensure it's present)
DROP POLICY IF EXISTS "Owner can view analytics for own events" ON public.event_analytics;

CREATE POLICY "Owner can view analytics for own events"
  ON public.event_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_analytics.event_id
      AND events.owner_id = auth.uid()
    )
  );