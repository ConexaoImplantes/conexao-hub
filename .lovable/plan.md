

## Plano: Cabeçalho Totalmente Personalizável

### Problema Atual
O cabeçalho usa a classe CSS `.liquid-glass` que tem cores hardcoded (`rgba(255,255,255,...)`) e ignora completamente a variável `--color-header-bg` que já existe no sistema de temas. Além disso, vários elementos têm opacidades e cores fixas (anel do avatar `ring-white/20`, bordas, sombras).

### Alterações

**1. `src/components/hub/Layout.tsx`**
- Substituir a classe `liquid-glass` por inline styles usando variáveis CSS do tema:
  - `--color-header-bg` para o fundo
  - `--color-glass-tint` para o tint do glass
  - `--env-glass-blur`, `--env-glass-opacity`, `--env-glass-border-opacity` para os efeitos
- Substituir `ring-white/20` do avatar por `color-mix(in srgb, var(--color-text-main) 20%, transparent)`
- Garantir que **todas** as cores do header (fundo, bordas, sombras, glow do logo, seletor de idioma, botão logout) usem exclusivamente variáveis CSS `var(--color-*)`

**2. `src/index.css`**
- Atualizar a classe `.liquid-glass` para usar variáveis CSS em vez de rgba hardcoded, ou criar uma variante `.liquid-glass-header` que respeite `--color-header-bg`
- Substituir todos os `rgba(255,255,255,...)` fixos por referências a `--color-glass-tint` e `--color-header-bg`

**3. `src/components/hub/ThemeEditorPanel.tsx`**
- Verificar que o campo `headerBg` está exposto e funcional no editor (já existe na linha 113)
- Confirmar que `glassTint` também está acessível

### Resultado
Todas as cores visíveis no cabeçalho serão controladas pelo painel de temas do Super Admin, incluindo fundo, transparência do glass, bordas, sombras e elementos internos.

