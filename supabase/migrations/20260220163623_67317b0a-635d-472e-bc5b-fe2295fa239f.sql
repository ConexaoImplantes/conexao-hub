
-- Create table for gamification levels/ranks
CREATE TABLE public.gamification_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_points integer NOT NULL DEFAULT 0,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;

-- Everyone can read levels
CREATE POLICY "Anyone can view levels"
ON public.gamification_levels
FOR SELECT
USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage levels"
ON public.gamification_levels
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Seed default levels
INSERT INTO public.gamification_levels (name, min_points, order_index) VALUES
  ('Iniciante', 0, 0),
  ('Bronze', 100, 1),
  ('Prata', 300, 2),
  ('Ouro', 600, 3),
  ('Master', 1000, 4);

-- Trigger for updated_at
CREATE TRIGGER update_gamification_levels_updated_at
BEFORE UPDATE ON public.gamification_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
