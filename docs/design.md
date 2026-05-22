# Design — Hub Conexão

> Especificação de design system, identidade visual, tokens e padrões de UI. Atualizado em maio/2026.

---

## 1. Identidade Visual

### 1.1 Paleta Principal
| Cor | Hex | Uso |
|---|---|---|
| **Navy** | `#0a1e3d` | Background principal, headers, brand |
| **Gold** | `#c9a655` | Accent, CTAs, destaques, patentes |
| **Dark Surface** | `#0f172a` | Surface base do app |
| **Slate Surface** | `#1e293b` | Cards, painéis elevados |

### 1.2 Cores por Role
| Role | Cor | Hex aprox |
|---|---|---|
| Consultor | Indigo | `#6366f1` |
| Distribuidor | Amber | `#f59e0b` |
| Cliente | Emerald | `#10b981` |
| Gestor | Slate | `#64748b` |
| Super Admin | Gold | `#c9a655` |

### 1.3 Princípios
- **Dark mode permanente** — nunca light, nunca `dark:` prefix.
- **Premium odontológico** — sofisticação Navy/Gold, sem cores saturadas pop.
- **Glassmorphism** como linguagem-base de superfícies elevadas.
- **Grain + blobs** como efeitos fundamentais de fundo (não opcionais).
- **Sem cores hardcoded** em componentes — sempre tokens CSS.

---

## 2. Tokens (42 variáveis CSS)

Persistidos em `system_config.theme_dark` (jsonb) e injetados como CSS variables no `<html>`.

### Base
- `--color-background`, `--color-surface`, `--color-surface-hover`, `--color-card`

### Texto
- `--color-text-main`, `--color-text-muted`, `--color-text-inverted`

### Borda
- `--color-border`, `--color-border-subtle`

### Brand
- `--color-accent`, `--color-accent-hover`, `--color-accent-foreground`, `--color-accent-muted`

### Feedback
- `--color-success`, `--color-success-bg`
- `--color-warning`, `--color-warning-bg`
- `--color-error`, `--color-error-bg`

### Componentes
- `--color-input-bg`, `--color-input-border`, `--color-input-focus`
- `--color-button-primary-bg`, `--color-button-primary-text`
- `--color-badge-bg`
- `--color-tooltip-bg`, `--color-tooltip-text`

### Efeitos
- `--color-overlay`, `--color-shadow`, `--color-glass-tint`
- `--color-header-bg`
- `--color-scrollbar-thumb`, `--color-scrollbar-track`
- `--color-ring`

### Gradientes
- `--color-gradient-start`, `--color-gradient-mid`, `--color-gradient-end`

### Hover
- `--color-hover-bg`, `--color-hover-border`, `--color-hover-scale`, `--color-hover-shadow`

---

## 3. Theming por Ambiente

`system_config.environment_themes` permite override granular por área:

| Ambiente | Aplicado em |
|---|---|
| `auth` | `/auth` (login + cadastro convite) |
| `client` | `/dashboard` (consumo) |
| `manager` | `/manager` |
| `admin` | `/admin` |
| `global` | Fallback geral |

### Effects controláveis por ambiente
- `pageBg`
- `blob1Color`, `blob2Color`, `blob3Color`, `blobOpacity`, `blobSize`, `blobBlur`
- `grainOpacity`, `grainBlendMode`, `grainContrast`
- `glassOpacity`, `glassBlur`, `glassBorderOpacity`

---

## 4. Tipografia

- **Fonte principal**: Inter (sans-serif) — corpo de texto, UI.
- **Headlines**: Inter peso 600/700.
- **Mono**: JetBrains Mono — códigos, tokens.

Tamanhos via Tailwind scale (`text-sm`, `text-base`, `text-lg`, etc).

---

## 5. Componentes (shadcn/ui)

Base instalada em `src/components/ui/`. Customizados via `class-variance-authority` + tokens CSS.

### Padrões
- **Buttons**: variants `default`, `secondary`, `ghost`, `destructive`, `outline`, `link`.
- **Cards**: glassmorphism com `--color-glass-tint` + `--glass-blur`.
- **Modals (Dialog)**: em desktop centralizado; em mobile vira bottom sheet (`Sheet`).
- **Tables**: em desktop tabela; em mobile vira lista de cards.
- **Toasts**: exclusivamente `sonner` (proibido `alert()` e legacy toast).
- **Icon boxes**: classe `.icon-box` com regras `color-mix` para variação dinâmica.

---

## 6. Efeitos Visuais (Core)

Implementados em `src/components/hub/GlobalEffects.tsx`. **Não-opcionais.**

### 6.1 Glassmorphism
```css
background: color-mix(in oklab, var(--color-glass-tint), transparent calc(100% - var(--glass-opacity)));
backdrop-filter: blur(var(--glass-blur));
border: 1px solid color-mix(in oklab, var(--color-border), transparent calc(100% - var(--glass-border-opacity)));
```

### 6.2 Grain
Overlay de noise SVG com `mix-blend-mode` e contraste configurável.

### 6.3 Blobs animados
3 blobs gradient (cores configuráveis) com `filter: blur()` e animação CSS lenta de translate/scale.

### 6.4 Gradientes
Linear gradient `var(--gradient-start) → var(--gradient-mid) → var(--gradient-end)` reutilizável.

---

## 7. Hover & Interação

Implementação via **inline styles dinâmicos** (não Tailwind `hover:` classes) para suportar tokens dinâmicos:

```tsx
onMouseEnter={e => { e.currentTarget.style.background = `var(--color-hover-bg)`; ... }}
onMouseLeave={e => { e.currentTarget.style.background = ''; ... }}
```

Razão: classes Tailwind compiladas estaticamente não interpolam variáveis CSS de runtime.

---

## 8. Responsividade

Breakpoints Tailwind padrão. Regras específicas:

| Componente | Mobile | Desktop |
|---|---|---|
| Tabelas | Card list | Tabela completa |
| Modais | Bottom sheet (`Sheet`) | Dialog centralizado |
| Sidebar admin | Menu colapsável | Sidebar fixa |
| Material grid | 1 coluna | 2-4 colunas conforme tamanho |

---

## 9. Iconografia

- **Lucide React** — biblioteca padrão.
- Tamanho default: `h-4 w-4` em botões, `h-5 w-5` em headers, `h-6 w-6` em cards.
- Sempre wrap em `.icon-box` quando colorido para herdar tokens.

---

## 10. Animações

- **CSS transitions** (`transition-all duration-200`) em hover/focus.
- **framer-motion** para celebração de trilha (`TrailCompletionCelebration`) e animações de entrada de modais.
- **Sem micro-interações ruidosas** — animações sutis, premium.

---

## 11. Acessibilidade

- Componentes Radix (shadcn) garantem ARIA correto.
- Foco visível via `--color-ring` (focus outline gold).
- Contraste WCAG AA validado em todos os tokens dark.
- Navegação 100% por teclado (incluindo modais com trap de foco).

---

## 12. Referências

- `docs/branding-guide.md` — Marca, logo, tom de voz.
- `docs/design-system-dark.md` — Lista completa de tokens com valores default.
- `design-tokens.md` (raiz) — Reference para assets HTML externos.
