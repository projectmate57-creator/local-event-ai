-- Add age restriction and moderation columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS age_restriction text NOT NULL DEFAULT 'all_ages',
ADD COLUMN IF NOT EXISTS content_flags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderation_notes text;

-- Add check constraint for valid age restrictions
ALTER TABLE public.events 
ADD CONSTRAINT valid_age_restriction 
CHECK (age_restriction IN ('all_ages', '16+', '18+', '21+'));

-- Add check constraint for valid moderation status
ALTER TABLE public.events 
ADD CONSTRAINT valid_moderation_status 
CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- Drop and recreate the events_public view to include age_restriction
DROP VIEW IF EXISTS public.events_public;

CREATE VIEW public.events_public AS
SELECT 
  id,
  status,
  slug,
  title,
  start_at,
  end_at,
  timezone,
  city,
  venue,
  address,
  description,
  ticket_url,
  tags,
  poster_public_url,
  age_restriction,
  created_at,
  updated_at
FROM public.events
WHERE status = 'published' 
  AND moderation_status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.events_public TO anon, authenticated;