ALTER TABLE public.invite_tokens
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS recipient_name text,
  ADD COLUMN IF NOT EXISTS recipient_phone text,
  ADD COLUMN IF NOT EXISTS recipient_message text,
  ADD COLUMN IF NOT EXISTS share_prepared_at timestamptz,
  ADD COLUMN IF NOT EXISTS shared_at timestamptz;