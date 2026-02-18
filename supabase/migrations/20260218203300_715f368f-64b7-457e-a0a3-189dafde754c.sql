
-- Fase 1: Novas tabelas e colunas para features avançadas

-- 1. Adicionar colunas à tabela materials
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS category text;

-- 2. Adicionar coluna points à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;

-- 3. Criar enum para status de progresso
DO $$ BEGIN
  CREATE TYPE public.progress_status AS ENUM ('started', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Criar tabela collections (trilhas de aprendizagem)
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title jsonb NOT NULL DEFAULT '{}',
  description jsonb,
  cover_image text,
  allowed_roles app_role[] NOT NULL DEFAULT '{client}',
  active boolean NOT NULL DEFAULT true,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view allowed active collections"
  ON public.collections FOR SELECT
  USING (active = true AND get_user_role(auth.uid()) = ANY(allowed_roles));

-- 5. Criar tabela collection_items
CREATE TABLE IF NOT EXISTS public.collection_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  UNIQUE(collection_id, material_id)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage collection items"
  ON public.collection_items FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view collection items of allowed collections"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_items.collection_id
        AND c.active = true
        AND get_user_role(auth.uid()) = ANY(c.allowed_roles)
    )
  );

-- 6. Criar tabela user_progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  status public.progress_status NOT NULL DEFAULT 'started',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
  ON public.user_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all progress"
  ON public.user_progress FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

-- 7. Índices de performance
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_material_id ON public.collection_items(material_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_material_id ON public.user_progress(material_id);
CREATE INDEX IF NOT EXISTS idx_materials_tags ON public.materials USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);

-- 8. Trigger de updated_at para novas tabelas
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
