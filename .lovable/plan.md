

# Plano: Integrar Supabase com Scripts SQL Completos

## Resumo

Para conectar a aplicacao ao Supabase, precisamos:
1. Ativar o Supabase (via Lovable Cloud ou projeto externo)
2. Criar todas as tabelas, tipos, funcoes e politicas de seguranca (RLS)
3. Atualizar o `supabaseClient.ts` para usar as credenciais reais

## Passo 1 -- Conectar ao Supabase

Antes de rodar qualquer SQL, e necessario conectar um projeto Supabase. Usaremos o **Lovable Cloud** (recomendado) para criar o backend automaticamente.

## Passo 2 -- Scripts SQL (Migrations)

Serao criadas as seguintes estruturas no banco:

### 2.1 Tipos Enum

```text
app_role: client | distributor | consultant | super_admin
app_status: pending | active | inactive | rejected
material_type: pdf | image | video
translation_status: draft | review | published
app_language: pt-br | en-us | es-es
```

### 2.2 Tabelas

```text
+-------------------+       +-------------------+
|     profiles      |       |    user_roles     |
+-------------------+       +-------------------+
| id (uuid, PK, FK)|<------| user_id (FK)      |
| email             |       | role (app_role)   |
| name              |       +-------------------+
| whatsapp          |
| cro               |       +-------------------+
| allowed_types     |       |    materials      |
| status            |       +-------------------+
| preferences       |       | id (uuid, PK)     |
+-------------------+       | title (jsonb)     |
                            | type              |
+-------------------+       | allowed_roles     |
|  material_assets  |       | active            |
+-------------------+       +-------------------+
| id (uuid, PK)    |
| material_id (FK)  |       +-------------------+
| language          |       |   access_logs     |
| url               |       +-------------------+
| subtitle_url      |       | id (uuid, PK)     |
| status            |       | material_id (FK)  |
+-------------------+       | user_id (FK)      |
                            | language          |
+-------------------+       | timestamp         |
|  system_config    |       +-------------------+
+-------------------+
| id (int, PK)     |
| app_name          |
| logo_url          |
| webhook_url       |
| theme_light       |
| theme_dark        |
+-------------------+
```

**Tabelas:**
- **profiles** -- perfis de usuario, ligada a `auth.users`
- **user_roles** -- tabela separada para roles (seguranca contra escalacao de privilegios)
- **materials** -- materiais (PDF, imagem, video) com titulo multilíngue
- **material_assets** -- arquivos/URLs por idioma para cada material
- **access_logs** -- registro de acessos a materiais
- **system_config** -- configuracoes globais (nome, logo, cores de tema)

### 2.3 Funcoes de Seguranca

- `has_role(user_id, role)` -- verifica role sem recursao RLS
- `get_user_role(user_id)` -- retorna a role do usuario
- `handle_new_user()` -- trigger que cria profile + role ao registrar

### 2.4 Politicas RLS

Cada tabela tera RLS habilitado com politicas especificas:

- **profiles**: usuarios leem/editam apenas seu proprio perfil; admins leem todos
- **user_roles**: somente leitura propria; admins gerenciam
- **materials**: leitura filtrada por role; admins fazem CRUD completo
- **material_assets**: mesma logica de materials
- **access_logs**: insert por autenticados; select por admins
- **system_config**: leitura publica; escrita por admins

### 2.5 Dados Iniciais

- Inserir registro padrao em `system_config` com temas light/dark

## Passo 3 -- Atualizar Codigo

- Atualizar `supabaseClient.ts` para usar as credenciais do Lovable Cloud
- Atualizar `mockDb.ts` para ler role da tabela `user_roles` ao mapear profiles
- Atualizar `AuthContext.tsx` para inserir na `user_roles` ao registrar/criar perfil
- Atualizar `types.ts` se necessario

## Secao Tecnica -- SQL Completo

A migration contera aproximadamente:

1. Criacao de 5 enums
2. Criacao de 6 tabelas com constraints e defaults
3. Criacao de 3 funcoes (has_role, get_user_role, handle_new_user)
4. 1 trigger (on_auth_user_created)
5. Habilitacao de RLS em todas as tabelas
6. Aproximadamente 15 politicas RLS
7. Grants para anon/authenticated/service_role
8. Insert inicial em system_config

