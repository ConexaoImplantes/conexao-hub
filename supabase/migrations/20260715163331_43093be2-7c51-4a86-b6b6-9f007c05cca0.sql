-- Table for logging failed signup attempts (invite flow).
-- Anon can INSERT so failures from unauthenticated invitees are recorded.
-- Only super_admin can read to inspect issues.
CREATE TABLE public.signup_failures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  invite_token_id UUID,
  invite_role TEXT,
  error_code TEXT,
  error_message TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.signup_failures TO anon;
GRANT INSERT ON public.signup_failures TO authenticated;
GRANT SELECT, DELETE ON public.signup_failures TO authenticated;
GRANT ALL ON public.signup_failures TO service_role;

ALTER TABLE public.signup_failures ENABLE ROW LEVEL SECURITY;

-- Anyone (even anonymous invitees) may log a failure.
CREATE POLICY "Anyone can log signup failures"
  ON public.signup_failures FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only super_admin can read/delete.
CREATE POLICY "Super admin reads signup failures"
  ON public.signup_failures FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin deletes signup failures"
  ON public.signup_failures FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX signup_failures_created_at_idx ON public.signup_failures (created_at DESC);