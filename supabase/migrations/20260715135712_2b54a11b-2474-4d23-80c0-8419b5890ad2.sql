
-- =========================================================================
-- 1. CATÁLOGO DE PERMISSÕES
-- =========================================================================
CREATE TABLE public.permissions (
  key TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read permissions catalog"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admin manages permissions catalog"
  ON public.permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================================
-- 2. ROLE ↔ PERMISSION
-- =========================================================================
CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL,
  permission_key TEXT NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role, permission_key)
);

GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read role permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admin manages role permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================================
-- 3. has_permission()
-- =========================================================================
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'super_admin')
    OR EXISTS (
      SELECT 1
      FROM public.role_permissions rp
      JOIN public.user_roles ur ON ur.role = rp.role
      WHERE ur.user_id = _user_id
        AND rp.permission_key = _permission
    );
$$;

-- =========================================================================
-- 4. AUDIT LOGS
-- =========================================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_role TEXT,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  entity_label TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX audit_logs_user_id_idx ON public.audit_logs (user_id);
CREATE INDEX audit_logs_module_idx ON public.audit_logs (module);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin reads all audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users insert own audit rows"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- (no UPDATE, no DELETE policies → tabela imutável para usuários)

-- =========================================================================
-- 5. SEED — CATÁLOGO
-- =========================================================================
INSERT INTO public.permissions (key, module, label, description, sort_order) VALUES
  -- Materiais
  ('materials.view',            'materials',     'Visualizar materiais',            'Acessar a tela de materiais',                10),
  ('materials.create',          'materials',     'Criar materiais',                 'Adicionar novos materiais',                  11),
  ('materials.edit',            'materials',     'Editar materiais',                'Alterar materiais existentes',               12),
  ('materials.toggle_active',   'materials',     'Ativar/Desativar materiais',      'Ligar ou desligar materiais',                13),
  ('materials.manage_assets',   'materials',     'Gerenciar idiomas do material',   'Adicionar/editar traduções e assets',        14),
  ('materials.reorder',         'materials',     'Reordenar materiais',             'Alterar ordem dos materiais',                15),

  -- Coleções / Trilhas
  ('collections.view',          'collections',   'Visualizar trilhas',              'Acessar a tela de trilhas',                  20),
  ('collections.create',        'collections',   'Criar trilhas',                   'Adicionar novas trilhas',                    21),
  ('collections.edit',          'collections',   'Editar trilhas',                  'Alterar trilhas existentes',                 22),
  ('collections.toggle_active', 'collections',   'Ativar/Desativar trilhas',        'Ligar ou desligar trilhas',                  23),
  ('collections.manage_items',  'collections',   'Gerenciar itens da trilha',       'Adicionar/remover materiais da trilha',      24),
  ('collections.reorder',       'collections',   'Reordenar itens da trilha',       'Alterar ordem dos itens da trilha',          25),

  -- Usuários
  ('users.view',                'users',         'Visualizar usuários',             'Acessar a lista de usuários',                30),
  ('users.create',              'users',         'Criar usuários',                  'Cadastrar novos usuários',                   31),
  ('users.edit',                'users',         'Editar usuários',                 'Alterar dados de usuários',                  32),
  ('users.toggle_active',       'users',         'Ativar/Desativar usuários',       'Bloquear ou reativar usuários',              33),
  ('users.change_role',         'users',         'Alterar role de usuários',        'Mudar a função de um usuário',               34),
  ('users.approve_pending',     'users',         'Aprovar cadastros pendentes',     'Aprovar ou rejeitar cadastros',              35),

  -- Convites / Credenciais
  ('invites.view',              'invites',       'Visualizar convites',             'Acessar a tela de convites',                 40),
  ('invites.create',            'invites',       'Criar convites',                  'Gerar novos tokens de convite',              41),
  ('invites.generate_link',     'invites',       'Gerar link de convite',           'Preparar link/mensagem para compartilhar',   42),
  ('invites.toggle_active',     'invites',       'Ativar/Desativar convites',       'Habilitar ou desabilitar tokens',            43),
  ('invites.resend',            'invites',       'Reenviar convites',               'Reencaminhar convite ao destinatário',       44),

  -- Gamificação
  ('gamification.view',         'gamification',  'Visualizar gamificação',          'Acessar níveis e XP',                        50),
  ('gamification.edit_levels',  'gamification',  'Editar níveis',                   'Configurar níveis de gamificação',           51),
  ('gamification.edit_xp',      'gamification',  'Editar XP dos materiais',         'Configurar XP padrão por material',          52),

  -- Configurações
  ('settings.view',             'settings',      'Visualizar configurações',        'Acessar a tela de configurações',            60),
  ('settings.edit_branding',    'settings',      'Editar identidade visual',        'Alterar branding (logo, nome, marca)',       61),
  ('settings.edit_theme',       'settings',      'Editar tema',                     'Alterar cores e tokens do tema',             62),
  ('settings.edit_environment', 'settings',      'Editar ambientes',                'Configurar temas por ambiente',              63),

  -- Analytics
  ('analytics.view_all',        'analytics',     'Visualizar analytics',            'Ver relatórios e métricas',                  70),
  ('analytics.export',          'analytics',     'Exportar relatórios',             'Exportar dados de analytics',                71)
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- 6. SEED — DEFAULTS POR ROLE
-- =========================================================================

-- super_admin: todas
INSERT INTO public.role_permissions (role, permission_key)
SELECT 'super_admin'::public.app_role, key FROM public.permissions
ON CONFLICT DO NOTHING;

-- manager: todos os .view + invites.* (exceto delete que nem existe no catálogo)
INSERT INTO public.role_permissions (role, permission_key)
SELECT 'manager'::public.app_role, key FROM public.permissions
WHERE key LIKE '%.view%'
   OR key LIKE 'invites.%'
   OR key = 'users.approve_pending'
ON CONFLICT DO NOTHING;

-- consultant: view de materials, collections, gamification
INSERT INTO public.role_permissions (role, permission_key)
VALUES
  ('consultant', 'materials.view'),
  ('consultant', 'collections.view'),
  ('consultant', 'gamification.view')
ON CONFLICT DO NOTHING;

-- distributor: mesmo escopo do consultant
INSERT INTO public.role_permissions (role, permission_key)
VALUES
  ('distributor', 'materials.view'),
  ('distributor', 'collections.view'),
  ('distributor', 'gamification.view')
ON CONFLICT DO NOTHING;

-- client: view de materials e collections
INSERT INTO public.role_permissions (role, permission_key)
VALUES
  ('client', 'materials.view'),
  ('client', 'collections.view')
ON CONFLICT DO NOTHING;
