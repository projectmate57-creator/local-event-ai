-- Drop existing restrictive policies on events table
DROP POLICY IF EXISTS "Users can insert their own events" ON public.events;
DROP POLICY IF EXISTS "Owners can update their events" ON public.events;
DROP POLICY IF EXISTS "Owners can read their drafts" ON public.events;

-- Create permissive policies for testing (no auth required)
CREATE POLICY "Anyone can insert events" ON public.events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update events" ON public.events
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can read all events" ON public.events
  FOR SELECT USING (true);