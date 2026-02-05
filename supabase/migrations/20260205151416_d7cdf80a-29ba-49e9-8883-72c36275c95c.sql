-- Allow anyone to delete events (for admin functionality without auth)
DROP POLICY IF EXISTS "Owner can delete own events" ON public.events;

CREATE POLICY "Anyone can delete events"
ON public.events
FOR DELETE
USING (true);