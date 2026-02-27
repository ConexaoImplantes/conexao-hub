

## Diagnóstico

### Cor roxa encontrada
Em `src/pages/Dashboard.tsx`, linhas 424 e 459, há `rgba(168,85,247,0.1)` hardcoded nos gradientes dos banners de "Trilhas" e "Materiais Disponíveis". Esse roxo não faz parte do branding.

### Cores hardcoded fora do sistema de temas
Encontrei dezenas de cores Tailwind hardcoded (`text-yellow-400`, `fill-yellow-400`, `text-green-600`, `bg-green-500/10`, `text-blue-400`, `text-orange-500`, `bg-red-500/10`, etc.) espalhadas por:
- `Dashboard.tsx` — estrelas XP, status badges
- `ManagerDashboard.tsx` — status badges, ranking medals, ícones
- `MaterialCard.tsx`, `CollectionCard.tsx` — estrelas XP
- `Layout.tsx` — estrela de nível
- `ThemeEditorPanel.tsx` — ícones Sun/Moon
- `UserEditModal.tsx` — status select
- `CollectionFormModal.tsx`, `MaterialFormModal.tsx` — ícone XP
- `TrailCompletionCelebration.tsx` — estrela XP
- `SqlSetupModal.tsx` — ícone database

Essas cores não são controladas pelo editor de temas do super_admin.

---

## Plano de Implementação

### 1. Remover roxo do Dashboard
Substituir `rgba(168,85,247,0.1)` por `color-mix(in srgb, var(--color-gradient-mid) 10%, transparent)` nas linhas 424 e 459.

### 2. Substituir todas as cores Tailwind hardcoded por variáveis CSS do tema
Em todos os arquivos listados acima, trocar:
- `text-yellow-400` / `fill-yellow-400` → `style={{ color: 'var(--color-warning)' }}` (estrelas XP)
- `text-green-600` / `bg-green-500/10` → `style={{ color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg)' }}`
- `text-red-600` / `bg-red-500/10` → `style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)' }}`
- `text-yellow-600` / `bg-yellow-500/10` → `style={{ color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-bg)' }}`
- `text-blue-400` / `text-blue-500` → `style={{ color: 'var(--color-accent)' }}`
- `text-orange-500` → `style={{ color: 'var(--color-warning)' }}`
- `bg-yellow-100 text-yellow-700` (medals) → variáveis do tema
- `bg-gray-100 text-gray-700` (medals) → variáveis do tema
- `bg-orange-100 text-orange-700` (medals) → variáveis do tema

### Arquivos a editar (~10)
1. `src/pages/Dashboard.tsx` — roxo + estrelas
2. `src/pages/ManagerDashboard.tsx` — status, medals, ícones
3. `src/components/hub/MaterialCard.tsx` — estrela XP
4. `src/components/hub/CollectionCard.tsx` — estrela XP
5. `src/components/hub/Layout.tsx` — estrela nível
6. `src/components/hub/ThemeEditorPanel.tsx` — ícones Sun/Moon
7. `src/components/hub/UserEditModal.tsx` — status select
8. `src/components/hub/CollectionFormModal.tsx` — ícone XP
9. `src/components/hub/MaterialFormModal.tsx` — ícone XP
10. `src/components/hub/TrailCompletionCelebration.tsx` — estrela XP

### Resultado
Todas as cores visíveis da aplicação passarão a ser controladas pelos ~38 tokens do editor de temas no Admin. Nenhuma cor hardcoded restará nos componentes.

