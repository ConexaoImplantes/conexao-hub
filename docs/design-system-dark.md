# Design System — Dark Mode Only — Hub Conexão Digital Implant

> Referência técnica definitiva de todas as cores, efeitos, animações e tokens da plataforma.
> Extraída de: `themeDefaults.ts`, `index.css`, `tailwind.config.ts`, `types.ts`, `BrandContext.tsx`.
> **A plataforma opera exclusivamente em Dark Mode.**

---

## 1. ColorScheme — 42 Tokens de Cor

Todas as cores são configuráveis em tempo real pelo admin e injetadas via `BrandContext` como CSS custom properties no `:root`.

### 1.1 Base (4 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `background` | `--color-bg` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) | `#0f172a` | Fundo principal da página |
| `surface` | `--color-surface` | ![#1e293b](https://placehold.co/15x15/1e293b/1e293b.png) | `#1e293b` | Cards, modais, painéis, menus dropdown |
| `surfaceHover` | `--color-surface-hover` | ![#334155](https://placehold.co/15x15/334155/334155.png) | `#334155` | Estado hover de superfícies, linhas de tabela |
| `card` | `--color-card` | ![#1e293b](https://placehold.co/15x15/1e293b/1e293b.png) | `#1e293b` | Fundo específico de cards |

### 1.2 Tipografia (3 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `textMain` | `--color-text-main` | ![#f8fafc](https://placehold.co/15x15/f8fafc/f8fafc.png) | `#f8fafc` | Texto principal: títulos, parágrafos, nomes |
| `textMuted` | `--color-text-muted` | ![#94a3b8](https://placehold.co/15x15/94a3b8/94a3b8.png) | `#94a3b8` | Texto secundário: labels, descrições, placeholders |
| `textInverted` | `--color-text-inverted` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) | `#0f172a` | Texto sobre fundos coloridos (botões primários) |

### 1.3 Bordas (2 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `border` | `--color-border` | — | `transparent` | Borda principal (transparente para estética clean) |
| `borderSubtle` | `--color-border-subtle` | ![#1e293b](https://placehold.co/15x15/1e293b/1e293b.png) | `#1e293b` | Borda sutil para divisores internos |

### 1.4 Marca / Accent (4 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `accent` | `--color-accent` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a655` | Cor de destaque principal (dourado) |
| `accentHover` | `--color-accent-hover` | ![#d4b366](https://placehold.co/15x15/d4b366/d4b366.png) | `#d4b366` | Variação hover do accent |
| `accentForeground` | `--color-accent-fg` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) | `#0f172a` | Texto sobre fundo accent |
| `accentMuted` | `--color-accent-muted` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a65520` | Accent com ~12% opacidade |

### 1.5 Gradientes (3 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `gradientStart` | `--color-gradient-start` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a655` | Ponto inicial do gradiente metálico |
| `gradientMid` | `--color-gradient-mid` | ![#e8d48b](https://placehold.co/15x15/e8d48b/e8d48b.png) | `#e8d48b` | Ponto médio (brilho central) |
| `gradientEnd` | `--color-gradient-end` | ![#a8873a](https://placehold.co/15x15/a8873a/a8873a.png) | `#a8873a` | Ponto final (profundidade) |

**Gradiente-assinatura da marca:**
```css
background: linear-gradient(135deg,
  var(--color-gradient-start) 0%,
  var(--color-gradient-mid) 40%,
  var(--color-gradient-end) 70%,
  var(--color-gradient-start) 100%
);
```

### 1.6 Feedback (6 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `success` | `--color-success` | ![#22c55e](https://placehold.co/15x15/22c55e/22c55e.png) | `#22c55e` | Status ativo, confirmações |
| `successBg` | `--color-success-bg` | ![#22c55e](https://placehold.co/15x15/22c55e/22c55e.png) | `#22c55e15` | Background sutil de sucesso (~8%) |
| `warning` | `--color-warning` | ![#eab308](https://placehold.co/15x15/eab308/eab308.png) | `#eab308` | Pendências, avisos |
| `warningBg` | `--color-warning-bg` | ![#eab308](https://placehold.co/15x15/eab308/eab308.png) | `#eab30815` | Background sutil de warning |
| `error` | `--color-error` | ![#ef4444](https://placehold.co/15x15/ef4444/ef4444.png) | `#ef4444` | Erros, ações destrutivas |
| `errorBg` | `--color-error-bg` | ![#ef4444](https://placehold.co/15x15/ef4444/ef4444.png) | `#ef444415` | Background sutil de erro |

### 1.7 Componentes (8 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `inputBg` | `--color-input-bg` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) | `#0f172a` | Fundo de campos de input |
| `inputBorder` | `--color-input-border` | ![#334155](https://placehold.co/15x15/334155/334155.png) | `#334155` | Borda de inputs em repouso |
| `inputFocus` | `--color-input-focus` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a655` | Ring/borda ao focar |
| `buttonPrimaryBg` | `--color-btn-primary-bg` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a655` | Fundo do botão primário (CTA) |
| `buttonPrimaryText` | `--color-btn-primary-text` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) | `#0f172a` | Texto do botão primário |
| `badgeBg` | `--color-badge-bg` | ![#334155](https://placehold.co/15x15/334155/334155.png) | `#334155` | Fundo de badges, tags, chips |
| `tooltipBg` | `--color-tooltip-bg` | ![#f8fafc](https://placehold.co/15x15/f8fafc/f8fafc.png) | `#f8fafc` | Fundo de tooltips |
| `tooltipText` | `--color-tooltip-text` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) | `#0f172a` | Texto de tooltips |

### 1.8 Efeitos Visuais (7 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `overlay` | `--color-overlay` | ![#000000](https://placehold.co/15x15/000000/000000.png) | `#00000080` | Overlay de modais (50% opacidade) |
| `shadow` | `--color-shadow` | ![#000000](https://placehold.co/15x15/000000/000000.png) | `#00000040` | Cor base para box-shadows |
| `glassTint` | `--color-glass-tint` | ![#ffffff](https://placehold.co/15x15/ffffff/ffffff.png) | `#ffffff10` | Tint do glassmorphism |
| `headerBg` | `--color-header-bg` | ![#1e293b](https://placehold.co/15x15/1e293b/1e293b.png) | `#1e293b` | Fundo base do header |
| `scrollbarThumb` | `--color-scrollbar-thumb` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a655` | Polegar da scrollbar |
| `scrollbarTrack` | `--color-scrollbar-track` | — | `transparent` | Trilha da scrollbar |
| `ring` | `--color-ring` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a65580` | Focus ring (50% opacidade) |

### 1.9 Efeitos de Hover (4 tokens)

| Token | Variável CSS | Cor | Valor Default | Descrição |
|---|---|---|---|---|
| `hoverBg` | `--color-hover-bg` | ![#334155](https://placehold.co/15x15/334155/334155.png) | `#334155` | Fundo no hover |
| `hoverBorder` | `--color-hover-border` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a65540` | Borda no hover (~25% opacidade) |
| `hoverScale` | — | — | `1.02` | Fator de escala (JS, não CSS) |
| `hoverShadow` | `--color-hover-shadow` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) | `#c9a65525` | Sombra no hover (~15% opacidade) |

---

## 2. Efeitos de Ambiente (EnvironmentEffects) — 13 Tokens por Ambiente

Cada ambiente (Login, Cliente, Gestor, Admin) pode ter configurações visuais independentes para blobs, grain e glassmorphism. Armazenados em `system_config.environment_themes`.

### 2.1 Tokens

| Token | Variável CSS | Tipo | Descrição |
|---|---|---|---|
| `pageBg` | `--env-page-bg` | cor HEX | Cor de fundo da página naquele ambiente |
| `blob1Color` | `--env-blob1-color` | cor HEX | Cor do 1º blob animado |
| `blob2Color` | `--env-blob2-color` | cor HEX | Cor do 2º blob animado |
| `blob3Color` | `--env-blob3-color` | cor HEX | Cor do 3º blob animado |
| `blobOpacity` | `--env-blob-opacity` | string (0–1) | Opacidade dos blobs |
| `blobSize` | `--env-blob-size` | string (rem) | Tamanho dos blobs |
| `blobBlur` | `--env-blob-blur` | string (px) | Blur dos blobs |
| `grainOpacity` | `--env-grain-opacity` | string (0–1) | Opacidade do grain |
| `grainBlendMode` | `--env-grain-blend` | string | Blend mode do grain |
| `grainContrast` | `--env-grain-contrast` | string (%) | Contraste do grain |
| `glassOpacity` | `--env-glass-opacity` | string (0–1) | Opacidade do glassmorphism |
| `glassBlur` | `--env-glass-blur` | string (px) | Blur do glass |
| `glassBorderOpacity` | `--env-glass-border-opacity` | string (0–1) | Opacidade da borda glass |

### 2.2 Valores Padrão por Ambiente

| Token | Global | Auth (Login) | Client | Manager | Admin |
|---|---|---|---|---|---|
| `pageBg` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) `#0f172a` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) `#0f172a` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) `#0f172a` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) `#0f172a` | ![#0f172a](https://placehold.co/15x15/0f172a/0f172a.png) `#0f172a` |
| `blob1Color` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) `#c9a655` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) `#c9a655` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) `#c9a655` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) `#c9a655` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) `#c9a655` |
| `blob2Color` | ![#e8d48b](https://placehold.co/15x15/e8d48b/e8d48b.png) `#e8d48b` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) `#c9a655` | ![#e8d48b](https://placehold.co/15x15/e8d48b/e8d48b.png) `#e8d48b` | ![#d4b366](https://placehold.co/15x15/d4b366/d4b366.png) `#d4b366` | ![#e8d48b](https://placehold.co/15x15/e8d48b/e8d48b.png) `#e8d48b` |
| `blob3Color` | ![#a8873a](https://placehold.co/15x15/a8873a/a8873a.png) `#a8873a` | ![#c9a655](https://placehold.co/15x15/c9a655/c9a655.png) `#c9a655` | ![#a8873a](https://placehold.co/15x15/a8873a/a8873a.png) `#a8873a` | ![#b8953e](https://placehold.co/15x15/b8953e/b8953e.png) `#b8953e` | ![#a8873a](https://placehold.co/15x15/a8873a/a8873a.png) `#a8873a` |
| `blobOpacity` | `0.20` | `0.15` | `0.20` | `0.15` | `0.18` |
| `blobSize` | `18` | `24` | `18` | `20` | `18` |
| `blobBlur` | `64` | `100` | `64` | `80` | `64` |
| `grainOpacity` | `0.20` | `0.10` | `0.20` | `0.20` | `0.20` |
| `grainBlendMode` | `multiply` | `multiply` | `multiply` | `multiply` | `multiply` |
| `grainContrast` | `150` | `150` | `150` | `150` | `150` |
| `glassOpacity` | `0.40` | `0.40` | `0.40` | `0.40` | `0.40` |
| `glassBlur` | `24` | `24` | `24` | `24` | `24` |
| `glassBorderOpacity` | `0.10` | `0.10` | `0.10` | `0.10` | `0.10` |

**Diferenças notáveis:**
- **Auth**: Blobs maiores (24rem), mais blur (100px), menos opacidade (0.15), grain mais sutil (0.10). Todos os 3 blobs usam a mesma cor dourada.
- **Manager**: Blobs intermediários (20rem), blur moderado (80px), paleta dourada própria.
- **Admin**: Opacidade dos blobs em 0.18 (levemente reduzida).

---

## 3. Efeitos Visuais CSS

### 3.1 Liquid Glass (`.liquid-glass`)

```css
/* Fallback */
background: rgba(30, 41, 59, 0.25);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
backdrop-filter: blur(20px) saturate(180%);

/* Com color-mix */
background: linear-gradient(135deg,
  color-mix(in srgb, var(--color-glass-tint) 25%, transparent) 0%,
  color-mix(in srgb, var(--color-glass-tint) 8%, transparent) 50%,
  color-mix(in srgb, var(--color-glass-tint) 15%, transparent) 100%
);
border: 1px solid color-mix(in srgb, var(--color-glass-tint) 20%, transparent);
box-shadow:
  0 8px 32px var(--color-shadow, rgba(0, 0, 0, 0.3)),
  inset 0 1px 0 color-mix(in srgb, var(--color-glass-tint) 30%, transparent),
  inset 0 -1px 0 color-mix(in srgb, var(--color-glass-tint) 10%, transparent);
```

**Uso:** Header principal, cards flutuantes, painéis de conteúdo.

### 3.2 Liquid Glass Gold (`.liquid-glass-gold`)

```css
/* Fallback */
background: rgba(201, 166, 85, 0.12);
border: 1px solid rgba(201, 166, 85, 0.15);
box-shadow: 0 4px 20px rgba(201, 166, 85, 0.08);
backdrop-filter: blur(16px) saturate(160%);

/* Com color-mix */
background: linear-gradient(135deg,
  color-mix(in srgb, var(--color-gradient-start) 18%, transparent) 0%,
  color-mix(in srgb, var(--color-gradient-mid) 8%, transparent) 40%,
  color-mix(in srgb, var(--color-gradient-end) 14%, transparent) 70%,
  color-mix(in srgb, var(--color-gradient-start) 10%, transparent) 100%
);
border: 1px solid color-mix(in srgb, var(--color-gradient-start) 22%, transparent);
```

**Uso:** Elementos interativos ativos, destaques de gamificação, cards premium.

### 3.3 Icon Box (`.icon-box`, `.icon-box-sm`, `.icon-box-lg`)

| Variante | Classe | Tamanho | Border Radius |
|---|---|---|---|
| Small | `.icon-box-sm` | 2rem (32px) | 0.5rem (8px) |
| Default | `.icon-box` | 2.5rem (40px) | 0.75rem (12px) |
| Large | `.icon-box-lg` | 3rem (48px) | 0.875rem (14px) |

```css
display: flex;
align-items: center;
justify-content: center;
background-color: color-mix(in srgb, var(--color-surface) 60%, black);
border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
color: var(--color-accent);
transition: all 0.3s ease;
```

### 3.4 Scrollbar Customizada

```css
*::-webkit-scrollbar { width: 5px; height: 5px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 999px; }
*::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--color-accent) 80%, black); }
* { scrollbar-width: thin; scrollbar-color: var(--color-accent) transparent; }
```

---

## 4. Animações

### 4.1 Keyframes

| Nome | Keyframes | Descrição |
|---|---|---|
| `blob` | `0%: translate(0,0) scale(1)` → `33%: translate(30px,-50px) scale(1.1)` → `66%: translate(-20px,20px) scale(0.9)` → `100%: translate(0,0) scale(1)` | Movimento orgânico dos blobs |
| `fade-in` | `0%: opacity(0) translateY(10px)` → `100%: opacity(1) translateY(0)` | Entrada suave |
| `slide-up` | `0%: opacity(0) translateY(20px)` → `100%: opacity(1) translateY(0)` | Entrada de baixo para cima |
| `shimmer` | `0%: backgroundPosition(200% 0)` → `100%: backgroundPosition(-200% 0)` | Brilho percorrendo o gradiente |
| `float` | `0%,100%: translateY(0)` → `50%: translateY(-10px)` | Flutuação suave do logo |
| `accordion-down/up` | Expansão/contração via `--radix-accordion-content-height` | Acordeões |

### 4.2 Classes de Animação

| Classe Tailwind | Duração | Easing | Loop |
|---|---|---|---|
| `animate-blob` | 7s | default | ∞ |
| `animate-fade-in` | 0.5s | ease-out | once (forwards) |
| `animate-slide-up` | 0.4s | ease-out | once (forwards) |
| `animate-shimmer` | 3s | ease-in-out | ∞ |
| `animate-float` | 3s | ease-in-out | ∞ |
| `animate-accordion-down/up` | 0.2s | ease-out | once |

### 4.3 Classe Auxiliar

```css
.animation-delay-2000 { animation-delay: 2s; }
```

---

## 5. Variáveis CSS shadcn/ui (Tokens HSL)

Definidas em `index.css` dentro de `@layer base`. Dark-only, definido em `:root, .dark`.

| Token | Valor HSL | Uso |
|---|---|---|
| `--background` | `222.2 84% 4.9%` | Fundo da aplicação |
| `--foreground` | `210 40% 98%` | Texto principal |
| `--card` | `222.2 84% 4.9%` | Fundo de cards |
| `--card-foreground` | `210 40% 98%` | Texto de cards |
| `--popover` | `222.2 84% 4.9%` | Fundo de popovers |
| `--popover-foreground` | `210 40% 98%` | Texto de popovers |
| `--primary` | `210 40% 98%` | Cor primária |
| `--primary-foreground` | `222.2 47.4% 11.2%` | Texto sobre primário |
| `--secondary` | `217.2 32.6% 17.5%` | Cor secundária |
| `--secondary-foreground` | `210 40% 98%` | Texto sobre secundário |
| `--muted` | `217.2 32.6% 17.5%` | Fundos atenuados |
| `--muted-foreground` | `215 20.2% 65.1%` | Texto atenuado |
| `--accent` | `217.2 32.6% 17.5%` | Accent shadcn |
| `--accent-foreground` | `210 40% 98%` | Texto sobre accent |
| `--destructive` | `0 62.8% 30.6%` | Ações destrutivas |
| `--destructive-foreground` | `210 40% 98%` | Texto sobre destructive |
| `--border` | `217.2 32.6% 17.5%` | Bordas shadcn |
| `--input` | `217.2 32.6% 17.5%` | Bordas de inputs |
| `--ring` | `212.7 26.8% 83.9%` | Focus ring |
| `--radius` | `0.5rem` | Border-radius base |

### Sidebar

| Token | Valor HSL |
|---|---|
| `--sidebar-background` | `240 5.9% 10%` |
| `--sidebar-foreground` | `240 4.8% 95.9%` |
| `--sidebar-primary` | `224.3 76.3% 48%` |
| `--sidebar-primary-foreground` | `0 0% 100%` |
| `--sidebar-accent` | `240 3.7% 15.9%` |
| `--sidebar-accent-foreground` | `240 4.8% 95.9%` |
| `--sidebar-border` | `240 3.7% 15.9%` |
| `--sidebar-ring` | `217.2 91.2% 59.8%` |

---

## 6. Tipografia

### 6.1 Família de Fontes

```
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

### 6.2 Pesos

| Peso | Classe Tailwind | Uso |
|---|---|---|
| 400 | `font-normal` | Texto corrido, parágrafos |
| 500 | `font-medium` | Labels, descrições |
| 600 | `font-semibold` | Subtítulos, badges, tags |
| 700 | `font-bold` | Títulos, botões, nomes, headers |

### 6.3 Tamanhos

| Classe | Tamanho | Uso |
|---|---|---|
| `text-3xl` | 1.875rem | Título principal (login) |
| `text-xl` | 1.25rem | Nome do app no header |
| `text-lg` | 1.125rem | Nome da marca animado |
| `text-sm` | 0.875rem | Descrições, tooltips |
| `text-xs` | 0.75rem | Labels, badges, metadata |
| `text-[10px]` | 0.625rem | Micro-texto (hints) |
| `text-[9px]` | 0.5625rem | XP/nível no header |

### 6.4 Texto Shimmer (Marca)

```css
background-image: linear-gradient(90deg,
  var(--color-gradient-start),
  var(--color-gradient-mid),
  var(--color-gradient-end),
  var(--color-gradient-start)
);
background-clip: text;
-webkit-text-fill-color: transparent;
background-size: 200% 100%;
animation: shimmer 3s ease-in-out infinite;
```

---

## 7. Espaçamento e Layout

### 7.1 Container

```
max-width: 1400px (breakpoint 2xl)
padding: 2rem
margin: auto
```

### 7.2 Border Radius

| Token/Classe | Valor | Uso |
|---|---|---|
| `--radius` (shadcn) | `0.5rem` (8px) | Padrão base shadcn |
| `rounded-lg` | `var(--radius)` | Componentes shadcn |
| `rounded-md` | `calc(var(--radius) - 2px)` | Variante menor |
| `rounded-sm` | `calc(var(--radius) - 4px)` | Variante mínima |
| `rounded-xl` | 0.75rem (12px) | Inputs, botões, icon-box |
| `rounded-2xl` | 1rem (16px) | Cards, header |
| `rounded-[2.5rem]` | 2.5rem (40px) | Card de login |
| `rounded-full` | 9999px | Avatares, pills |

### 7.3 Breakpoints

| Breakpoint | Largura | Comportamentos |
|---|---|---|
| Mobile | < 640px | Nome do app e idioma ocultos |
| `sm` | ≥ 640px | Nome do app visível |
| `md` | ≥ 768px | Seletor de idioma, padding `p-6` |
| `lg` | ≥ 1024px | Layout expandido |
| `xl` | ≥ 1280px | Container máximo |
| `2xl` | ≥ 1400px | Container `max-width: 1400px` |

---

## 8. Compatibilidade Cross-Browser

### 8.1 Fallbacks CSS
Blocos `color-mix` envolvidos em `@supports`. Fora dele, valores RGBA estáticos como fallback.

### 8.2 Polyfill JS (`main.tsx`)
`MutationObserver` substitui `color-mix` por RGBA em navegadores sem suporte. Classe `.no-color-mix` ativa fallbacks globais.

### 8.3 Utilitários (`src/lib/utils.ts`)
- `colorMix(color, pct, fallback)` — retorna `color-mix()` ou fallback RGBA
- `colorMixBorder(color, pct, fallback)` — idem para bordas
- `supportsColorMix` — flag de detecção

### 8.4 Classe `.no-color-mix`

```css
.no-color-mix {
  --color-surface-alpha: rgba(30, 41, 59, 0.4);
  --color-accent-alpha: rgba(201, 166, 85, 0.1);
  --color-accent-alpha-strong: rgba(201, 166, 85, 0.15);
  --color-border-alpha: rgba(255, 255, 255, 0.08);
  --color-bg-alpha: rgba(15, 23, 42, 0.5);
  --color-warning-alpha: rgba(234, 179, 8, 0.1);
}
```

---

## 9. Mapeamento de Injeção CSS

### 9.1 ColorScheme → CSS Variables

```
ColorScheme.background        → --color-bg
ColorScheme.surface           → --color-surface
ColorScheme.surfaceHover      → --color-surface-hover
ColorScheme.card              → --color-card
ColorScheme.textMain          → --color-text-main
ColorScheme.textMuted         → --color-text-muted
ColorScheme.textInverted      → --color-text-inverted
ColorScheme.border            → --color-border
ColorScheme.borderSubtle      → --color-border-subtle
ColorScheme.accent            → --color-accent
ColorScheme.accentHover       → --color-accent-hover
ColorScheme.accentForeground  → --color-accent-fg
ColorScheme.accentMuted       → --color-accent-muted
ColorScheme.success           → --color-success
ColorScheme.successBg         → --color-success-bg
ColorScheme.warning           → --color-warning
ColorScheme.warningBg         → --color-warning-bg
ColorScheme.error             → --color-error
ColorScheme.errorBg           → --color-error-bg
ColorScheme.inputBg           → --color-input-bg
ColorScheme.inputBorder       → --color-input-border
ColorScheme.inputFocus        → --color-input-focus
ColorScheme.buttonPrimaryBg   → --color-btn-primary-bg
ColorScheme.buttonPrimaryText → --color-btn-primary-text
ColorScheme.badgeBg           → --color-badge-bg
ColorScheme.tooltipBg         → --color-tooltip-bg
ColorScheme.tooltipText       → --color-tooltip-text
ColorScheme.overlay           → --color-overlay
ColorScheme.shadow            → --color-shadow
ColorScheme.glassTint         → --color-glass-tint
ColorScheme.headerBg          → --color-header-bg
ColorScheme.scrollbarThumb    → --color-scrollbar-thumb
ColorScheme.scrollbarTrack    → --color-scrollbar-track
ColorScheme.ring              → --color-ring
ColorScheme.gradientStart     → --color-gradient-start
ColorScheme.gradientMid       → --color-gradient-mid
ColorScheme.gradientEnd       → --color-gradient-end
ColorScheme.hoverBg           → --color-hover-bg
ColorScheme.hoverBorder       → --color-hover-border
ColorScheme.hoverScale        → --color-hover-scale
ColorScheme.hoverShadow       → --color-hover-shadow
```

### 9.2 EnvironmentEffects → CSS Variables

```
EnvironmentEffects.pageBg             → --env-page-bg
EnvironmentEffects.blob1Color         → --env-blob1-color
EnvironmentEffects.blob2Color         → --env-blob2-color
EnvironmentEffects.blob3Color         → --env-blob3-color
EnvironmentEffects.blobOpacity        → --env-blob-opacity
EnvironmentEffects.blobSize           → --env-blob-size (+ "rem")
EnvironmentEffects.blobBlur           → --env-blob-blur (+ "px")
EnvironmentEffects.grainOpacity       → --env-grain-opacity
EnvironmentEffects.grainBlendMode     → --env-grain-blend
EnvironmentEffects.grainContrast      → --env-grain-contrast
EnvironmentEffects.glassOpacity       → --env-glass-opacity
EnvironmentEffects.glassBlur          → --env-glass-blur (+ "px")
EnvironmentEffects.glassBorderOpacity → --env-glass-border-opacity
```

---

## 10. Arquivos-Fonte

| Arquivo | Conteúdo |
|---|---|
| `src/types.ts` | Interfaces `ColorScheme`, `EnvironmentEffects`, `EnvironmentKey`, `EnvironmentThemes`, `ThemeModeConfig` |
| `src/lib/themeDefaults.ts` | Valores padrão `DEFAULT_DARK`, `DEFAULT_ENVIRONMENT_THEMES`, funções `mergeScheme` e `mergeEnvironmentEffects` |
| `src/contexts/BrandContext.tsx` | Injeção dinâmica de CSS variables, funções `buildCssVars` e `buildEnvCssVars` |
| `src/index.css` | Tokens HSL shadcn/ui, efeitos CSS (liquid-glass, icon-box, scrollbar), fallbacks cross-browser |
| `tailwind.config.ts` | Keyframes, animações, cores semânticas mapeadas para HSL, breakpoints, border-radius |
| `src/components/hub/GlobalEffects.tsx` | Renderização dos blobs animados e grain usando variáveis CSS de ambiente |
| `src/lib/utils.ts` | Utilitários `colorMix`, `colorMixBorder`, detecção `supportsColorMix` |
| `src/main.tsx` | Polyfill `MutationObserver` para `color-mix` em navegadores sem suporte |
