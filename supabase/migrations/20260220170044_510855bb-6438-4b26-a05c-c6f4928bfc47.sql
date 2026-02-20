
-- Create collection_progress table to track user progress on trails
CREATE TABLE public.collection_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  status public.progress_status NOT NULL DEFAULT 'started',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, collection_id)
);

-- Enable RLS
ALTER TABLE public.collection_progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own progress
CREATE POLICY "Users can manage own collection progress"
ON public.collection_progress
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can view all collection progress
CREATE POLICY "Admins can view all collection progress"
ON public.collection_progress
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_collection_progress_updated_at
BEFORE UPDATE ON public.collection_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
