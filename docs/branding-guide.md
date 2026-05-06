# Guia de Branding & Design System — Hub Conexão Digital Implant

---

## 1. Identidade Visual

### 1.1 Nome da Marca

- **Nome oficial**: Conexão Digital Implant
- **Nome curto**: Hub Conexão (ou "Conexão")
- **Configurável via**: Banco de dados (`system_config.app_name`)
- **Titulo HTML**: `<title>Conexão</title>`

### 1.2 Logo

- **Logo dinâmico**: Carregado via `system_config.logo_url`
- **Fallback**: Ícone quadrado arredondado com as duas primeiras letras do nome (`HU` para "Hub Conexão")
- **Estilo do fallback**: Quadrado com `border-radius: 1rem`, gradiente metálico dourado, texto branco em negrito
- **Efeito hover**: Rotação 12° + escala 110%, transição 700ms
- **Sombra do logo**: `0 25px 50px -12px rgba(201,166,85,0.4)`

---

## 2. Paleta de Cores

### 2.1 Cores Primárias da Marca

| Nome | HEX | Uso |
|---|---|---|
| **Azul Marinho Profundo** | `#0a1e3d` / `#0f172a` | Background (dark mode) |
| **Dourado Principal** | `#c9a655` | Cor de destaque (accent) em toda a plataforma |
| **Dourado Claro** | `#e8d48b` | Ponto médio do gradiente metálico |
| **Dourado Escuro** | `#a8873a` | Ponto final do gradiente metálico |

### 2.2 Gradiente Metálico Premium

O gradiente-assinatura da marca, usado em elementos de alto impacto (logo, botões de login, avatares):

```css
background: linear-gradient(135deg, #c9a655 0%, #e8d48b 40%, #a8873a 70%, #c9a655 100%);
```

**Onde é usado:**
- Botão principal de login ("Entrar na Plataforma")
- Avatar do usuário no header
- Ícone do logo (fallback)
- Texto animado do nome da marca na página de login

### 2.3 Tema Dark (único — modo permanente)

A plataforma opera em **dark mode permanente**. Não há suporte a tema claro.

| Token CSS | HEX | Uso |
|---|---|---|
| `--color-bg` | `#0f172a` | Fundo da página (azul marinho profundo) |
| `--color-surface` | `#1e293b` | Cards, modais, superfícies |
| `--color-text-main` | `#f8fafc` | Texto principal |
| `--color-text-muted` | `#94a3b8` | Texto secundário, labels |
| `--color-border` | `transparent` | Bordas (invisíveis no dark) |
| `--color-accent` | `#c9a655` | Destaques, ícones ativos |
| `--color-success` | `#22c55e` | Confirmações |
| `--color-warning` | `#eab308` | Alertas |
| `--color-error` | `#ef4444` | Erros |

### 2.4 Tokens shadcn/ui (HSL — apenas dark)

Definidos em `index.css` (única paleta carregada):

| Token | HSL |
|---|---|
| `--background` | `222.2 84% 4.9%` |
| `--foreground` | `210 40% 98%` |
| `--primary` | `210 40% 98%` |
| `--secondary` | `217.2 32.6% 17.5%` |
| `--muted` | `217.2 32.6% 17.5%` |
| `--muted-foreground` | `215 20.2% 65.1%` |
| `--destructive` | `0 62.8% 30.6%` |
| `--border` | `217.2 32.6% 17.5%` |
| `--radius` | `0.5rem` |

### 2.6 Sistema de Temas Dinâmico

As cores são **configuráveis em tempo real** pelo administrador via banco de dados (`system_config.theme_dark` + `environment_themes` para overrides por ambiente: auth, client, manager, admin). O `BrandContext` injeta CSS custom properties no `:root` do documento, permitindo white-labeling completo sem alterar código.

---

## 3. Tipografia

### 3.1 Fonte Principal

- **Família**: Fonte padrão do sistema (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`)
- **Motivo**: Performance máxima, sem download de fontes externas

### 3.2 Pesos Utilizados

| Peso | Classe Tailwind | Uso |
|---|---|---|
| 400 (Regular) | `font-normal` | Texto corrido, parágrafos |
| 500 (Medium) | `font-medium` | Labels de formulário, descrições |
| 600 (Semibold) | `font-semibold` | Subtítulos, badges, tags |
| 700 (Bold) | `font-bold` | Títulos, botões, nomes, headers |

### 3.3 Tamanhos de Texto

| Classe | Tamanho | Uso |
|---|---|---|
| `text-3xl` | 1.875rem | Título principal (página de login) |
| `text-xl` | 1.25rem | Nome do app no header |
| `text-lg` | 1.125rem | Nome da marca animado |
| `text-sm` | 0.875rem | Descrições, tooltips |
| `text-xs` | 0.75rem | Labels de formulário, badges, metadata |
| `text-[10px]` | 0.625rem | Micro-texto (hints, sublabels) |
| `text-[9px]` | 0.5625rem | XP/nível do usuário no header |

### 3.4 Estilos Especiais de Texto

- **Labels de formulário**: `text-xs font-bold uppercase tracking-wider` — cor `--color-text-muted`
- **Títulos**: `text-3xl font-bold tracking-tight` — cor `--color-text-main`
- **Nome da marca (login)**: Texto com gradiente shimmer animado:
  ```css
  background-image: linear-gradient(90deg, #c9a655, #e8d48b, #a8873a, #c9a655);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
  ```

---

## 4. Efeitos Visuais

### 4.1 Liquid Glass (Glassmorphism)

Classe CSS: `.liquid-glass` — usado em headers, cards flutuantes.

```css
background: linear-gradient(135deg,
  rgba(255,255,255,0.06) 0%,
  rgba(255,255,255,0.02) 50%,
  rgba(255,255,255,0.04) 100%
);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,0.08);
box-shadow:
  0 8px 32px rgba(0,0,0,0.3),
  inset 0 1px 0 rgba(255,255,255,0.08),
  inset 0 -1px 0 rgba(255,255,255,0.03);
```

**Onde é usado**: Header principal, cards flutuantes

### 4.2 Liquid Glass Gold

Classe CSS: `.liquid-glass-gold` — variação dourada do glassmorphism para elementos ativos/interativos.

```css
background: linear-gradient(135deg,
  rgba(201,166,85,0.18) 0%,
  rgba(232,212,139,0.08) 40%,
  rgba(168,135,58,0.14) 70%,
  rgba(201,166,85,0.10) 100%
);
backdrop-filter: blur(16px) saturate(160%);
border: 1px solid rgba(201,166,85,0.22);
box-shadow:
  0 4px 20px rgba(201,166,85,0.12),
  inset 0 1px 0 rgba(232,212,139,0.20),
  inset 0 -1px 0 rgba(168,135,58,0.10);
```

**Onde é usado**: Elementos interativos ativos, destaques de gamificação

### 4.3 Blobs Animados (Background)

Esferas decorativas com blur intenso que flutuam no fundo:

```css
/* Keyframe */
@keyframes blob {
  0%   { transform: translate(0px, 0px) scale(1); }
  33%  { transform: translate(30px, -50px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
animation: blob 7s infinite;
```

**Cores dos blobs**: `amber-500`, `yellow-500`, `amber-400` (todos com `opacity: 20%` e `blur-3xl`)

**Textura de ruído**: Overlay com SVG de noise para granularidade sutil:
```css
background-image: url('https://grainy-gradients.vercel.app/noise.svg');
opacity: 20%;
```

### 4.4 Animações Personalizadas

| Nome | Classe Tailwind | Duração | Uso |
|---|---|---|---|
| **fade-in** | `animate-fade-in` | 0.5s | Entrada de conteúdo principal |
| **slide-up** | `animate-slide-up` | 0.4s | Entrada de alertas e modais |
| **shimmer** | `animate-shimmer` | 3s (loop) | Texto gradiente animado |
| **float** | `animate-float` | 3s (loop) | Logo na página de login |
| **blob** | `animate-blob` | 7s (loop) | Esferas de fundo |
| **accordion** | `animate-accordion-down/up` | 0.2s | Acordeões |

### 4.5 Transições Padrão

| Propriedade | Duração | Easing | Uso |
|---|---|---|---|
| `colors` | 300ms | ease | Hover em botões, links |
| `all` | 300ms | ease | Icon boxes, cards |
| `transform` | 500ms | ease | Rotação de ícones e hover

---

## 5. Componentes de UI

### 5.1 Icon Box (Caixa de Ícone)

Contêiner padronizado para ícones em toda a plataforma:

| Variante | Classe | Tamanho | Border Radius |
|---|---|---|---|
| **Default** | `.icon-box` | 2.5rem (40px) | 0.75rem (12px) |
| **Small** | `.icon-box-sm` | 2rem (32px) | 0.5rem (8px) |
| **Large** | `.icon-box-lg` | 3rem (48px) | 0.875rem (14px) |

**Estilo:**
- Fundo: mix de `--color-bg` com preto (80/20)
- Borda: `--color-accent` com 25% de opacidade
- Cor do ícone: `--color-accent` (dourado)
- Dark mode: fundo mais escuro (mix de `--color-surface` com preto)

### 5.2 Botões

**Botão Principal (Login/CTA):**
- Gradiente metálico dourado
- Texto: `zinc-900` (escuro sobre dourado)
- Font: bold, py-4
- Border-radius: `rounded-xl` (0.75rem)
- Sombra: `0 10px 25px -5px rgba(201,166,85,0.3)`
- Hover: overlay branco translúcido desliza de baixo + escala 102%
- Active: escala 95%

**Botão Secundário:**
- Background: `--color-bg`
- Texto: `--color-text-muted`
- Border-radius: `rounded-lg`

**Botão de Logout:**
- Background: `red-500/10`
- Hover: `red-500` sólido + texto branco
- Sombra hover: `0 0 20px rgba(239,68,68,0.3)`
- Formato: circular (40px)

### 5.3 Inputs de Formulário

- Background: `bg-black/5 dark:bg-white/5`
- Border: `border-white/10`
- Padding: `p-4`
- Border-radius: `rounded-xl`
- Shadow: `shadow-inner`
- Hover: `bg-black/10 dark:bg-white/10`
- Focus: `ring-2` (com cor do accent)

### 5.4 Cards (Login)

- Background: `color-mix(in srgb, var(--color-surface) 40%, transparent)`
- Backdrop-filter: `blur(2rem)`
- Border: `border-white/20 dark:border-white/10`
- Border-radius: `rounded-[2.5rem]` (40px)
- Sombra: `shadow-2xl`
- Linha decorativa superior: gradiente horizontal com `--color-accent`

### 5.5 Header

- Posição: `sticky top-0 z-40`
- Estilo: `.liquid-glass rounded-2xl`
- Margem do topo: `pt-4` (flutuante)
- Cor do header adapta-se à patente do usuário (borda, fundo com 8% de opacidade)

### 5.6 Scrollbar Customizada

```css
width: 5px;
background: var(--color-accent);  /* dourado */
border-radius: 999px;
```

---

## 6. Pacote de Ícones

### 6.1 Biblioteca

- **Pacote**: `lucide-react` (versão 0.462.0)
- **Estilo**: Outline (stroke), monocromáticos
- **Tamanho padrão**: 24px (customizado por contexto)

### 6.2 Ícones Utilizados

| Ícone | Import | Contexto |
|---|---|---|
| `Sparkles` | `lucide-react` | Destaques premium / gamificação |
| `LogOut` | `lucide-react` | Botão de logout |
| `Globe` | `lucide-react` | Seletor de idioma |
| `Star` | `lucide-react` | XP/nível do usuário |
| `UserPlus` | `lucide-react` | Cadastro por convite |
| `Eye` / `EyeOff` | `lucide-react` | Toggle visibilidade de senha |
| `Shield` | `lucide-react` | Perfil pré-definido (convite) |
| `Sparkles` | `lucide-react` | Destaques premium |
| `Info` | `lucide-react` | Informações/dicas |
| `Database` | `lucide-react` | Configuração de banco |
| `AlertTriangle` | `lucide-react` | Alertas e erros |
| `ChevronRight` | `lucide-react` | Indicador de ação em botões |
| `Copy` / `Check` | `lucide-react` | Copiar para clipboard |
| `X` | `lucide-react` | Fechar modal |
| `ArrowLeft` | `lucide-react` | Navegação voltar |
| `Box` | `lucide-react` | Ícone genérico |
| `Briefcase` | `lucide-react` | Perfil profissional |
| `User` | `lucide-react` | Perfil de usuário |

### 6.3 Tamanhos por Contexto

| Contexto | Tamanho |
|---|---|
| Header (tema, logout) | 18px |
| Header (idioma) | 14px |
| Nível do usuário (estrela) | 8px |
| Formulários (eye toggle) | 20px |
| Alertas | 16-18px |
| Botão CTA (seta) | 18px |
| Modais (fechar) | 24px |

---

## 7. Gamificação Visual

### 7.1 Sistema de Níveis

Os níveis são dinâmicos, configurados pelo admin no banco de dados (`gamification_levels`).

**Níveis padrão definidos em código (fallback):**

| Nível | Pontos Mínimos |
|---|---|
| Iniciante | 0 |
| Bronze | 100 |
| Prata | 300 |
| Ouro | 600 |
| Master | 1000 |

### 7.2 Reflexo da Patente no Header

O header reflete visualmente o nível do usuário:
- **Borda**: cor da patente com 25% de opacidade
- **Fundo**: cor da patente com 8% de opacidade
- **Sombra**: glow sutil com a cor da patente
- **Gradiente overlay**: diagonal com a cor da patente

```javascript
// Exemplo de aplicação
style={{
  border: `1px solid ${levelColor}25`,
  backgroundColor: `${levelColor}08`,
  boxShadow: `0 0 20px ${levelColor}08, inset 0 0 30px ${levelColor}05`,
}}
```

### 7.3 Exibição de XP

- Posição: header, ao lado do nome do usuário
- Formato: `{NÍVEL} · {PONTOS} XP`
- Fonte: `text-[9px] uppercase tracking-wide font-semibold`
- Cor: cor da patente atual (ou dourado padrão)
- Ícone: estrela preenchida com a cor da patente

---

## 8. Internacionalização

### 8.1 Idiomas Suportados

| Código | Idioma | Flag |
|---|---|---|
| `pt-br` | Português (Brasil) | 🇧🇷 |
| `en-us` | English (US) | 🇺🇸 |
| `es-es` | Español | 🇪🇸 |

### 8.2 Seletor de Idioma

- Posição: header, à esquerda do toggle de tema
- Estilo: pill compacto com ícone de globo
- Texto: sigla do idioma em maiúsculas (PT, EN, ES)
- Fonte: `text-xs font-bold uppercase`
- Visibilidade: oculto em mobile (`hidden md:flex`)

---

## 9. Layout e Espaçamento

### 9.1 Container

```css
max-width: 1400px (2xl breakpoint);
padding: 2rem;
margin: auto;
```

### 9.2 Border Radius

| Token | Valor | Uso |
|---|---|---|
| `--radius` | 0.5rem (8px) | Padrão shadcn |
| `rounded-xl` | 0.75rem (12px) | Inputs, botões, icon-box |
| `rounded-2xl` | 1rem (16px) | Cards, header |
| `rounded-[2.5rem]` | 2.5rem (40px) | Card de login |
| `rounded-full` | 9999px | Avatares, pills, botão de logout |

### 9.3 Breakpoints Responsivos

| Breakpoint | Largura | Comportamentos |
|---|---|---|
| Mobile | < 640px | Nome do app oculto, seletor de idioma oculto, info do usuário oculta |
| Tablet (`md`) | ≥ 768px | Seletor de idioma visível, padding `p-6` |
| Desktop (`sm`) | ≥ 640px | Nome do app visível no header |

---

## 10. Dark Mode (Único — Permanente)

### 10.1 Implementação

- **Modo único**: Dark — não há toggle nem suporte a tema claro.
- **Classe CSS**: `.dark` aplicada permanentemente ao `<html>`.
- **Sem `dark:` prefix**: como só existe um modo, classes Tailwind escrevem direto a versão escura.
- **Configuração**: cores ajustáveis pelo admin via `system_config.theme_dark` (42 tokens).

### 10.2 Paleta consolidada

| Elemento | Valor |
|---|---|
| Fundo | `#0f172a` (azul marinho) |
| Superfícies | `#1e293b` (slate escuro) |
| Bordas | `transparent` |
| Texto principal | `#f8fafc` |
| Texto secundário | `#94a3b8` |
| Accent | `#c9a655` (dourado) |
| Glass effect | 6% branco com blur 20px |
| Scrollbar | Dourado sobre transparente |

---

## 11. SEO e Metadados

### 11.1 Tags

```html
<title>Conexão</title>
<meta name="description" content="Portal de compartilhamento de conhecimento e materiais da empresa Conexão Implantes">
<meta property="og:type" content="website">
<meta property="og:title" content="Conexão">
<meta property="og:description" content="Portal de compartilhamento de conhecimento e materiais da empresa Conexão Implantes">
<meta name="twitter:card" content="summary_large_image">
```

### 11.2 Open Graph Image

URL da imagem de preview social configurada nos meta tags.

---

## 12. Stack Técnica de Design

| Ferramenta | Versão | Propósito |
|---|---|---|
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **tailwindcss-animate** | 1.0.7 | Animações declarativas |
| **shadcn/ui** | - | Componentes base (dialog, button, toast, etc.) |
| **Lucide React** | 0.462.0 | Pacote de ícones (outline) |
| **canvas-confetti** | 1.9.4 | Efeitos de celebração (gamificação) |
| **Recharts** | 2.15.4 | Gráficos e dashboards |

---

## 13. Regras de Uso do Branding

### ✅ Fazer

- Sempre usar as CSS variables (`--color-*`) em vez de cores hardcoded
- Manter o dourado como única cor de destaque
- Usar `icon-box` para ícones em contextos de card/lista
- Aplicar `liquid-glass` para elementos flutuantes
- Respeitar o gradiente metálico nos CTAs principais

### ❌ Não Fazer

- Não usar roxo (foi completamente removido da marca)
- Não usar fontes externas (manter system fonts)
- Não hardcodar cores em componentes
- Não usar mais de uma cor de accent simultaneamente
- Não remover o blur/glass dos headers e cards
