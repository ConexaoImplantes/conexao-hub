
-- Fix system_config_public: view was security_invoker, so anon/authenticated hit
-- system_config directly and got permission denied. Switch to definer semantics.
ALTER VIEW public.system_config_public SET (security_invoker = false);
GRANT SELECT ON public.system_config_public TO anon, authenticated;

-- Allow managers with proper permissions to manage invite tokens.
CREATE POLICY "Users with invites.view can read tokens"
  ON public.invite_tokens FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'invites.view'));

CREATE POLICY "Users with invites.create can insert tokens"
  ON public.invite_tokens FOR INSERT
  TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'invites.create'));

CREATE POLICY "Users with invites.create can update tokens"
  ON public.invite_tokens FOR UPDATE
  TO authenticated
  USING (public.has_permission(auth.uid(), 'invites.create'))
  WITH CHECK (public.has_permission(auth.uid(), 'invites.create'));

CREATE POLICY "Users with invites.create can delete tokens"
  ON public.invite_tokens FOR DELETE
  TO authenticated
  USING (public.has_permission(auth.uid(), 'invites.create'));
