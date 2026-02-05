-- Fix function search path for handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop the overly permissive analytics insert policy
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.event_analytics;

-- Create a more secure analytics insert policy
-- Only allow inserting analytics for published events
CREATE POLICY "Insert analytics for published events only"
  ON public.event_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_analytics.event_id
      AND events.status = 'published'
    )
  );