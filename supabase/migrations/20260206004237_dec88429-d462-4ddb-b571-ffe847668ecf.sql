-- Enable RLS on the events_public view
-- Note: Views with security_invoker=on inherit RLS from the base table
-- We need to add a policy to the events table that allows public SELECT for published events

-- Add policy to allow anyone to SELECT published events from the base table
-- This is needed for the security_invoker view to work
CREATE POLICY "Public can view published events via view"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');