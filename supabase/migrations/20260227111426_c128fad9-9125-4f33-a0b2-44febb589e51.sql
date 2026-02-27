
-- Create invite_tokens table
CREATE TABLE public.invite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  role public.app_role NOT NULL,
  used_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger instead of CHECK constraint for expires_at
CREATE OR REPLACE FUNCTION public.validate_invite_token_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_invite_token_expiry
  BEFORE INSERT ON public.invite_tokens
  FOR EACH ROW EXECUTE FUNCTION public.validate_invite_token_expiry();

ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- Admins can manage all tokens
CREATE POLICY "Admins manage invite tokens"
  ON public.invite_tokens FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- Anon can validate tokens (SELECT only)
CREATE POLICY "Anon can validate tokens"
  ON public.invite_tokens FOR SELECT TO anon
  USING (true);

-- Authenticated users can also read tokens (for validation during signup)
CREATE POLICY "Authenticated can validate tokens"
  ON public.invite_tokens FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to update tokens they used (mark as used)
CREATE POLICY "Users can mark token as used"
  ON public.invite_tokens FOR UPDATE TO authenticated
  USING (used_by IS NULL OR used_by = auth.uid())
  WITH CHECK (used_by = auth.uid());

-- Add rejection_reason to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Enable realtime for profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
