

## Plano: Criar Documento de Branding Completo

Criar o arquivo `docs/design-system.md` na raiz do projeto com a documentação completa e detalhada de:

### Conteúdo do documento

1. **Todas as 38 cores do ColorScheme** — organizadas por categoria (Base, Tipografia, Bordas, Marca, Gradientes, Feedback, Componentes, Efeitos Visuais), com nome do token, variável CSS, valor HEX padrão (light e dark) e explicação de uso

2. **Efeitos de Ambiente (EnvironmentEffects)** — todos os 13 tokens por ambiente (pageBg, blob1/2/3Color, blobOpacity/Size/Blur, grainOpacity/BlendMode/Contrast, glassOpacity/Blur/BorderOpacity) com valores padrão de cada ambiente (Global, Auth, Client, Manager, Admin)

3. **Efeitos visuais CSS** — Liquid Glass, Liquid Glass Gold, Icon Box (3 tamanhos), scrollbar customizada, com o CSS completo

4. **Animações** — Todas as 6 keyframes (blob, fade-in, slide-up, shimmer, float, accordion) com duração, easing e uso

5. **Variáveis CSS shadcn/ui** — Tokens HSL de light e dark mode

6. **Tipografia, espaçamento, breakpoints, border-radius** — Referência completa

### Arquivo afetado

| Arquivo | Ação |
|---|---|
| `docs/design-system.md` | Criar — documento completo de branding com todas as cores, efeitos, animações e tokens |

O documento existente `docs/branding-guide.md` será mantido como está. O novo arquivo será a referência técnica definitiva, extraída diretamente do código fonte (`themeDefaults.ts`, `index.css`, `tailwind.config.ts`, `types.ts`, `BrandContext.tsx`).

