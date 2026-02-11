
-- 1. Fix user_roles: restrict SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Fix event_analytics: tighten INSERT block and add anon SELECT denial
DROP POLICY IF EXISTS "Block direct analytics inserts" ON public.event_analytics;
CREATE POLICY "Block direct analytics inserts"
  ON public.event_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny anonymous analytics access"
  ON public.event_analytics
  FOR SELECT
  TO anon
  USING (false);
