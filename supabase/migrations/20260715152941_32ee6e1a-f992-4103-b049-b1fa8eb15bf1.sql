
-- =========================================================
-- 1) audit_logs: server-side identity + immutability
-- =========================================================

CREATE OR REPLACE FUNCTION public.enforce_audit_log_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _name  text;
  _role  text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: audit_logs insert requires authenticated user';
  END IF;

  -- Force user_id to match the authenticated caller.
  NEW.user_id := _uid;

  -- Overwrite identity fields with authoritative values from the database.
  SELECT p.name, p.email
    INTO _name, _email
    FROM public.profiles p
    WHERE p.id = _uid;

  SELECT ur.role::text
    INTO _role
    FROM public.user_roles ur
    WHERE ur.user_id = _uid
    LIMIT 1;

  NEW.user_name  := COALESCE(_name, 'Usuário');
  NEW.user_email := _email;
  NEW.user_role  := _role;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_audit_log_identity ON public.audit_logs;
CREATE TRIGGER trg_enforce_audit_log_identity
BEFORE INSERT ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.enforce_audit_log_identity();

-- Explicit, restrictive deny for UPDATE and DELETE so audit rows are immutable.
DROP POLICY IF EXISTS "No one can update audit logs" ON public.audit_logs;
CREATE POLICY "No one can update audit logs"
  ON public.audit_logs
  AS RESTRICTIVE
  FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "No one can delete audit logs" ON public.audit_logs;
CREATE POLICY "No one can delete audit logs"
  ON public.audit_logs
  AS RESTRICTIVE
  FOR DELETE
  TO public
  USING (false);

-- =========================================================
-- 2) system_config: remove public SELECT on base table.
--    Public reads go through the system_config_public view,
--    which excludes webhook_url and other sensitive fields.
-- =========================================================

DROP POLICY IF EXISTS "Anyone can read system config" ON public.system_config;

DROP POLICY IF EXISTS "Super admin reads system config" ON public.system_config;
CREATE POLICY "Super admin reads system config"
  ON public.system_config
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

REVOKE SELECT ON public.system_config FROM anon;
-- Keep authenticated SELECT permission at the GRANT level so RLS policy
-- (super_admin only) is what actually gates access.
