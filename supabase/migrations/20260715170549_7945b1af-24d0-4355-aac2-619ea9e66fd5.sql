
-- Allow permission-based updates on profiles/user_roles so managers with
-- users.toggle_active (and related) permissions can actually mutate rows.

CREATE POLICY "Permitted users can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.edit')
    OR public.has_permission(auth.uid(), 'users.toggle_active')
    OR public.has_permission(auth.uid(), 'users.approve_pending')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'users.edit')
    OR public.has_permission(auth.uid(), 'users.toggle_active')
    OR public.has_permission(auth.uid(), 'users.approve_pending')
  );

CREATE POLICY "Permitted users can update user roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_permission(auth.uid(), 'users.change_role'))
  WITH CHECK (public.has_permission(auth.uid(), 'users.change_role'));
