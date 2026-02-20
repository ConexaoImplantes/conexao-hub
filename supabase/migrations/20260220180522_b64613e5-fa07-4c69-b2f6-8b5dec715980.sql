ALTER TABLE public.gamification_levels ADD COLUMN color text NOT NULL DEFAULT '#c9a655';

-- Set default colors for existing levels
UPDATE public.gamification_levels SET color = '#9ca3af' WHERE name = 'Iniciante';
UPDATE public.gamification_levels SET color = '#cd7f32' WHERE name = 'Bronze';
UPDATE public.gamification_levels SET color = '#c0c0c0' WHERE name = 'Prata';
UPDATE public.gamification_levels SET color = '#ffd700' WHERE name = 'Ouro';
UPDATE public.gamification_levels SET color = '#e8d48b' WHERE name = 'Master';