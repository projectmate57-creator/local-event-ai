-- Remove foreign key constraint on owner_id for testing
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_owner_id_fkey;