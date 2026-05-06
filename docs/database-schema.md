# 🗄️ Database Schema — Hub Conexão

> Documentação técnica do banco de dados (Lovable Cloud / Supabase Postgres). Atualizado em maio/2026.

---

## 📑 Índice

1. [Visão geral](#1-visão-geral)
2. [Enums](#2-enums)
3. [Tabelas](#3-tabelas)
4. [Funções (DB Functions)](#4-funções-db-functions)
5. [Triggers](#5-triggers)
6. [Edge Functions](#6-edge-functions)
7. [Storage Buckets](#7-storage-buckets)
8. [Convenções de RLS](#8-convenções-de-rls)

---

## 1. Visão geral

A plataforma usa **Lovable Cloud** (Postgres gerenciado via Supabase) com:
- **Auth**: `auth.users` gerenciado pelo Supabase Auth (signup/login com email+senha).
- **RLS**: ativado em **todas** as tabelas públicas (modo PERMISSIVE).
- **Roles**: armazenadas em `user_roles` (nunca em `profiles`) para evitar privilege escalation.
- **Trigger `handle_new_user`**: cria automaticamente `profiles` + `user_roles` quando um usuário se registra.
- **Hard delete**: feito exclusivamente pela Edge Function `delete-user` (usa service role).

---

## 2. Enums

| Enum | Valores |
|---|---|
| `app_role` | `super_admin`, `manager`, `consultant`, `distributor`, `client` |
| `app_status` | `pending`, `active`, `inactive`, `rejected` |
| `app_language` | `pt-br`, `en-us`, `es-es` |
| `material_type` | `pdf`, `image`, `video`, `audio`, `html` |
| `translation_status` | `draft`, `review`, `published` |
| `progress_status` | `started`, `completed` |

---

## 3. Tabelas

### 3.1 `profiles`
Dados de perfil dos usuários (espelho de `auth.users`).

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `name` | text | |
| `email` | text | |
| `whatsapp` | text | |
| `cro` | text | apenas para perfil cliente |
| `status` | `app_status` | default `pending` |
| `allowed_types` | `material_type[]` | restrição opcional por tipo |
| `points` | int | XP acumulado |
| `preferences` | jsonb | `{ theme, language }` |
| `rejection_reason` | text | preenchido se status=rejected |

**RLS:** usuários veem/atualizam apenas o próprio perfil. `super_admin` e `manager` veem todos. Apenas `super_admin` faz delete/update de qualquer perfil. **INSERT** é bloqueado (feito via trigger).

### 3.2 `user_roles`
Tabela separada de roles (segurança crítica — nunca mover para `profiles`).

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `user_id` | uuid (refs auth.users) |
| `role` | `app_role` |

**RLS:** usuário lê seu próprio role. `super_admin` gerencia tudo. `manager` lê todos.

### 3.3 `materials`
Cabeçalho dos materiais. O conteúdo por idioma fica em `material_assets`.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `title` | jsonb `{ "pt-br": "...", "en-us": "...", "es-es": "..." }` |
| `type` | `material_type` |
| `allowed_roles` | `app_role[]` |
| `active` | bool |
| `points` | int (XP) |
| `tags` | text[] |
| `category` | text |

**RLS:** `super_admin` gerencia. `manager` lê todos. Demais leem se `active=true` AND seu role ∈ `allowed_roles`.

### 3.4 `material_assets`
Arquivos por idioma de cada material.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `material_id` | uuid |
| `language` | `app_language` |
| `url` | text |
| `subtitle_url` | text |
| `status` | `translation_status` |

**RLS:** mesma lógica de `materials` (via subquery).

### 3.5 `collections` (trilhas)
| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `title` | jsonb |
| `description` | jsonb |
| `cover_image` | text (URL) |
| `allowed_roles` | `app_role[]` |
| `active` | bool |
| `points` | int (XP bônus) |

### 3.6 `collection_items`
Junção materiais ↔ trilhas, com ordem.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `collection_id` | uuid |
| `material_id` | uuid |
| `order_index` | int |

### 3.7 `user_progress`
Progresso por **material** (escopado por trilha quando aplicável).

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `user_id` | uuid |
| `material_id` | uuid |
| `collection_id` | uuid (nullable — distingue progresso solto vs em trilha) |
| `status` | `progress_status` |
| `completed_at` | timestamptz |

**Único:** `(user_id, material_id, collection_id)`.
**RLS:** usuário gerencia o próprio. `super_admin`/`manager` leem todos.

### 3.8 `collection_progress`
Progresso por **trilha**.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `user_id` | uuid |
| `collection_id` | uuid |
| `status` | `progress_status` |
| `started_at` / `completed_at` | timestamptz |

### 3.9 `access_logs` ⭐
Trilha de auditoria de visualizações — alimenta a aba **Métricas**.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `material_id` | uuid |
| `user_id` | uuid |
| `language` | `app_language` |
| `timestamp` | timestamptz default `now()` |

**RLS:**
- INSERT: qualquer autenticado, com `user_id = auth.uid()`.
- SELECT: apenas `super_admin` e `manager`.
- UPDATE/DELETE: bloqueados (logs são imutáveis).

> Toda abertura de material via `ViewerModal` chama `mockDb.logAccess()` → INSERT em `access_logs`. Cobre **todos** os tipos (pdf, image, video, audio, html).

### 3.10 `gamification_levels`
Patentes/níveis configuráveis pelo admin.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `name` | text |
| `min_points` | int |
| `order_index` | int |
| `color` | text (hex), default `#c9a655` |

**RLS:** todos leem; apenas `super_admin` gerencia.

### 3.11 `invite_tokens`
Tokens de convite para cadastro com role pré-definido.

| Coluna | Tipo |
|---|---|
| `id` | uuid PK |
| `token` | text (32 bytes hex) |
| `role` | `app_role` |
| `status` | text (`active`, `used`, `expired`) |
| `used_by` | uuid |
| `used_at` / `expires_at` / `created_at` | timestamptz |

**RLS:** admin gerencia; anon e authenticated podem validar (SELECT).

### 3.12 `system_config`
Configuração global da plataforma (singleton `id=1`).

| Coluna | Tipo |
|---|---|
| `app_name` | text |
| `logo_url` | text |
| `webhook_url` | text |
| `theme_dark` | jsonb (paleta dark — única em uso) |
| `theme_light` | jsonb (legado, mantido por compat de schema) |
| `theme_mode` | jsonb `{ mode, defaultTheme }` |
| `environment_themes` | jsonb (overrides por ambiente: auth/client/manager/admin) |

> O app opera em **dark mode permanente**. `theme_light` é mantido apenas para compat e não é consumido pelo frontend.

**RLS:** todos leem (público); apenas `super_admin` faz UPDATE/INSERT.

---

## 4. Funções (DB Functions)

Todas com `SECURITY DEFINER` + `SET search_path = public`.

| Função | Retorno | Descrição |
|---|---|---|
| `has_role(_user_id, _role)` | bool | True se o usuário possui o role. Usada em todas as RLS policies. |
| `get_user_role(_user_id)` | `app_role` | Retorna o role do usuário (LIMIT 1). |
| `handle_new_user()` | trigger | Cria `profiles` + `user_roles` ao inserir em `auth.users`. Lê `raw_user_meta_data` (`name`, `whatsapp`, `cro`, `role`). |
| `update_updated_at_column()` | trigger | Atualiza `updated_at = now()` em UPDATEs. |
| `validate_invite_token_expiry()` | trigger | Garante `expires_at > now()` ao inserir convite. |

---

## 5. Triggers

> O schema introspection atual reporta **0 triggers ativos** no schema público. Os triggers `handle_new_user` (em `auth.users`), `update_updated_at_column` e `validate_invite_token_expiry` devem ser conferidos via Lovable Cloud — se ausentes, recriar via migration.

---

## 6. Edge Functions

Localizadas em `supabase/functions/`.

| Função | Verify JWT | Propósito |
|---|---|---|
| `delete-user` | sim | Hard delete sincronizado de `auth.users` + `profiles` + `user_roles` (usa SERVICE_ROLE_KEY). Único caminho permitido para excluir usuários. |
| `generate-trail-cover` | sim | Gera capa Navy/Gold para trilhas via Lovable AI (Gemini image). Salva em bucket `trail-covers`. |
| `translate-title` | sim | Traduz título do material (PT↔EN↔ES) via Lovable AI Gateway (Gemini). |

**Secrets configurados**: `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_PUBLISHABLE_KEY`.

---

## 7. Storage Buckets

| Bucket | Público | Uso |
|---|---|---|
| `branding` | sim | Logo do app, assets de identidade |
| `materials` | sim | Uploads de materiais (PDF, imagem, áudio, vídeo) |
| `trail-covers` | sim | Capas geradas por IA para trilhas |

---

## 8. Convenções de RLS

- **Modo PERMISSIVE**: políticas combinam por OR. Padrão: 1 policy por role com acesso.
- **`super_admin`**: tem `ALL` em quase todas as tabelas.
- **`manager`**: tem `SELECT` em quase tudo (read-only completo).
- **Demais roles**: gerenciam apenas dados próprios (`user_id = auth.uid()`).
- **`access_logs`**: imutável — somente INSERT (próprio user) e SELECT (admin/manager).
- **Roles em `user_roles`** — NUNCA em `profiles`. Validar sempre via `has_role()`.

---

## 9. Fluxos críticos

### 9.1 Cadastro
1. Usuário envia signup com `email`, `password`, `metadata { name, whatsapp, cro, role }`.
2. Supabase Auth insere em `auth.users`.
3. Trigger `handle_new_user` insere `profiles` (status `pending`) + `user_roles`.
4. Admin aprova → `profiles.status = 'active'`.

### 9.2 Visualização de material
1. Usuário abre material no `ViewerModal`.
2. Frontend chama `mockDb.logAccess(materialId, userId, language)` → INSERT em `access_logs`.
3. Frontend chama `mockDb.upsertProgress(...)` → UPSERT em `user_progress` (com `collection_id` se em trilha).
4. XP é creditado em `profiles.points` (30% ao iniciar, 70% ao concluir).

### 9.3 Conclusão de trilha
1. Quando todos os `collection_items` da trilha estão `completed` para o usuário → UPSERT em `collection_progress` com `status='completed'`.
2. XP bônus da trilha é creditado.

### 9.4 Métricas (Admin/Gestor)
A aba consome:
- `access_logs` → views, histórico, ranking de materiais e usuários, taxa de visualização.
- `user_progress` → conclusões de materiais.
- `collection_progress` → desempenho por trilha (iniciados/concluídos).
- `profiles` + `user_roles` → nome e role de quem acessou (joins manuais no app layer).
