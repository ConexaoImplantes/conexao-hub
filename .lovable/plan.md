

## Plano: Remover Light Mode e Corrigir Personalização de Cores

### Problema
1. O sistema mantém dois esquemas de cores (Light e Dark) mas o projeto usa exclusivamente Dark Mode
2. As cores personalizadas no painel admin podem não estar sendo aplicadas corretamente porque o CSS injeta variáveis tanto em `:root` quanto em `.dark`, e o esquema Light pode estar sobrescrevendo valores

### Causa Raiz
No `BrandContext.tsx`, o CSS é gerado assim:
```
:root { ...themeLight vars... }
.dark { ...themeDark vars... }
```
Como o `<html>` sempre tem a classe `dark`, as variáveis do Dark sobrescrevem as do `:root`. Porém, quando o admin edita cores, ele pode estar editando o esquema Light (que é o padrão no editor, linha 315), e essas mudanças nunca aparecem porque o Dark está ativo.

### Alterações Planejadas

**1. `src/contexts/ThemeContext.tsx`**
- Remover toda lógica de toggle e light mode
- Forçar `dark` permanentemente no `<html>`
- Simplificar a interface (remover `toggleTheme`, `canToggle`, `applyThemeMode`)

**2. `src/contexts/BrandContext.tsx`**
- Gerar CSS apenas para `:root` usando `themeDark`
- Remover referência a `themeLight` no CSS gerado
- Remover o seletor `.dark` do CSS injetado

**3. `src/components/hub/ThemeEditorPanel.tsx`**
- Remover os botões Light/Dark no editor de cores (linhas 471-491)
- Remover o estado `editingMode` — editar sempre `themeDark`
- Remover botão Light no controle de modo (linhas 414-425)
- Remover seção "Controle de Modo" inteira (não há mais dual/single)
- Ajustar `resetAll` para resetar apenas `themeDark`

**4. `src/components/hub/Layout.tsx`**
- Remover import de `useTheme`, `toggleTheme`, `canToggle`
- Remover o botão de toggle de tema (linhas 83-94)
- Remover imports `Moon`, `Sun`

**5. `src/types.ts`**
- Remover `ThemeModeConfig` (ou simplificar)
- Manter `themeLight` em `SystemConfig` para compatibilidade de DB mas tornar opcional/deprecated

**6. `src/lib/themeDefaults.ts`**
- Manter `DEFAULT_DARK` como referência principal
- `DEFAULT_THEME_MODE` → forçar `{ mode: 'single', defaultTheme: 'dark' }`

**7. `src/lib/mockDb.ts`**
- Alterar preferências padrão de `'light'` para `'dark'`

**8. `src/contexts/AuthContext.tsx`**
- Alterar preferência padrão de `'light'` para `'dark'`

**9. `src/contexts/LanguageContext.tsx`**
- Remover strings de tradução referentes a Light theme

**10. `src/components/hub/SqlSetupModal.tsx`**
- Alterar preferência padrão no SQL de `'light'` para `'dark'`

**11. Teste de personalização de cores**
- Após remoção, as cores editadas no painel admin afetarão diretamente as variáveis CSS ativas em `:root`, garantindo aplicação imediata

### Detalhes Técnicos

A mudança principal no `BrandContext.tsx` será:
```typescript
// ANTES
const css = `
  :root { ${buildCssVars(config.themeLight)} ${buildEnvCssVars(...)} }
  .dark { ${buildCssVars(config.themeDark)} ${buildEnvCssVars(...)} }
`;

// DEPOIS
const css = `
  :root { ${buildCssVars(config.themeDark)} ${buildEnvCssVars(...)} }
`;
```

No `ThemeEditorPanel.tsx`, o editor passará a editar diretamente `themeDark` sem opção de alternar, simplificando significativamente a UI.

