

# Manual de Deploy: Hub Conexao — Vercel + Supabase

## Visao Geral

Este manual descreve como instalar e configurar a plataforma Hub Conexao do zero, usando **Vercel** para hospedar o frontend e um **projeto Supabase independente** como backend (banco de dados, autenticacao e edge functions).

---

## Pre-requisitos

- Conta no GitHub com o repositorio do projeto
- Conta na Vercel (gratuita em vercel.com)
- Conta no Supabase (gratuita em supabase.com)

---

## Parte 1: Configurar o Supabase

### 1.1 Criar o Projeto

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Escolha um nome (ex: `hub-conexao`), defina uma senha para o banco e selecione a regiao mais proxima dos seus usuarios
4. Aguarde a criacao (1-2 minutos)

### 1.2 Copiar Credenciais

Apos a criacao, va em **Settings > API** e anote:

| Credencial | Onde usar |
|---|---|
| **Project URL** | Variavel `VITE_SUPABASE_URL` |
| **anon / public key** | Variavel `VITE_SUPABASE_PUBLISHABLE_KEY` |
| **Project Reference ID** | Variavel `VITE_SUPABASE_PROJECT_ID` (visivel na URL do dashboard) |
| **service_role key** | Somente para scripts administrativos (seed de dados). Nunca exponha no frontend |

### 1.3 Criar o Banco de Dados

1. No dashboard do Supabase, va em **SQL Editor**
2. Copie e execute o script SQL abaixo **na ordem indicada**. Este script cria todas as tabelas, tipos, funcoes e triggers necessarios:

```text
-- =============================================
-- PARTE A: Tipos customizados (Enums)
-- =============================================

CREATE TYPE public.app_role AS ENUM ('client', 'distributor', 'consultant', 'super_admin');
CREATE TYPE public.app_status AS ENUM ('pending', 'active', 'inactive', 'rejected');
CREATE TYPE public.app_language AS ENUM ('pt-br', 'en-us', 'es');
CREATE TYPE public.material_type AS ENUM ('pdf', 'image', 'video');
CREATE TYPE public.translation_status AS ENUM ('draft', 'published');
CREATE TYPE public.progress_status AS ENUM ('started', 'completed');

-- =============================================
-- PARTE B: Tabelas
-- =============================================

-- Perfis de usuario
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  whatsapp text DEFAULT '',
  cro text,
  allowed_types material_type[] DEFAULT '{}',
  status app_status NOT NULL DEFAULT 'pending',
  points integer NOT NULL DEFAULT 0,
  preferences jsonb NOT NULL DEFAULT '{"theme":"light","language":"pt-br"}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Roles de usuario (separada para flexibilidade)
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  UNIQUE(user_id)
);

-- Materiais
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title jsonb NOT NULL DEFAULT '{}',
  type material_type NOT NULL DEFAULT 'pdf',
  allowed_roles app_role[] NOT NULL DEFAULT '{client}',
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  points integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Assets de materiais (arquivos por idioma)
CREATE TABLE public.material_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  language app_language NOT NULL DEFAULT 'pt-br',
  url text NOT NULL,
  subtitle_url text,
  status translation_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Logs de acesso
CREATE TABLE public.access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id uuid REFERENCES public.materials(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  language app_language NOT NULL DEFAULT 'pt-br',
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Configuracao do sistema
CREATE TABLE public.system_config (
  id integer NOT NULL DEFAULT 1 PRIMARY KEY,
  app_name text NOT NULL DEFAULT 'Hub Conexao',
  logo_url text,
  webhook_url text,
  theme_light jsonb NOT NULL DEFAULT '{"error":"#ef4444","accent":"#c9a655","border":"#e2e8f0","success":"#10b981","surface":"#ffffff","warning":"#f59e0b","textMain":"#0f172a","textMuted":"#64748b","background":"#f8fafc"}',
  theme_dark jsonb NOT NULL DEFAULT '{"error":"#ef4444","accent":"#c9a655","border":"transparent","success":"#22c55e","surface":"#1e293b","warning":"#eab308","textMain":"#f8fafc","textMuted":"#94a3b8","background":"#0f172a"}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Colecoes (trilhas)
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title jsonb NOT NULL DEFAULT '{}',
  description jsonb,
  cover_image text,
  allowed_roles app_role[] NOT NULL DEFAULT '{client}',
  points integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Itens de colecao
CREATE TABLE public.collection_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0
);

-- Progresso do usuario em materiais
CREATE TABLE public.user_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  status progress_status NOT NULL DEFAULT 'started',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Progresso do usuario em colecoes
CREATE TABLE public.collection_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  status progress_status NOT NULL DEFAULT 'started',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, collection_id)
);

-- Niveis de gamificacao
CREATE TABLE public.gamification_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  min_points integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#c9a655',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Config publica (view materializada ou tabela espelho)
CREATE TABLE public.system_config_public (
  id integer,
  app_name text,
  logo_url text,
  theme_light jsonb,
  theme_dark jsonb,
  updated_at timestamptz
);

-- Dados iniciais
INSERT INTO public.system_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- =============================================
-- PARTE C: Funcoes
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, whatsapp, cro, status, preferences)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    NEW.raw_user_meta_data->>'cro',
    'pending',
    '{"theme":"light","language":"pt-br"}'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'client'));
  RETURN NEW;
END;
$$;

-- Trigger de criacao automatica de perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers de updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- PARTE D: RLS (Row Level Security)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (has_role(auth.uid(), 'super_admin'));

-- User Roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Materials
CREATE POLICY "Users can view allowed materials" ON public.materials FOR SELECT USING (active = true AND get_user_role(auth.uid()) = ANY(allowed_roles));
CREATE POLICY "Admins can manage materials" ON public.materials FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Material Assets
CREATE POLICY "Users can view assets of allowed materials" ON public.material_assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM materials m WHERE m.id = material_assets.material_id AND m.active = true AND get_user_role(auth.uid()) = ANY(m.allowed_roles)));
CREATE POLICY "Admins can manage material assets" ON public.material_assets FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Access Logs
CREATE POLICY "Admins can view all logs" ON public.access_logs FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Authenticated users can insert logs" ON public.access_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- System Config
CREATE POLICY "Anyone can read system config" ON public.system_config FOR SELECT USING (true);
CREATE POLICY "Admins can update system config" ON public.system_config FOR UPDATE USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can insert system config" ON public.system_config FOR INSERT WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Collections
CREATE POLICY "Users can view allowed active collections" ON public.collections FOR SELECT USING (active = true AND get_user_role(auth.uid()) = ANY(allowed_roles));
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Collection Items
CREATE POLICY "Users can view collection items of allowed collections" ON public.collection_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_items.collection_id AND c.active = true AND get_user_role(auth.uid()) = ANY(c.allowed_roles)));
CREATE POLICY "Admins can manage collection items" ON public.collection_items FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- User Progress
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all progress" ON public.user_progress FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

-- Collection Progress
CREATE POLICY "Users can manage own collection progress" ON public.collection_progress FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all collection progress" ON public.collection_progress FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

-- Gamification Levels
CREATE POLICY "Anyone can view levels" ON public.gamification_levels FOR SELECT USING (true);
CREATE POLICY "Admins can manage levels" ON public.gamification_levels FOR ALL USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Permissoes
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
```

### 1.4 Configurar Autenticacao

1. No dashboard do Supabase, va em **Authentication > Settings**
2. Em **Email Auth**, certifique-se de que:
   - "Enable Email Signup" esta **ativado**
   - "Confirm email" esta configurado conforme sua preferencia
3. Em **URL Configuration**, defina:
   - **Site URL**: a URL final do seu site na Vercel (ex: `https://hubconexao.com.br`)
   - **Redirect URLs**: adicione tambem `http://localhost:8080` para desenvolvimento local

### 1.5 Criar Usuario Admin Inicial

No **SQL Editor** do Supabase, use a aba **Authentication > Users > Add User** para criar o primeiro admin manualmente. Depois, no SQL Editor, promova-o:

```text
-- Substitua 'ID_DO_USUARIO' pelo UUID do usuario criado
UPDATE public.user_roles SET role = 'super_admin' WHERE user_id = 'ID_DO_USUARIO';
UPDATE public.profiles SET status = 'active' WHERE id = 'ID_DO_USUARIO';
```

---

## Parte 2: Preparar o Repositorio

### 2.1 Exportar do Lovable para GitHub

1. No editor Lovable, va em **Settings > GitHub**
2. Conecte e crie o repositorio
3. Aguarde a sincronizacao

### 2.2 Ajustar Variaveis de Ambiente

No repositorio, o arquivo `.env` contem as credenciais do Lovable Cloud. Para produccao com Supabase proprio, voce configurara essas variaveis diretamente na Vercel (Passo 3.2), apontando para o **seu** projeto Supabase.

### 2.3 Criar arquivo `vercel.json`

Na raiz do repositorio, crie o arquivo `vercel.json` para garantir que o roteamento SPA funcione:

```text
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Parte 3: Deploy na Vercel

### 3.1 Importar Projeto

1. Acesse [vercel.com](https://vercel.com) e faca login
2. Clique em **"Add New Project"**
3. Selecione **"Import Git Repository"** e escolha o repositorio do Hub Conexao

### 3.2 Configurar Build e Variaveis

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

Na secao **Environment Variables**, adicione:

| Variavel | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL do **seu** projeto Supabase (ex: `https://xyzabc.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave `anon` do **seu** projeto Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Reference ID do **seu** projeto Supabase |

### 3.3 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (1-2 minutos)
3. A Vercel fornecera uma URL publica automaticamente

---

## Parte 4: Dominio Personalizado (Opcional)

1. Na Vercel, va em **Settings > Domains**
2. Adicione seu dominio (ex: `hubconexao.com.br`)
3. Configure no seu provedor de DNS:
   - **Registro A**: `76.76.21.21`
   - **Registro CNAME** (para www): `cname.vercel-dns.com`
4. Atualize a **Site URL** no Supabase Authentication Settings para o novo dominio
5. SSL e gerado automaticamente pela Vercel

---

## Parte 5: Deploy Automatico (Fluxo Continuo)

Apos a configuracao inicial, o fluxo e automatico:

```text
Lovable (edita codigo)
      |
      v
GitHub (recebe push)
      |
      v
Vercel (detecta mudanca, faz build e deploy)
      |
      | chamadas API
      v
Supabase (banco de dados + autenticacao)
```

Qualquer alteracao enviada ao GitHub dispara um novo deploy automaticamente na Vercel.

---

## Checklist Final

- [ ] Projeto Supabase criado e configurado
- [ ] Script SQL completo executado no SQL Editor
- [ ] Usuario admin criado e promovido
- [ ] Site URL configurada no Supabase Auth
- [ ] Repositorio no GitHub com `vercel.json`
- [ ] Projeto importado na Vercel
- [ ] Variaveis de ambiente apontando para o Supabase proprio
- [ ] Build com sucesso na Vercel
- [ ] Testar login, cadastro e navegacao no site publicado
- [ ] Dominio personalizado (se desejado)

---

## Secao Tecnica: Detalhes da Arquitetura

### Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Hosting**: Vercel (CDN global, SSL automatico, deploys automaticos)

### Seguranca

- Todas as tabelas possuem **Row Level Security (RLS)** ativado
- A chave `anon` (publishable) e segura para exposicao no frontend -- o acesso aos dados e controlado pelas politicas RLS
- A chave `service_role` **nunca** deve ser exposta no frontend
- O trigger `handle_new_user` cria automaticamente o perfil e role ao registrar um novo usuario

### Custos Estimados

| Servico | Plano Gratuito | Plano Pago |
|---|---|---|
| Vercel | 100 GB bandwidth/mes | A partir de $20/mes (Pro) |
| Supabase | 500 MB banco, 50k auth users | A partir de $25/mes (Pro) |

