-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  slug text UNIQUE,
  title text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  city text NOT NULL,
  venue text,
  address text,
  description text,
  ticket_url text,
  tags text[],
  poster_path text,
  poster_public_url text,
  source_url text,
  confidence_overall numeric,
  confidence_json jsonb,
  evidence_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create event_analytics table
CREATE TABLE public.event_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('view', 'ticket_click')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for events updated_at
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- Events policies
-- Draft events: only owner can read/write
CREATE POLICY "Owner can view own drafts"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() AND status = 'draft');

-- Published events: public read
CREATE POLICY "Anyone can view published events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Owner can insert their own events
CREATE POLICY "Owner can insert events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Owner can update their own events
CREATE POLICY "Owner can update own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Owner can delete their own events
CREATE POLICY "Owner can delete own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Analytics policies
-- Anyone can insert analytics (for tracking page views)
CREATE POLICY "Anyone can insert analytics"
  ON public.event_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Owner can read analytics for their events
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

-- Create indexes for performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_owner_id ON public.events(owner_id);
CREATE INDEX idx_events_start_at ON public.events(start_at);
CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_event_analytics_event_id ON public.event_analytics(event_id);
CREATE INDEX idx_event_analytics_created_at ON public.event_analytics(created_at);

-- Create storage bucket for posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for posters bucket
CREATE POLICY "Anyone can view posters"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'posters');

CREATE POLICY "Authenticated users can upload posters"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'posters');

CREATE POLICY "Users can update their own posters"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'posters');

CREATE POLICY "Users can delete their own posters"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'posters');