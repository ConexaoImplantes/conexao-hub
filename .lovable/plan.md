## Objetivo

Substituir o controle de acesso baseado apenas em role fixa por um sistema granular onde o **Super Admin define, por role, exatamente quais telas cada usuário vê e quais ações pode executar** (criar, editar, excluir, ativar/desativar, compartilhar, etc.), em todos os módulos da plataforma.

Regras invioláveis:

- **Super Admin** sempre tem todas as permissões (não editável).
- **Exclusão (delete) de qualquer entidade** é permissão exclusiva do Super Admin — não aparece na matriz.
- Permissionamento é **por role** (sem overrides por usuário, conforme decidido).

---

## Catálogo de permissões

Permissões nomeadas no formato `modulo.acao`. Escopo inicial:

**Materiais** — `materials.view`, `materials.create`, `materials.edit`, `materials.toggle_active`, `materials.manage_assets` (idiomas), `materials.reorder`

**Trilhas / Coleções** — `collections.view`, `collections.create`, `collections.edit`, `collections.toggle_active`, `collections.manage_items`, `collections.reorder`

**Usuários & Acessos** — `users.view`, `users.create`, `users.edit`, `users.toggle_active`, `users.change_role`, `users.approve_pending`

**Credenciais / Convites** — `invites.view`, `invites.create`, `invites.generate_link`, `invites.toggle_active`, `invites.resend`

**Gamificação** — `gamification.view`, `gamification.edit_levels`, `gamification.edit_xp`

**Configurações do Sistema** — `settings.view`, `settings.edit_branding`, `settings.edit_theme`, `settings.edit_environment`

**Relatórios / Analytics** — `analytics.view_all`, `analytics.export`

**Nota:** Toda ação de `delete` fica hardcoded como `super_admin only`.

---

## Alterações no backend

Migração única criando:

1. `permissions` (catálogo) — `key TEXT PK`, `module`, `label`, `description`
2. `role_permissions` — `role app_role`, `permission_key`, PK composto
3. Função `has_permission(_user_id uuid, _permission text) RETURNS boolean` (SECURITY DEFINER) — retorna `true` se a role do usuário tem a permissão OU se é `super_admin`
4. Seed do catálogo com todas as permissões acima
5. Seed dos defaults por role (mantendo comportamento atual):
  - `super_admin`: todas
  - `manager`: todas as `.view` + `invites.*` (exceto delete)
  - `consultant`, `distributor`, `client`: apenas `.view` dos módulos que já acessam
6. RLS de `role_permissions`: leitura para authenticated, escrita só para super_admin
7. Atualizar RLS das tabelas afetadas para usar `has_permission()` nas ações críticas (mantendo `has_role('super_admin')` para deletes)

---

## Alterações no frontend

**Novo core** (`src/lib/permissions/`):

- `PermissionsContext.tsx` — carrega e cacheia permissões da role do usuário logado
- `usePermission(key)` — hook booleano
- `<Can permission="materials.create">...</Can>` — componente wrapper
- Guarda de rota `<RequirePermission permission="users.view">` para telas inteiras

**Refatoração dos módulos existentes** (Materiais, Trilhas, Usuários, Convites, Config, Gamificação):

- Substituir checagens `role === 'super_admin'` por `<Can>` / `usePermission`
- Esconder abas/botões conforme permissão
- Mensagem de "sem acesso" quando rota bloqueada

**Nova aba no Admin — "Permissões"**:

- Matriz Role × Permissão (checkboxes agrupados por módulo)
- Coluna `super_admin` sempre marcada e desabilitada
- Botão "Salvar" grava em `role_permissions`
- Botão "Restaurar padrões" reaplica o seed
- Busca por permissão, colapsar/expandir grupos

---

## Migração compatível

O sistema entra ativo com os defaults acima, então **nenhum usuário perde acesso** no momento do deploy. A partir daí o Super Admin pode ajustar livremente pela nova aba.

---

## Detalhes técnicos

- Cache das permissões em memória via Context + invalidação ao trocar de usuário
- Query única no login: `SELECT permission_key FROM role_permissions WHERE role = <user_role>` → `Set<string>` no client
- RLS continua sendo a fonte de verdade — o frontend apenas espelha para UX
- Deletes permanecem via `has_role('super_admin')` direto, não passam pelo catálogo
- Sem breaking changes na API — apenas adição de tabelas e função

---

## Entrega em duas etapas

**Etapa 1 (esta):** infra completa (migração + Context + componente `<Can>` + aba "Permissões" no Admin funcional) + refatoração dos módulos **Materiais** e **Usuários/Convites** para usar o novo sistema.

**Etapa 2 (próxima mensagem sua):** refatorar Trilhas/Coleções, Gamificação, Configurações e Analytics para consumir `<Can>` / `usePermission`.

Divisão evita PR gigante e permite validar a UX da matriz antes de propagar.

Confirma para eu iniciar a Etapa 1?  
  
É IMPORTANTE QUE O LOG DE AÇÕES, PRINCIPALMENTE DE CRUD E COMPARTILHAMENTO SEJA MONITORA EM TABELA SEPARADA NO BANCO DE DADOS PARA AUDITORIA. NOME DO USUÁRIO, DATA/HORA E AÇÃO REALIZADA SÃO OS DADOS IMPORTANTES, SALVO MELHOR JUÍZO

&nbsp;