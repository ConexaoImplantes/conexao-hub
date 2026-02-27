

## Problema

Quando o token é inválido/expirado/usado, o `validateInviteToken` retorna `null` e o `tokenError` é exibido, mas o formulário de cadastro continua visível e funcional. O usuário pode preencher e enviar o cadastro normalmente, criando conta sem convite válido. Além disso, acessar `?role=client` (sem token) também permite cadastro livre.

## Plano de Correção

### 1. Adicionar coluna `status` à tabela `invite_tokens`

**Migration SQL:**
```sql
CREATE TYPE public.invite_token_status AS ENUM ('active', 'used', 'expired');

ALTER TABLE public.invite_tokens 
  ADD COLUMN status public.invite_token_status NOT NULL DEFAULT 'active';

-- Marcar tokens já usados
UPDATE public.invite_tokens SET status = 'used' WHERE used_at IS NOT NULL;

-- Marcar tokens expirados
UPDATE public.invite_tokens SET status = 'expired' WHERE used_at IS NULL AND expires_at < now();
```

### 2. Bloquear formulário quando token inválido

**Arquivo:** `src/pages/AuthPage.tsx`

- Quando `tokenError` estiver definido (token inválido/expirado/usado), **esconder o formulário inteiro** e mostrar apenas a mensagem de erro com um botão "Voltar ao Login"
- Remover o fallback `?role=` sem token — cadastro só é permitido com token válido
- Após submit com sucesso, o token já é marcado como usado via `markInviteTokenUsed`

### 3. Atualizar `validateInviteToken` para usar status

**Arquivo:** `src/lib/mockDb.ts`

- Adicionar filtro `.eq('status', 'active')` na query de validação (além dos filtros existentes de `used_at` e `expires_at`)

### 4. Atualizar `markInviteTokenUsed` para setar status

**Arquivo:** `src/lib/mockDb.ts`

- Incluir `status: 'used'` no update junto com `used_by` e `used_at`

### 5. Exibir status nos tokens do Admin

**Arquivo:** `src/pages/Admin.tsx`

- Mostrar badge de status (`Ativo`, `Usado`, `Expirado`) em cada token na lista de convites
- Calcular status visualmente: se `used_at` → "Usado", se `expires_at < now()` → "Expirado", senão → "Ativo"

