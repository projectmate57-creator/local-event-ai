
-- Make owner_id nullable for anonymous uploads
ALTER TABLE public.events ALTER COLUMN owner_id DROP NOT NULL;

-- Add edit_token for anonymous draft access
ALTER TABLE public.events ADD COLUMN edit_token UUID DEFAULT gen_random_uuid();

-- Create index on edit_token for fast lookups
CREATE INDEX idx_events_edit_token ON public.events (edit_token) WHERE edit_token IS NOT NULL;

-- RLS policy: anyone can SELECT an event if they provide matching edit_token via request header
CREATE POLICY "Token holder can view event"
ON public.events
FOR SELECT
USING (
  edit_token IS NOT NULL 
  AND edit_token::text = coalesce(current_setting('request.headers', true)::json->>'x-edit-token', '')
);

-- RLS policy: anyone can UPDATE an event if they provide matching edit_token via request header
CREATE POLICY "Token holder can update event"
ON public.events
FOR UPDATE
USING (
  edit_token IS NOT NULL 
  AND edit_token::text = coalesce(current_setting('request.headers', true)::json->>'x-edit-token', '')
)
WITH CHECK (
  edit_token IS NOT NULL 
  AND edit_token::text = coalesce(current_setting('request.headers', true)::json->>'x-edit-token', '')
);

-- Allow admins to update any event (needed for moderation)
CREATE POLICY "Admins can update any event"
ON public.events
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
