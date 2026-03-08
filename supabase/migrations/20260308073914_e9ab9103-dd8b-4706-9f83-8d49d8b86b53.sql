
ALTER TABLE public.events ADD COLUMN latitude double precision;
ALTER TABLE public.events ADD COLUMN longitude double precision;

DROP VIEW IF EXISTS public.events_public;

CREATE VIEW public.events_public AS
SELECT id, status, slug, title, start_at, end_at, timezone, city, venue, address,
       description, ticket_url, tags, poster_public_url, age_restriction,
       latitude, longitude, created_at, updated_at
FROM events
WHERE status = 'published' AND moderation_status = 'approved';
