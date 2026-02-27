# Design System — Hub Conexão Digital Implant

> Referência técnica definitiva de todas as cores, efeitos, animações e tokens da plataforma.
> Extraída de: `themeDefaults.ts`, `index.css`, `tailwind.config.ts`, `types.ts`, `BrandContext.tsx`.

---

## 1. ColorScheme — 38 Tokens de Cor

Todas as cores são configuráveis em tempo real pelo admin e injetadas via `BrandContext` como CSS custom properties no `:root` e `.dark`.

### 1.1 Base (4 tokens)

| Token | Variável CSS | Light (default) | Dark (default) | Descrição |
|---|---|---|---|---|
| `background` | `--color-bg` | `#f8fafc` | `#0f172a` | Fundo principal da página. Usado no `body` e como base de toda a UI. |
| `surface` | `--color-surface` | `#ffffff` | `#1e293b` | Superfícies elevadas: cards, modais, painéis, menus dropdown. |
| `surfaceHover` | `--color-surface-hover` | `#f1f5f9` | `#334155` | Estado hover de superfícies. Linhas de tabela, itens de lista ao passar o mouse. |
| `card` | `--color-card` | `#ffffff` | `#1e293b` | Fundo específico de cards. Pode diferir de `surface` para criar hierarquia visual. |

### 1.2 Tipografia (3 tokens)

| Token | Variável CSS | Light | Dark | Descrição |
|---|---|---|---|---|
| `textMain` | `--color-text-main` | `#0f172a` | `#f8fafc` | Texto principal: títulos, parágrafos, nomes. Deve ter alto contraste com `background`. |
| `textMuted` | `--color-text-muted` | `#64748b` | `#94a3b8` | Texto secundário: labels, descrições, placeholders, metadados, timestamps. |
| `textInverted` | `--color-text-inverted` | `#ffffff` | `#0f172a` | Texto sobre fundos coloridos (botões primários, badges, tooltips). Cor oposta ao tema. |

### 1.3 Bordas (2 tokens)

| Token | Variável CSS | Light | Dark | Descrição |
|---|---|---|---|---|
| `border` | `--color-border` | `#e2e8f0` | `transparent` | Borda principal de cards, inputs, separadores. No dark mode é transparente para estética clean. |
| `borderSubtle` | `--color-border-subtle` | `#f1f5f9` | `#1e293b` | Borda sutil para divisores internos, separadores de seção, linhas de grade leves. |

### 1.4 Marca / Accent (4 tokens)

| Token | Variável CSS | Light | Dark | Descrição |
|---|---|---|---|---|
| `accent` | `--color-accent` | `#c9a655` | `#c9a655` | Cor de destaque principal (dourado). Ícones ativos, links, indicadores, scrollbar, focus ring. |
| `accentHover` | `--color-accent-hover` | `#b8953e` | `#d4b366` | Variação hover do accent. Light: escurece. Dark: clareia. |
| `accentForeground` | `--color-accent-fg` | `#ffffff` | `#0f172a` | Texto sobre fundo accent. Branco no light, escuro no dark para garantir contraste. |
| `accentMuted` | `--color-accent-muted` | `#c9a65520` | `#c9a65520` | Accent com baixa opacidade (~12%). Backgrounds sutis de badges, highlights, seleções. |

### 1.5 Gradientes (3 tokens)

| Token | Variável CSS | Light | Dark | Descrição |
|---|---|---|---|---|
| `gradientStart` | `--color-gradient-start` | `#c9a655` | `#c9a655` | Ponto inicial do gradiente metálico. Usado em: logo, botão de login, shimmer text, liquid-glass-gold. |
| `gradientMid` | `--color-gradient-mid` | `#e8d48b` | `#e8d48b` | Ponto médio do gradiente. Cria o brilho central do efeito metálico dourado. |
| `gradientEnd` | `--color-gradient-end` | `#a8873a` | `#a8873a` | Ponto final do gradiente. Tom mais escuro que dá profundidade ao efeito metálico. |

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

| Token | Variável CSS | Light | Dark | Descrição |
|---|---|---|---|---|
| `success` | `--color-success` | `#10b981` | `#22c55e` | Cor de sucesso: status ativo, ações concluídas, confirmações, indicadores online. |
| `successBg` | `--color-success-bg` | `#10b98115` | `#22c55e15` | Background sutil de sucesso (~8% opacidade). Badges de "ativo", alertas de confirmação. |
| `warning` | `--color-warning` | `#f59e0b` | `#eab308` | Cor de aviso: pendências, ações que requerem atenção, timers. |
| `warningBg` | `--color-warning-bg` | `#f59e0b15` | `#eab30815` | Background sutil de warning. Badges de "pendente", alertas de aviso. |
| `error` | `--color-error` | `#ef4444` | `#ef4444` | Cor de erro: validações falhas, botão de logout, ações destrutivas, status rejeitado. |
| `errorBg` | `--color-error-bg` | `#ef444415` | `#ef444415` | Background sutil de erro. Badges de "rejeitado", alertas de erro. |

### 1.7 Componentes (8 tokens)

| Token | Variável CSS | Light | Dark | Descrição |
|---|---|---|---|---|
| `inputBg` | `--color-input-bg` | `#f8fafc` | `#0f172a` | Fundo de campos de input, textarea, select. Geralmente igual ao `background`. |
| `inputBorder` | `--color-input-border` | `#e2e8f0` | `#334155` | Borda de campos de formulário em estado normal (repouso). |
| `inputFocus` | `--color-input-focus` | `#c9a655` | `#c9a655` | Cor do ring/borda ao focar em um input. Geralmente igual ao `accent`. |
| `buttonPrimaryBg` | `--color-btn-primary-bg` | `#c9a655` | `#c9a655` | Fundo do botão primário (CTA). Usa a cor accent/dourado para destaque máximo. |
| `buttonPrimaryText` | `--color-btn-primary-text` | `#ffffff` | `#0f172a` | Texto do botão primário. Branco no light, escuro no dark. |
| `badgeBg` | `--color-badge-bg` | `#f1f5f9` | `#334155` | Fundo de badges, tags, chips. Tom neutro que contrasta levemente com a superfície. |
| `tooltipBg` | `--color-tooltip-bg` | `#0f172a` | `#f8fafc` | Fundo de tooltips. Invertido em relação ao tema (escuro no light, claro no dark). |
| `tooltipText` | `--color-tooltip-text` | `#f8fafc` | `#0f172a` | Texto de tooltips. Invertido em relação ao tema. |

### 1.8 Efeitos Visuais (8 tokens)

| Token | Variável CSS | Light | Dark | Descrição |
|---|---|---|---|---|
| `overlay` | `--color-overlay` | `#00000060` | `#00000080` | Cor do overlay de modais/drawers. Semi-transparente preto. Mais denso no dark. |
| `shadow` | `--color-shadow` | `#0000001a` | `#00000040` | Cor base para box-shadows. Mais pronunciada no dark mode. |
| `glassTint` | `--color-glass-tint` | `#ffffff40` | `#ffffff10` | Tint do efeito glassmorphism. Branco translúcido, mais opaco no light. |
| `headerBg` | `--color-header-bg` | `#ffffff` | `#1e293b` | Fundo base do header antes do efeito liquid-glass ser aplicado. |
| `scrollbarThumb` | `--color-scrollbar-thumb` | `#c9a655` | `#c9a655` | Cor do polegar da scrollbar customizada. Dourado em ambos os temas. |
| `scrollbarTrack` | `--color-scrollbar-track` | `transparent` | `transparent` | Cor da trilha da scrollbar. Transparente para estética minimalista. |
| `ring` | `--color-ring` | `#c9a65580` | `#c9a65580` | Cor do focus ring (outline) em elementos interativos. Accent com 50% opacidade. |

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
| `blobOpacity` | `--env-blob-opacity` | string (0–1) | Opacidade dos blobs (ex: `"0.20"`) |
| `blobSize` | `--env-blob-size` | string (rem) | Tamanho dos blobs (ex: `"18"` → 18rem) |
| `blobBlur` | `--env-blob-blur` | string (px) | Intensidade do blur dos blobs (ex: `"64"` → 64px) |
| `grainOpacity` | `--env-grain-opacity` | string (0–1) | Opacidade da textura de ruído/grain |
| `grainBlendMode` | `--env-grain-blend` | string | Blend mode do grain (ex: `"multiply"`, `"overlay"`) |
| `grainContrast` | `--env-grain-contrast` | string (%) | Contraste do filtro de grain (ex: `"150"` → 150%) |
| `glassOpacity` | `--env-glass-opacity` | string (0–1) | Opacidade base do glassmorphism |
| `glassBlur` | `--env-glass-blur` | string (px) | Blur do backdrop-filter do glass |
| `glassBorderOpacity` | `--env-glass-border-opacity` | string (0–1) | Opacidade da borda do glass |

### 2.2 Valores Padrão por Ambiente

| Token | Global | Auth (Login) | Client | Manager | Admin |
|---|---|---|---|---|---|
| `pageBg` | `#0f172a` | `#0f172a` | `#0f172a` | `#0f172a` | `#0f172a` |
| `blob1Color` | `#c9a655` | `#c9a655` | `#c9a655` | `#c9a655` | `#c9a655` |
| `blob2Color` | `#e8d48b` | `#c9a655` | `#e8d48b` | `#d4b366` | `#e8d48b` |
| `blob3Color` | `#a8873a` | `#c9a655` | `#a8873a` | `#b8953e` | `#a8873a` |
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
- **Auth**: Blobs maiores (24rem), mais blur (100px), menos opacidade (0.15), grain mais sutil (0.10). Todos os 3 blobs usam a mesma cor dourada para um efeito uniforme.
- **Manager**: Blobs intermediários (20rem), blur moderado (80px), paleta dourada própria.
- **Admin**: Opacidade dos blobs em 0.18 (levemente reduzida).

---

## 3. Efeitos Visuais CSS

### 3.1 Liquid Glass (`.liquid-glass`)

Glassmorphism premium para cards, headers e superfícies elevadas.

**Light mode:**
```css
background: linear-gradient(135deg,
  rgba(255, 255, 255, 0.25) 0%,
  rgba(255, 255, 255, 0.08) 50%,
  rgba(255, 255, 255, 0.15) 100%
);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.08),
  inset 0 1px 0 rgba(255, 255, 255, 0.3),
  inset 0 -1px 0 rgba(255, 255, 255, 0.1);
```

**Dark mode:**
```css
background: linear-gradient(135deg,
  rgba(255, 255, 255, 0.06) 0%,
  rgba(255, 255, 255, 0.02) 50%,
  rgba(255, 255, 255, 0.04) 100%
);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.08),
  inset 0 -1px 0 rgba(255, 255, 255, 0.03);
```

**Uso:** Header principal, cards flutuantes, painéis de conteúdo.

### 3.2 Liquid Glass Gold (`.liquid-glass-gold`)

Variação dourada do glassmorphism para elementos interativos e destaques. Utiliza os tokens de gradiente (`--color-gradient-start/mid/end`).

**Light mode:**
```css
background: linear-gradient(135deg,
  color-mix(in srgb, var(--color-gradient-start) 25%, transparent) 0%,
  color-mix(in srgb, var(--color-gradient-mid) 15%, transparent) 40%,
  color-mix(in srgb, var(--color-gradient-end) 20%, transparent) 70%,
  color-mix(in srgb, var(--color-gradient-start) 18%, transparent) 100%
);
backdrop-filter: blur(16px) saturate(160%);
border: 1px solid color-mix(in srgb, var(--color-gradient-start) 30%, transparent);
box-shadow:
  0 4px 20px color-mix(in srgb, var(--color-gradient-start) 12%, transparent),
  inset 0 1px 0 color-mix(in srgb, var(--color-gradient-mid) 25%, transparent),
  inset 0 -1px 0 color-mix(in srgb, var(--color-gradient-end) 10%, transparent);
```

**Dark mode:** Opacidades reduzidas (~70% dos valores light).

**Uso:** Elementos interativos ativos, destaques de gamificação, cards premium.

### 3.3 Icon Box (`.icon-box`, `.icon-box-sm`, `.icon-box-lg`)

Contêiner padronizado para ícones em toda a plataforma.

| Variante | Classe | Tamanho | Border Radius |
|---|---|---|---|
| Small | `.icon-box-sm` | 2rem (32px) | 0.5rem (8px) |
| Default | `.icon-box` | 2.5rem (40px) | 0.75rem (12px) |
| Large | `.icon-box-lg` | 3rem (48px) | 0.875rem (14px) |

**Estilos comuns:**
```css
display: flex;
align-items: center;
justify-content: center;
background-color: color-mix(in srgb, var(--color-bg) 80%, black);
border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
color: var(--color-accent);
transition: all 0.3s ease;
```

**Dark mode:** `background-color: color-mix(in srgb, var(--color-surface) 60%, black)`

### 3.4 Scrollbar Customizada

```css
*::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}
*::-webkit-scrollbar-thumb {
  background: var(--color-accent);
  border-radius: 999px;
}
*::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--color-accent) 80%, black);
}
/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent) transparent;
}
```

---

## 4. Animações

Definidas em `tailwind.config.ts` como keyframes + classes de animação.

### 4.1 Keyframes

| Nome | Keyframes | Descrição |
|---|---|---|
| `blob` | `0%: translate(0,0) scale(1)` → `33%: translate(30px,-50px) scale(1.1)` → `66%: translate(-20px,20px) scale(0.9)` → `100%: translate(0,0) scale(1)` | Movimento orgânico fluido dos blobs de fundo. Simula flutuação amebóide. |
| `fade-in` | `0%: opacity(0) translateY(10px)` → `100%: opacity(1) translateY(0)` | Entrada suave de elementos com deslocamento vertical sutil. |
| `slide-up` | `0%: opacity(0) translateY(20px)` → `100%: opacity(1) translateY(0)` | Entrada de baixo para cima com deslocamento mais acentuado que fade-in. |
| `shimmer` | `0%: backgroundPosition(200% 0)` → `100%: backgroundPosition(-200% 0)` | Efeito de brilho que percorre o gradiente. Usado no texto da marca. |
| `float` | `0%,100%: translateY(0)` → `50%: translateY(-10px)` | Flutuação suave para cima e para baixo. Aplicado ao logo na página de login. |
| `accordion-down` | `from: height(0)` → `to: height(var(--radix-accordion-content-height))` | Expansão de conteúdo de acordeão. |
| `accordion-up` | `from: height(var(--radix-accordion-content-height))` → `to: height(0)` | Contração de conteúdo de acordeão. |

### 4.2 Classes de Animação

| Classe Tailwind | Animação | Duração | Easing | Loop |
|---|---|---|---|---|
| `animate-blob` | blob | 7s | default | ∞ |
| `animate-fade-in` | fade-in | 0.5s | ease-out | once (forwards) |
| `animate-slide-up` | slide-up | 0.4s | ease-out | once (forwards) |
| `animate-shimmer` | shimmer | 3s | ease-in-out | ∞ |
| `animate-float` | float | 3s | ease-in-out | ∞ |
| `animate-accordion-down` | accordion-down | 0.2s | ease-out | once |
| `animate-accordion-up` | accordion-up | 0.2s | ease-out | once |

### 4.3 Classe Auxiliar

```css
.animation-delay-2000 { animation-delay: 2s; }
```
Usada para escalonar a entrada de múltiplos blobs (o 3º blob usa delay de 2s).

---

## 5. Variáveis CSS shadcn/ui (Tokens HSL)

Definidas em `index.css` dentro de `@layer base`. Usadas pelos componentes shadcn/ui.

### 5.1 Light Mode (`:root`)

| Token | Valor HSL | Uso |
|---|---|---|
| `--background` | `0 0% 100%` | Fundo da aplicação |
| `--foreground` | `222.2 84% 4.9%` | Texto principal |
| `--card` | `0 0% 100%` | Fundo de cards |
| `--card-foreground` | `222.2 84% 4.9%` | Texto de cards |
| `--popover` | `0 0% 100%` | Fundo de popovers |
| `--popover-foreground` | `222.2 84% 4.9%` | Texto de popovers |
| `--primary` | `222.2 47.4% 11.2%` | Cor primária (botões, links) |
| `--primary-foreground` | `210 40% 98%` | Texto sobre primário |
| `--secondary` | `210 40% 96.1%` | Cor secundária |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | Texto sobre secundário |
| `--muted` | `210 40% 96.1%` | Fundos atenuados |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Texto atenuado |
| `--accent` | `210 40% 96.1%` | Cor de accent shadcn |
| `--accent-foreground` | `222.2 47.4% 11.2%` | Texto sobre accent shadcn |
| `--destructive` | `0 84.2% 60.2%` | Ações destrutivas |
| `--destructive-foreground` | `210 40% 98%` | Texto sobre destructive |
| `--border` | `214.3 31.8% 91.4%` | Bordas de componentes shadcn |
| `--input` | `214.3 31.8% 91.4%` | Bordas de inputs shadcn |
| `--ring` | `222.2 84% 4.9%` | Focus ring shadcn |
| `--radius` | `0.5rem` | Border-radius base |

### 5.2 Dark Mode (`.dark`)

| Token | Valor HSL |
|---|---|
| `--background` | `222.2 84% 4.9%` |
| `--foreground` | `210 40% 98%` |
| `--card` | `222.2 84% 4.9%` |
| `--card-foreground` | `210 40% 98%` |
| `--popover` | `222.2 84% 4.9%` |
| `--popover-foreground` | `210 40% 98%` |
| `--primary` | `210 40% 98%` |
| `--primary-foreground` | `222.2 47.4% 11.2%` |
| `--secondary` | `217.2 32.6% 17.5%` |
| `--secondary-foreground` | `210 40% 98%` |
| `--muted` | `217.2 32.6% 17.5%` |
| `--muted-foreground` | `215 20.2% 65.1%` |
| `--accent` | `217.2 32.6% 17.5%` |
| `--accent-foreground` | `210 40% 98%` |
| `--destructive` | `0 62.8% 30.6%` |
| `--destructive-foreground` | `210 40% 98%` |
| `--border` | `217.2 32.6% 17.5%` |
| `--input` | `217.2 32.6% 17.5%` |
| `--ring` | `212.7 26.8% 83.9%` |

### 5.3 Sidebar (Light / Dark)

| Token | Light | Dark |
|---|---|---|
| `--sidebar-background` | `0 0% 98%` | `240 5.9% 10%` |
| `--sidebar-foreground` | `240 5.3% 26.1%` | `240 4.8% 95.9%` |
| `--sidebar-primary` | `240 5.9% 10%` | `224.3 76.3% 48%` |
| `--sidebar-primary-foreground` | `0 0% 98%` | `0 0% 100%` |
| `--sidebar-accent` | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--sidebar-accent-foreground` | `240 5.9% 10%` | `240 4.8% 95.9%` |
| `--sidebar-border` | `220 13% 91%` | `240 3.7% 15.9%` |
| `--sidebar-ring` | `217.2 91.2% 59.8%` | `217.2 91.2% 59.8%` |

---

## 6. Tipografia

### 6.1 Família de Fontes

Fonte padrão do sistema (sem download externo):
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
| `--radius` (shadcn) | `0.5rem` (8px) | Padrão base dos componentes shadcn |
| `rounded-lg` | `var(--radius)` | Componentes shadcn |
| `rounded-md` | `calc(var(--radius) - 2px)` | Variante menor |
| `rounded-sm` | `calc(var(--radius) - 4px)` | Variante mínima |
| `rounded-xl` | 0.75rem (12px) | Inputs, botões, icon-box |
| `rounded-2xl` | 1rem (16px) | Cards, header |
| `rounded-[2.5rem]` | 2.5rem (40px) | Card de login |
| `rounded-full` | 9999px | Avatares, pills, botão de logout |

### 7.3 Breakpoints

| Breakpoint | Largura | Comportamentos |
|---|---|---|
| Mobile | < 640px | Nome do app oculto, seletor de idioma oculto |
| `sm` | ≥ 640px | Nome do app visível no header |
| `md` | ≥ 768px | Seletor de idioma visível, padding `p-6` |
| `lg` | ≥ 1024px | Layout expandido |
| `xl` | ≥ 1280px | Container máximo |
| `2xl` | ≥ 1400px | Container com `max-width: 1400px` |

---

## 8. Mapeamento de Injeção CSS

O `BrandContext` injeta duas categorias de variáveis CSS:

### 8.1 ColorScheme → CSS Variables

```
ColorScheme.background    → --color-bg
ColorScheme.surface       → --color-surface
ColorScheme.surfaceHover  → --color-surface-hover
ColorScheme.card          → --color-card
ColorScheme.textMain      → --color-text-main
ColorScheme.textMuted     → --color-text-muted
ColorScheme.textInverted  → --color-text-inverted
ColorScheme.border        → --color-border
ColorScheme.borderSubtle  → --color-border-subtle
ColorScheme.accent        → --color-accent
ColorScheme.accentHover   → --color-accent-hover
ColorScheme.accentForeground → --color-accent-fg
ColorScheme.accentMuted   → --color-accent-muted
ColorScheme.success       → --color-success
ColorScheme.successBg     → --color-success-bg
ColorScheme.warning       → --color-warning
ColorScheme.warningBg     → --color-warning-bg
ColorScheme.error         → --color-error
ColorScheme.errorBg       → --color-error-bg
ColorScheme.inputBg       → --color-input-bg
ColorScheme.inputBorder   → --color-input-border
ColorScheme.inputFocus    → --color-input-focus
ColorScheme.buttonPrimaryBg → --color-btn-primary-bg
ColorScheme.buttonPrimaryText → --color-btn-primary-text
ColorScheme.badgeBg       → --color-badge-bg
ColorScheme.tooltipBg     → --color-tooltip-bg
ColorScheme.tooltipText   → --color-tooltip-text
ColorScheme.overlay       → --color-overlay
ColorScheme.shadow        → --color-shadow
ColorScheme.glassTint     → --color-glass-tint
ColorScheme.headerBg      → --color-header-bg
ColorScheme.scrollbarThumb → --color-scrollbar-thumb
ColorScheme.scrollbarTrack → --color-scrollbar-track
ColorScheme.ring          → --color-ring
ColorScheme.gradientStart → --color-gradient-start
ColorScheme.gradientMid   → --color-gradient-mid
ColorScheme.gradientEnd   → --color-gradient-end
```

### 8.2 EnvironmentEffects → CSS Variables

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

## 9. Arquivos-Fonte

| Arquivo | Conteúdo |
|---|---|
| `src/types.ts` | Interfaces `ColorScheme`, `EnvironmentEffects`, `EnvironmentKey`, `EnvironmentThemes`, `ThemeModeConfig` |
| `src/lib/themeDefaults.ts` | Valores padrão `DEFAULT_LIGHT`, `DEFAULT_DARK`, `DEFAULT_ENVIRONMENT_THEMES`, funções `mergeScheme` e `mergeEnvironmentEffects` |
| `src/contexts/BrandContext.tsx` | Injeção dinâmica de CSS variables, funções `buildCssVars` e `buildEnvCssVars` |
| `src/index.css` | Tokens HSL shadcn/ui, efeitos CSS (liquid-glass, icon-box, scrollbar) |
| `tailwind.config.ts` | Keyframes, animações, cores semânticas mapeadas para HSL, breakpoints, border-radius |
| `src/components/hub/GlobalEffects.tsx` | Renderização dos blobs animados e grain usando variáveis CSS de ambiente |
