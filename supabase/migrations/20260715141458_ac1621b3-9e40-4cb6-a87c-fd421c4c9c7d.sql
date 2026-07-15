
-- User-level permission overrides
CREATE TABLE public.user_permissions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  effect TEXT NOT NULL CHECK (effect IN ('grant','revoke')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, permission_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_permissions_select_self_or_admin"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "user_permissions_write_super_admin"
  ON public.user_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Updated has_permission taking user_permissions overrides into account
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.user_permissions
      WHERE user_id = _user_id AND permission_key = _permission AND effect = 'grant'
    )
    OR (
      EXISTS (
        SELECT 1
        FROM public.role_permissions rp
        JOIN public.user_roles ur ON ur.role = rp.role
        WHERE ur.user_id = _user_id
          AND rp.permission_key = _permission
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.user_permissions
        WHERE user_id = _user_id AND permission_key = _permission AND effect = 'revoke'
      )
    );
$$;

-- Effective permissions for a given user (all keys)
CREATE OR REPLACE FUNCTION public.get_effective_permissions(_user_id uuid)
RETURNS SETOF text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.key
  FROM public.permissions p
  WHERE public.has_permission(_user_id, p.key);
$$;

GRANT EXECUTE ON FUNCTION public.get_effective_permissions(uuid) TO authenticated, anon;
