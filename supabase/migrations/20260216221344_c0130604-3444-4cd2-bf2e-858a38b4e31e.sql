
-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('client', 'distributor', 'consultant', 'super_admin');
CREATE TYPE public.app_status AS ENUM ('pending', 'active', 'inactive', 'rejected');
CREATE TYPE public.material_type AS ENUM ('pdf', 'image', 'video');
CREATE TYPE public.translation_status AS ENUM ('draft', 'review', 'published');
CREATE TYPE public.app_language AS ENUM ('pt-br', 'en-us', 'es-es');

-- =============================================
-- 2. TABELAS
-- =============================================

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT DEFAULT '',
  cro TEXT,
  allowed_types public.material_type[] DEFAULT '{}',
  status public.app_status NOT NULL DEFAULT 'pending',
  preferences JSONB NOT NULL DEFAULT '{"theme":"light","language":"pt-br"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USER_ROLES (tabela separada para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'client',
  UNIQUE(user_id, role)
);

-- MATERIALS
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title JSONB NOT NULL DEFAULT '{}',
  type public.material_type NOT NULL DEFAULT 'pdf',
  allowed_roles public.app_role[] NOT NULL DEFAULT '{client}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MATERIAL_ASSETS
CREATE TABLE public.material_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  language public.app_language NOT NULL DEFAULT 'pt-br',
  url TEXT NOT NULL,
  subtitle_url TEXT,
  status public.translation_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(material_id, language)
);

-- ACCESS_LOGS
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language public.app_language NOT NULL DEFAULT 'pt-br',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SYSTEM_CONFIG
CREATE TABLE public.system_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  app_name TEXT NOT NULL DEFAULT 'Hub Conexão',
  logo_url TEXT,
  webhook_url TEXT,
  theme_light JSONB NOT NULL DEFAULT '{"background":"#f8fafc","surface":"#ffffff","textMain":"#0f172a","textMuted":"#64748b","border":"#e2e8f0","accent":"#3b82f6","success":"#10b981","warning":"#f59e0b","error":"#ef4444"}',
  theme_dark JSONB NOT NULL DEFAULT '{"background":"#0f172a","surface":"#1e293b","textMain":"#f8fafc","textMuted":"#94a3b8","border":"transparent","accent":"#6366f1","success":"#22c55e","warning":"#eab308","error":"#ef4444"}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. FUNÇÕES DE SEGURANÇA
-- =============================================

-- has_role: verifica se usuario tem determinada role (SECURITY DEFINER evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- get_user_role: retorna a role principal do usuario
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- handle_new_user: trigger que cria profile + role ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, whatsapp, cro, status, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    NEW.raw_user_meta_data->>'cro',
    'pending',
    '{"theme":"light","language":"pt-br"}'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.app_role,
      'client'
    )
  );

  RETURN NEW;
END;
$$;

-- update_updated_at: trigger genérico para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================
-- 4. TRIGGERS
-- =============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. RLS
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- USER_ROLES policies
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- MATERIALS policies
CREATE POLICY "Users can view allowed materials"
  ON public.materials FOR SELECT
  TO authenticated
  USING (
    active = true
    AND public.get_user_role(auth.uid()) = ANY(allowed_roles)
  );

CREATE POLICY "Admins can manage materials"
  ON public.materials FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- MATERIAL_ASSETS policies
CREATE POLICY "Users can view assets of allowed materials"
  ON public.material_assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.materials m
      WHERE m.id = material_id
        AND m.active = true
        AND public.get_user_role(auth.uid()) = ANY(m.allowed_roles)
    )
  );

CREATE POLICY "Admins can manage material assets"
  ON public.material_assets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ACCESS_LOGS policies
CREATE POLICY "Authenticated users can insert logs"
  ON public.access_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all logs"
  ON public.access_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- SYSTEM_CONFIG policies
CREATE POLICY "Anyone can read system config"
  ON public.system_config FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can update system config"
  ON public.system_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert system config"
  ON public.system_config FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =============================================
-- 6. DADOS INICIAIS
-- =============================================

INSERT INTO public.system_config (id, app_name) VALUES (1, 'Hub Conexão')
ON CONFLICT (id) DO NOTHING;
