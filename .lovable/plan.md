# Remoção de Roxo/Indigo - Substituição por Dourado

## Objetivo

Eliminar completamente todas as referências a cores roxas (purple) do projeto, substituindo-as por tons de dourado (#c9a655 e variações) conforme a identidade visual da Conexão Digital Implant: Azul Marinho Profundo + Dourado.

## Paleta de Substituição


| Cor Atual                        | Nova Cor                       | Uso                        |
| -------------------------------- | ------------------------------ | -------------------------- |
| `purple-500`                     | `amber-600` / `yellow-600`     | Ícones, textos, bordas     |
| `purple-600`                     | `amber-700` / `yellow-700`     | Gradientes mais escuros    |
| `purple-500/10`, `purple-500/20` | `amber-500/10`, `amber-500/20` | Backgrounds com opacidade  |
| `indigo-500`                     | `amber-600`                    | Destaques e acentos        |
| `indigo-400`                     | `amber-400`                    | Variante clara (dark mode) |
| `#6366f1` (accent dark)          | `#c9a655`                      | Cor accent do tema escuro  |
| `pink-500` (blob)                | `amber-400`                    | Efeito decorativo de fundo |


## Arquivos Afetados (7 arquivos)

### 1. `src/contexts/BrandContext.tsx`

- Alterar o accent do tema escuro de `#6366f1` para `#c9a655` (dourado)

### 2. `src/lib/mockDb.ts`

- Mesma alteração do accent dark: `#6366f1` para `#c9a655`

### 3. `src/index.css`

- Alterar `--color-accent: #6366f1` na seção `:root` para `#c9a655`

### 4. `src/components/hub/GlobalEffects.tsx`

- `bg-purple-500` para `bg-amber-500` (blob superior esquerdo)
- `bg-pink-500` para `bg-amber-400` (blob inferior)

### 5. `src/components/hub/Layout.tsx`

- Logo fallback: `from-blue-500 to-purple-600` para `from-blue-900 to-amber-600`
- Avatar: `from-blue-500 to-purple-500` para `from-blue-900 to-amber-500`

### 6. `src/components/hub/MaterialCard.tsx`

- Ícone de vídeo: `text-purple-500` para `text-amber-600`
- Gradiente de vídeo: `from-purple-500/20 to-pink-500/5` para `from-amber-500/20 to-yellow-500/5`
- Hover de vídeo: `border-purple-500/50` e `shadow-purple-500/20` para `border-amber-500/50` e `shadow-amber-500/20`

### 7. `src/components/hub/AssetManagerModal.tsx`

- Label de vídeo: `text-purple-500` para `text-amber-600`

### 8. `src/pages/AuthPage.tsx`

- Logo fallback: `from-blue-500 via-purple-600 to-indigo-600` para `from-blue-900 via-amber-600 to-amber-700`
- Blob decorativo: `bg-purple-500/20` para `bg-amber-500/20`
- Texto shimmer: `from-blue-500 to-purple-500` para `from-blue-400 to-amber-500`

### 9. `src/pages/Admin.tsx`

- KPI "Usuários únicos": `bg-purple-500/10 text-purple-500` para `bg-amber-500/10 text-amber-600`
- KPI "Trilhas Iniciadas": `bg-indigo-500/10 text-indigo-500` para `bg-amber-500/10 text-amber-600`
- Ícone Integrações: `text-purple-500` para `text-amber-600`

### 10. `src/pages/Dashboard.tsx`

- Card "Dica Pro": todas as referências `indigo-500` e `purple-500` para `amber-500`/`amber-600`

---

## Detalhes Tecnicos

Nenhuma funcionalidade sera alterada. Apenas classes CSS Tailwind e valores hexadecimais de cor serao substituidos. A paleta dourada (amber) do Tailwind sera usada como base, complementada pelo dourado personalizado `#c9a655` nas variaveis CSS do tema.