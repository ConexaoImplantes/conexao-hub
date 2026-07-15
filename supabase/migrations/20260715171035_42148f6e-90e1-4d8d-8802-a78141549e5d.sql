
-- 1) profiles: explicit INSERT policy — only allow inserting own row
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 2) signup_failures: replace WITH CHECK (true) with a bounded check.
DROP POLICY IF EXISTS "Anyone can log signup failures" ON public.signup_failures;

CREATE POLICY "Anon can log signup failures (bounded)"
  ON public.signup_failures FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND char_length(email) BETWEEN 3 AND 320
    AND (error_code IS NULL OR char_length(error_code) <= 100)
    AND (error_message IS NULL OR char_length(error_message) <= 2000)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );

-- 3) user_roles: defense-in-depth trigger to block self-role assignment
CREATE OR REPLACE FUNCTION public.prevent_self_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If invoked in a user session (not a SECURITY DEFINER server trigger like
  -- handle_new_user, where auth.uid() is null), forbid assigning a role to self
  -- unless the caller is a super_admin.
  IF auth.uid() IS NOT NULL
     AND NEW.user_id = auth.uid()
     AND NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Users cannot assign or modify their own role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_role_assignment_ins ON public.user_roles;
CREATE TRIGGER prevent_self_role_assignment_ins
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_assignment();

DROP TRIGGER IF EXISTS prevent_self_role_assignment_upd ON public.user_roles;
CREATE TRIGGER prevent_self_role_assignment_upd
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_assignment();
