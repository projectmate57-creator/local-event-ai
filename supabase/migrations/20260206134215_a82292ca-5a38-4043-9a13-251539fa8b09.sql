-- Add policy to allow viewing published, approved events by anyone (through the view)
CREATE POLICY "Anyone can view published approved events"
ON public.events
FOR SELECT
USING (status = 'published' AND moderation_status = 'approved');