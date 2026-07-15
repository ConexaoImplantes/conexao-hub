## Objetivo

Adicionar **permissões por usuário (overrides)** ao sistema granular existente, mantendo o padrão por role como base, e garantir que **toda a UI (botões, ícones, abas, colunas, dados)** respeite a permissão efetiva — se não tem permissão, o elemento **não renderiza**.

---

## Modelo de permissão efetiva

Precedência (do mais forte para o mais fraco):

1. **Super Admin** → tudo liberado, sempre.
2. **Override do usuário** (`user_permissions`), com dois tipos:
  - `grant` → concede permissão extra além da role.
  - `revoke` → remove permissão que a role concederia.
3. **Permissões da role** (`role_permissions`) — comportamento atual.

Regra: `has_permission(user, key) = super_admin? OR (role_has(key) AND NOT revoked_for_user) OR granted_for_user`.

Delete continua **exclusivo do Super Admin** — não entra nem em role nem em override.

---

## Backend

Nova tabela `user_permissions`:

- `user_id uuid` → `auth.users`
- `permission_key text` → `permissions.key`
- `effect text CHECK IN ('grant','revoke')`
- `created_at`, `created_by`
- PK `(user_id, permission_key)`
- RLS: leitura pelo próprio usuário e por super_admin; escrita só super_admin.
- GRANTs para `authenticated` e `service_role`.

Atualizar `has_permission(_user_id, _permission)`:

```sql
super_admin
OR EXISTS (user_permissions where effect='grant')
OR (
  EXISTS (role_permissions via user_roles) 
  AND NOT EXISTS (user_permissions where effect='revoke')
)
```

Nova RPC/view `get_effective_permissions(_user_id)` retornando o `Set` final — usada pelo `PermissionsContext` para carregar de uma vez.

---

## Frontend — Context

`PermissionsContext` passa a:

- Carregar via `get_effective_permissions(auth.uid())` em uma única chamada.
- Expor `loadUserOverrides(userId)` e `saveUserOverrides(userId, grants[], revokes[])` para a UI de admin.
- Recomputar ao trocar usuário logado.

---

## Frontend — Admin: nova subaba "Por Usuário"

Dentro da aba **Permissões**, duas subabas:

- **Por Papel** (a matriz atual).
- **Por Usuário** (nova):
  - Campo de busca/select de usuário (nome/email).
  - Mostra a role e as permissões herdadas (checkbox marcado, cinza).
  - Para cada permissão: três estados — `herdado`, `conceder` (grant), `revogar` (revoke).
  - Resumo "Efetivo" no topo (contadores).
  - Botões: Salvar, Descartar, Limpar overrides.
  - Log de auditoria a cada save.

---

## Enforcement completo no frontend (Mantendo como padrão o que cada um pode ver e fazer hoje sem quebrar o dar permissões de MANAGER a usuários que não são MANAGER)

Varredura e substituição de **toda checagem `user.role === '...'**` por `<Can>` / `usePermission()` nos arquivos:

- `Admin.tsx` — abas, subabas (inclusive **Convites de Cadastro** → botão "Gerar convite" só com `invites.create`, "Gerar link" só com `invites.generate_link`, toggle ativo só com `invites.toggle_active`, reenvio só com `invites.resend`).
- `MaterialCard`, `MaterialFormModal`, `AssetManagerModal` — botões editar/ativar/gerir idiomas.
- `CollectionCard`, `CollectionFormModal` — idem para trilhas.
- `UserEditModal`, `RejectUserModal`, `UserCommunicationModal` — ações de usuários.
- `Dashboard.tsx` / `ManagerDashboard.tsx` / `Layout.tsx` — itens de menu e cards.
- `ThemeEditorPanel`, `PermissionsPanel`, `AuditLogPanel` — visibilidade das próprias abas.

Padrão: elementos sem permissão **não renderizam** (não ficam apenas desabilitados), inclusive colunas de tabela que só contenham ações negadas.

Rotas inteiras protegidas por `<RequirePermission>` — se o usuário perder `settings.view`, a subaba some do menu e a URL redireciona.

---

## Migração de dados

- Nenhum override criado por padrão → comportamento atual preservado.
- Seed apenas do schema + função atualizada.

---

## Entrega

Uma única leva:

1. Migração (`user_permissions` + `has_permission` + `get_effective_permissions` + RLS/GRANTs).
2. Extensão do `PermissionsContext` + UI "Por Usuário".
3. Varredura e substituição de checagens hardcoded em todos os componentes listados.
4. Auditoria de cada alteração de override.

Confirma para eu implementar?