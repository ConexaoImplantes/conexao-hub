

## Plano: Adicionar tipo "Página Interativa" (html)

### Resumo
Adicionar `html` como novo `MaterialType` no banco e no front-end. Para usuários finais, exibir como **"Página Interativa"**. Para o Super Admin, mostrar "HTML" internamente nos seletores técnicos.

### 1. Migração de banco de dados
```sql
ALTER TYPE public.material_type ADD VALUE IF NOT EXISTS 'html';
```

### 2. `src/types.ts`
- Adicionar `'html'` ao tipo `MaterialType`

### 3. Traduções (`src/contexts/LanguageContext.tsx`)
- pt-br: `'material.type.html': 'Página Interativa'`
- en-us: `'material.type.html': 'Interactive Page'`
- es-es: `'material.type.html': 'Página Interactiva'`
- Adicionar `'filter.html': 'Interativo'` / `'Interactive'` / `'Interactivo'` para filtros do Dashboard

### 4. `MaterialCard.tsx`
- Adicionar `case 'html'` no ícone (`Globe`), label, gradiente e borda

### 5. `MaterialFormModal.tsx`
- Adicionar `TypeCard` para `html` com ícone `Globe` e label "HTML" (visível só para admin)

### 6. `ViewerModal.tsx`
- Adicionar renderização para `material.type === 'html'`: `<iframe sandbox="allow-scripts allow-same-origin" src={asset.url}>` em tela cheia

### 7. `Dashboard.tsx`
- Adicionar botão de filtro `html` com ícone `Globe` na sidebar
- Incluir contagem `html` no objeto `counts`

### 8. `Admin.tsx` e `ManagerDashboard.tsx`
- Adicionar `<option value="html">` nos selects de filtro por tipo

### 9. Atualizar manuais (`docs/`)
- Mencionar o novo tipo "Página Interativa" nos manuais de cliente, gestor e admin

### Arquivos afetados
- 1 migração SQL
- `src/types.ts`
- `src/contexts/LanguageContext.tsx`
- `src/components/hub/MaterialCard.tsx`
- `src/components/hub/MaterialFormModal.tsx`
- `src/components/hub/ViewerModal.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Admin.tsx`
- `src/pages/ManagerDashboard.tsx`
- `docs/manual-cliente.md`, `docs/manual-gestor.md`, `docs/manual-admin.md`

