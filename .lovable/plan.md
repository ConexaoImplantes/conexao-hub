

## Plano: Ambiente de Gestores (role `manager`)

### Escopo
Criar o perfil **Gestor** (`manager`) com acesso somente-leitura a: Materiais, Usuários, Trilhas (com timeline) e Métricas. Sem ações de edição/exclusão/exportação. Formulário de cadastro idêntico ao de consultores. Links de convite específicos.

### Estimativa de tokens
~8.000–12.000 tokens de código (equivale a ~4-6 mensagens de implementação).

---

### Alterações

**1. Migração SQL — adicionar `manager` ao enum `app_role`**
```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
```

**2. RLS — permitir SELECT para managers nas tabelas relevantes**
- `materials`, `material_assets`: adicionar policy SELECT para `has_role(auth.uid(), 'manager')` (ver todos, inclusive inativos)
- `profiles`, `user_roles`: adicionar policy SELECT para managers (ver todos os usuários)
- `collections`, `collection_items`: adicionar policy SELECT para managers
- `access_logs`: adicionar policy SELECT para managers
- `gamification_levels`: já tem SELECT público, OK

**3. `src/types.ts`**
- Adicionar `'manager'` ao tipo `Role`

**4. `src/contexts/LanguageContext.tsx`**
- Traduções: "Gestor" / "Manager" / "Gestor"

**5. `src/contexts/AuthContext.tsx` + `src/lib/mockDb.ts`**
- Adicionar mock user para manager
- Rota condicional: manager não é admin nem usuário comum → precisa de página própria

**6. `src/App.tsx` — roteamento**
- Se `user.role === 'manager'` → renderizar `<ManagerDashboard />`

**7. NOVO: `src/pages/ManagerDashboard.tsx`**
Página read-only com 4 abas:
- **Materiais**: tabela com Título, Tipo, Status, Permissões (roles), Assets (idiomas), XP. Sem botões de editar/excluir/ativar.
- **Usuários**: tabela com Nome, Email, WhatsApp, Perfil (role), Permissões, Status. Sem exportar CSV, sem editar/excluir.
- **Trilhas**: cards de coleções. Ao clicar, abre timeline vertical com materiais da trilha (título, tipo, XP).
- **Métricas**: gráficos de acesso (reutilizar lógica do Admin analytics) — sem exportar CSV/PDF.

**8. `src/pages/Admin.tsx` — convites**
- Adicionar `manager` na lista de roles do gerador de convites
- Adicionar `manager` nos filtros de usuários

**9. `src/pages/AuthPage.tsx`**
- Mapeamento de label para `manager`: "Gestores"
- Formulário de cadastro do manager = mesmo do consultant (nome, email, senha, whatsapp — sem CRO)

**10. `src/components/hub/Layout.tsx`**
- Garantir que o layout funcione para managers (header, logout, etc.)

---

### O que o Gestor NÃO pode fazer
- Editar, excluir, ativar/desativar materiais
- Editar, excluir, aprovar/rejeitar usuários
- Exportar CSV ou PDF
- Alterar configurações, temas, gamificação
- Criar convites (apenas super_admin)

