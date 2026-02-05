-- Re-add permissive RLS policies for testing (no auth required)
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
DROP POLICY IF EXISTS "Anyone can update events" ON public.events;
DROP POLICY IF EXISTS "Anyone can read all events" ON public.events;

CREATE POLICY "Anyone can insert events" ON public.events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update events" ON public.events
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can read all events" ON public.events
  FOR SELECT USING (true);