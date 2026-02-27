

# Plano: Gestão de Usuários com Convites Seguros por Token

## Fluxo

```text
Admin gera token (por perfil) ──► Link único: /invite?token=abc123...
                                       │
                                 Pessoa recebe via WhatsApp
                                       │
                                 Acessa link ──► Valida token (não expirado, não usado)
                                       │
                                 Formulário de cadastro (role bloqueado pelo token)
                                       │
                                 Cadastra ──► status: pending, token marcado como usado
                                       │
                                 Tela de progresso (polling a cada 5s)
                                       │
              Admin aprova ou recusa ◄──┘
                    │
    Aprovado ──► Confetti + botão "Fazer Login"
    Recusado ──► Exibe motivo da recusa
```

---

## 1. Migração de Banco de Dados

### Tabela `invite_tokens`
```sql
CREATE TABLE public.invite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  role app_role NOT NULL,
  used_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- Admins gerenciam tudo
CREATE POLICY "Admins manage invite tokens"
  ON public.invite_tokens FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

-- Anon pode validar um token específico (SELECT apenas)
CREATE POLICY "Anon can validate tokens"
  ON public.invite_tokens FOR SELECT TO anon
  USING (true);
```

### Coluna `rejection_reason` em `profiles`
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rejection_reason text;
```

### Realtime para polling de status
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
```

---

## 2. Novo Componente: `RegistrationProgress.tsx`

- Exibido quando `user.status === 'pending'` ou `'rejected'`
- Usa **Realtime** (channel subscribe em `profiles` filtrado por `user.id`) para atualização instantânea do status
- **Pending**: Animação de espera, mensagem "Seu cadastro está em análise"
- **Rejected**: Exibe `rejection_reason`, botão de contato por WhatsApp
- **Active**: Confetti (canvas-confetti já instalado) + botão "Fazer Login" que faz logout e redireciona

---

## 3. Editar `AuthPage.tsx`

- Detectar `?token=xxx` na URL (em vez de `?role=xxx`)
- Validar token via query direta ao banco: `select * from invite_tokens where token = ? and used_at is null and expires_at > now()`
- Se inválido/expirado: exibir erro e bloquear formulário
- Se válido: extrair `role`, preencher e bloquear campo de perfil
- Após registro bem-sucedido: marcar token como `used_by` e `used_at` via update

---

## 4. Editar `App.tsx`

- Após autenticação, se `user.status === 'pending'` ou `'rejected'`, renderizar `<RegistrationProgress />` em vez de `<Dashboard />` ou `<Admin />`

---

## 5. Editar `Admin.tsx` — Painel de Convites

Substituir os links estáticos por:
- **Botão "Gerar Convite"** por perfil (client, distributor, consultant, super_admin)
- **Expiração configurável** (1 dia, 7 dias, 30 dias) via select
- **Lista de tokens gerados** com status (ativo/usado/expirado), data de criação, expiração
- **Copiar link** com token
- **Deletar token** não utilizado

---

## 6. Editar `Admin.tsx` — Aprovação/Rejeição com Motivo

- Botão "Rejeitar" abre modal com campo de texto **obrigatório** para motivo
- Salva `rejection_reason` no perfil e muda status para `rejected`
- Botão "Aprovar" muda status para `active` e limpa `rejection_reason`
- Atualizar `handleUserStatus` para aceitar `rejectionReason` opcional

---

## 7. Novo Componente: `RejectUserModal.tsx`

- Modal simples com textarea para motivo da rejeição
- Botão "Confirmar Rejeição"
- Chamado pelo Admin ao clicar em rejeitar

---

## 8. Editar `mockDb.ts`

- Adicionar CRUD para `invite_tokens` (create, list, delete, markUsed)
- Atualizar `updateUserStatus` para aceitar e salvar `rejection_reason`
- Adicionar query `getProfileByIdRealtime` ou adaptar `getProfileById` para incluir `rejection_reason`

---

## 9. Editar `UserEditModal.tsx`

- Exibir campo readonly `rejection_reason` quando status é `rejected` (informativo)

---

## Arquivos Afetados

| Arquivo | Ação |
|---|---|
| Nova migração SQL | Criar tabela `invite_tokens` + coluna `rejection_reason` + realtime |
| `src/components/hub/RegistrationProgress.tsx` | **Criar** |
| `src/components/hub/RejectUserModal.tsx` | **Criar** |
| `src/pages/AuthPage.tsx` | Editar (token validation flow) |
| `src/App.tsx` | Editar (pending/rejected routing) |
| `src/pages/Admin.tsx` | Editar (invite panel + reject modal integration) |
| `src/lib/mockDb.ts` | Editar (invite CRUD + rejection reason) |
| `src/components/hub/UserEditModal.tsx` | Editar (show rejection reason) |

