# SPEC — Hub Conexão (Conexão Digital Implant)

> Especificação técnica consolidada do produto. Atualizado em maio/2026.
> Versão: 1.0 · Status: Produção

---

## 1. Visão Geral

**Hub Conexão** é uma plataforma multi-idioma de compartilhamento de conhecimento e materiais educacionais (PDFs, vídeos, áudios, imagens e páginas HTML interativas) voltada ao ecossistema odontológico (Implant). Oferece trilhas de aprendizado (collections), gamificação por XP, painéis administrativo e gestor com métricas em tempo real, e cadastro exclusivo por convite com role pré-definido.

- **URL pública**: https://conexao-hub.lovable.app
- **Stack**: React 18 + Vite 5 + TypeScript + Tailwind CSS 3 + shadcn/ui + Lovable Cloud (Postgres + Auth + Storage + Edge Functions)
- **AI**: Lovable AI Gateway (Gemini) — geração de capas de trilhas e tradução automática de títulos

---

## 2. Objetivos do Produto

1. Centralizar materiais educacionais com controle granular por **role** (consultor, distribuidor, cliente, gestor, admin).
2. Permitir consumo **multi-idioma** (PT-BR / EN-US / ES-ES) com assets dedicados por idioma.
3. Estruturar conhecimento em **trilhas** com progresso isolado e XP bônus.
4. Mensurar engajamento via **access_logs** imutáveis (toda visualização registrada).
5. Garantir **cadastro controlado** via convite com role embutido no token.
6. Oferecer **identidade visual customizável** por ambiente (auth/cliente/gestor/admin) sem mexer em código.

---

## 3. Personas / Roles

| Role | Capacidades |
|---|---|
| `super_admin` | Acesso total: CRUD em materiais, trilhas, usuários, convites, configurações, tema, gamificação |
| `manager` | Read-only completo (visualiza tudo, sem editar). Acesso via convite. Não tem CRO |
| `consultant` | Consome materiais e trilhas com role `consultant` em `allowed_roles`. Cor: Indigo |
| `distributor` | Idem `consultant` para role `distributor`. Cor: Amber |
| `client` | Consome materiais com role `client`. Único role com campo CRO. Cor: Emerald |

Roles vivem **exclusivamente** em `public.user_roles` (jamais em `profiles`) e são validadas via função `has_role(_user_id, _role)` `SECURITY DEFINER`.

---

## 4. Arquitetura

### 4.1 Frontend
- SPA React Router (rotas: `/`, `/auth`, `/dashboard`, `/admin`, `/manager`).
- Contextos: `AuthContext`, `BrandContext`, `LanguageContext`, `ThemeContext`, `ShortcutContext`.
- **Dark mode permanente** — classe `dark` forçada no `<html>`; proibido usar `dark:` prefix ou classes light.
- Tokens visuais (42 variáveis CSS) injetados dinamicamente a partir de `system_config.theme_dark` e `environment_themes`.
- Camada de dados em `src/lib/mockDb.ts` com fallback local para contas demo `@demo.com`; produção usa Supabase direto.

### 4.2 Backend (Lovable Cloud / Supabase)
- Postgres com **RLS ativo em todas as tabelas públicas** (modo PERMISSIVE).
- Auth nativo (email + senha; sem signups anônimos; verificação de email opcional).
- Storage com 3 buckets públicos: `branding`, `materials`, `trail-covers`.
- 3 Edge Functions (`delete-user`, `generate-trail-cover`, `translate-title`).
- Trigger `handle_new_user` cria automaticamente `profiles` + `user_roles` no signup.

### 4.3 Hospedagem
- Frontend publicado via Lovable (Vercel-like). Configuração SPA rewrites em `vercel.json`.
- Backend e Edge Functions gerenciados pelo Lovable Cloud (deploy automático).

---

## 5. Banco de Dados — Resumo

### Enums
- `app_role`: `super_admin | manager | consultant | distributor | client`
- `app_status`: `pending | active | inactive | rejected`
- `app_language`: `pt-br | en-us | es-es`
- `material_type`: `pdf | image | video | audio | html`
- `translation_status`: `draft | review | published`
- `progress_status`: `started | completed`

### Tabelas
`profiles`, `user_roles`, `materials`, `material_assets`, `collections`, `collection_items`, `user_progress`, `collection_progress`, `access_logs`, `gamification_levels`, `invite_tokens`, `system_config`.

> Detalhes completos de colunas, RLS e relações estão em `docs/database-schema.md`.

### Funções
- `has_role(_user_id uuid, _role app_role) → bool` — `SECURITY DEFINER`
- `get_user_role(_user_id uuid) → app_role`
- `handle_new_user()` — trigger em `auth.users`
- `update_updated_at_column()` — trigger genérico
- `validate_invite_token_expiry()` — trigger em `invite_tokens`

### Storage Buckets
| Bucket | Público | Uso |
|---|---|---|
| `branding` | sim | Logo do app |
| `materials` | sim | Uploads de materiais |
| `trail-covers` | sim | Capas IA das trilhas |

---

## 6. Edge Functions

| Função | Verify JWT | Propósito |
|---|---|---|
| `delete-user` | sim (caller) | Hard delete sincronizado de `auth.users` + `profiles` + `user_roles`. Único caminho permitido. Usa `SERVICE_ROLE_KEY`. |
| `generate-trail-cover` | sim | Gera capa Navy(#0a1e3d)/Gold(#c9a655) 16:9 via Gemini image. Faz upload para bucket `trail-covers`. |
| `translate-title` | sim | Traduz título de material (PT↔EN↔ES) via Gemini 2.5 flash-lite. Retorna `{pt-br, en-us, es-es}`. |

Secrets disponíveis (injetados automaticamente): `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_PUBLISHABLE_KEY`.

---

## 7. Fluxos Críticos

### 7.1 Cadastro por convite
1. Admin gera convite em `/admin` → INSERT em `invite_tokens` (token 32-byte hex, role pré-definido, `expires_at = now() + 7d`).
2. Admin compartilha link `/auth?invite=<token>` via WhatsApp (modal `InviteShareModal`).
3. Convidado abre o link → tela de cadastro valida token (SELECT permitido a anon).
4. Após signup, trigger `handle_new_user` cria `profiles (status=pending)` + `user_roles` com role do token.
5. Convite marcado como `used` (`used_by`, `used_at`).
6. Admin aprova → `profiles.status = 'active'`. Usuário pode logar.

### 7.2 Visualização de material
1. `ViewerModal` abre material → INSERT em `access_logs` (imutável).
2. UPSERT em `user_progress` com `status='started'` (+ `collection_id` se em trilha).
3. XP creditado: 30% ao iniciar, 70% ao concluir.
4. Trilha conclui automaticamente quando todos os `collection_items` estão `completed` para o usuário → UPSERT em `collection_progress` com XP bônus.

### 7.3 Métricas (Admin/Gestor)
Consome `access_logs` (views/ranking), `user_progress` (conclusões), `collection_progress` (trilhas), `profiles` + `user_roles` (joins manuais no app layer — Supabase RLS não suporta joins automáticos seguros).

### 7.4 Hard delete de usuário
Apenas via Edge Function `delete-user` (caller deve ser `super_admin`, não pode auto-deletar). Deleta `user_roles` → `profiles` → `auth.users` nessa ordem.

---

## 8. Convenções Críticas

- **Segurança**: roles SEMPRE em `user_roles`; nunca confiar em client-side storage para admin checks.
- **RLS**: modo PERMISSIVE; padrão = 1 policy por role com acesso. `access_logs` imutável (sem UPDATE/DELETE).
- **Dark mode**: classe `dark` forçada; proibido `dark:` prefix ou `bg-white`.
- **Cores**: somente tokens CSS (`var(--color-*)`); nunca hardcode hex em componentes.
- **Notificações**: somente `sonner` toasts; nunca `alert()`.
- **Mobile**: tabelas viram card-lists; modais viram bottom sheets.
- **i18n**: `LanguageContext` custom (sem i18next).
- **Joins**: profiles e user_roles fetched separadamente, merge no app layer.
- **system_config**: acessar via view `system_config_public` ou helper (ocultar URLs internas).

---

## 9. Documentos relacionados

- `docs/requirements.md` — Requisitos funcionais e não-funcionais
- `docs/design.md` — Design system, identidade visual, tokens
- `docs/tasks.md` — Backlog/roadmap de tarefas
- `docs/database-schema.md` — Schema detalhado com RLS
- `docs/branding-guide.md`, `docs/design-system-dark.md` — Identidade visual
- `docs/manual-admin.md`, `docs/manual-gestor.md`, `docs/manual-cliente.md`, `docs/manual-cadastro.md` — Manuais por persona
- `docs/deploy-vps.md` — Deploy alternativo
- `docs/demo-credentials.md` — Contas mock
