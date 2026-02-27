-- Add status column to invite_tokens
ALTER TABLE public.invite_tokens 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Marcar tokens já usados
UPDATE public.invite_tokens SET status = 'used' WHERE used_at IS NOT NULL;

-- Marcar tokens expirados
UPDATE public.invite_tokens SET status = 'expired' WHERE used_at IS NULL AND expires_at < now();