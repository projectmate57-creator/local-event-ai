CREATE OR REPLACE FUNCTION public.escape_ilike(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT replace(replace(replace(input, '\', '\\'), '%', '\%'), '_', '\_')
$$;