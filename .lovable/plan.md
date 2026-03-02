

## Plano: Seção Cabeçalho + Tokens de Hover no Editor de Temas

### Problema
1. Os tokens `headerBg` e `glassTint` existem na categoria "Efeitos & UI" mas não são facilmente encontráveis — o admin espera uma seção dedicada "Cabeçalho"
2. Não existem tokens dedicados para personalizar efeitos de hover (cor de fundo ao passar o mouse em cards, botões, divs, bordas)

### Alterações

**1. Novos tokens de hover no `ColorScheme` (`src/types.ts`)**
Adicionar 4 novos tokens:
- `hoverBg` — cor de fundo ao passar o mouse em cards/divs
- `hoverBorder` — cor da borda no hover
- `hoverScale` — não é cor, mas controla intensidade (string, ex: "1.02")
- `hoverShadow` — cor da sombra no hover

**2. Atualizar defaults (`src/lib/themeDefaults.ts`)**
Adicionar valores padrão para os novos tokens no `DEFAULT_DARK`

**3. Injetar variáveis CSS (`src/contexts/BrandContext.tsx`)**
Adicionar no `buildCssVars`:
- `--color-hover-bg`
- `--color-hover-border`  
- `--color-hover-shadow`

**4. Reorganizar categorias no editor (`src/components/hub/ThemeEditorPanel.tsx`)**
- Criar nova categoria **"🏛️ Cabeçalho"** com: `headerBg`, `glassTint`, `ring`
- Criar nova categoria **"👆 Efeitos de Hover"** com: `surfaceHover`, `hoverBg`, `hoverBorder`, `hoverShadow`
- Remover esses tokens da categoria "Efeitos & UI" para evitar duplicação

**5. Aplicar tokens de hover nos componentes**
- `MaterialCard.tsx` — substituir `hover:shadow-2xl` e borders hardcoded por `var(--color-hover-*)`
- `CollectionCard.tsx` — mesma lógica
- `Layout.tsx` — botões do header já usam variáveis, verificar hover states
- `src/index.css` — atualizar `.liquid-glass` hover se houver

**6. CSS fallbacks (`src/index.css`)**
Adicionar fallbacks para os novos tokens no `:root`

