
-- 1) Fix invite_tokens UPDATE privilege escalation
DROP POLICY IF EXISTS "Users can mark token as used" ON public.invite_tokens;

CREATE OR REPLACE FUNCTION public.prevent_invite_token_field_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to change anything
  IF public.has_role(auth.uid(), 'super_admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admins may only update used_by, used_at, status. Other fields must stay the same.
  IF NEW.token IS DISTINCT FROM OLD.token
     OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.sender_name IS DISTINCT FROM OLD.sender_name
     OR NEW.recipient_name IS DISTINCT FROM OLD.recipient_name
     OR NEW.recipient_phone IS DISTINCT FROM OLD.recipient_phone
     OR NEW.recipient_message IS DISTINCT FROM OLD.recipient_message
     OR NEW.shared_at IS DISTINCT FROM OLD.shared_at
     OR NEW.share_prepared_at IS DISTINCT FROM OLD.share_prepared_at THEN
    RAISE EXCEPTION 'Only used_by, used_at and status may be modified on invite_tokens';
  END IF;

  -- Status may only transition to 'used'
  IF NEW.status NOT IN ('used') AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Invalid status transition';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_invite_token_tampering ON public.invite_tokens;
CREATE TRIGGER prevent_invite_token_tampering
BEFORE UPDATE ON public.invite_tokens
FOR EACH ROW
EXECUTE FUNCTION public.prevent_invite_token_field_tampering();

CREATE POLICY "Users can mark token as used"
ON public.invite_tokens
FOR UPDATE
TO authenticated
USING (used_by IS NULL OR used_by = auth.uid())
WITH CHECK (used_by = auth.uid());

-- 2) Scope public-role policies to authenticated only
-- collections
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" ON public.collections
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users can view allowed active collections" ON public.collections;
CREATE POLICY "Users can view allowed active collections" ON public.collections
FOR SELECT TO authenticated
USING ((active = true) AND (get_user_role(auth.uid()) = ANY (allowed_roles)));

-- collection_items
DROP POLICY IF EXISTS "Admins can manage collection items" ON public.collection_items;
CREATE POLICY "Admins can manage collection items" ON public.collection_items
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users can view collection items of allowed collections" ON public.collection_items;
CREATE POLICY "Users can view collection items of allowed collections" ON public.collection_items
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM collections c
  WHERE c.id = collection_items.collection_id
    AND c.active = true
    AND get_user_role(auth.uid()) = ANY (c.allowed_roles)
));

-- user_progress
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress" ON public.user_progress
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all progress" ON public.user_progress;
CREATE POLICY "Admins can view all progress" ON public.user_progress
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- collection_progress
DROP POLICY IF EXISTS "Users can manage own collection progress" ON public.collection_progress;
CREATE POLICY "Users can manage own collection progress" ON public.collection_progress
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all collection progress" ON public.collection_progress;
CREATE POLICY "Admins can view all collection progress" ON public.collection_progress
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- gamification_levels
DROP POLICY IF EXISTS "Anyone can view levels" ON public.gamification_levels;
CREATE POLICY "Anyone can view levels" ON public.gamification_levels
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage levels" ON public.gamification_levels;
CREATE POLICY "Admins can manage levels" ON public.gamification_levels
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
