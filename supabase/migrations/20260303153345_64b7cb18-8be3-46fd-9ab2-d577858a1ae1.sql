
-- Add collection_id column to user_progress
ALTER TABLE public.user_progress 
ADD COLUMN collection_id uuid NULL REFERENCES public.collections(id) ON DELETE CASCADE;

-- Drop existing unique constraint
ALTER TABLE public.user_progress 
DROP CONSTRAINT IF EXISTS user_progress_user_id_material_id_key;

-- Create new context-aware unique constraint
ALTER TABLE public.user_progress 
ADD CONSTRAINT user_progress_context_unique 
UNIQUE NULLS NOT DISTINCT (user_id, material_id, collection_id);
