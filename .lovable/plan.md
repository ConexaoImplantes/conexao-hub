

## Análise do Estado Atual

Hoje existe **1 ColorScheme** (light/dark) com 38 tokens aplicados globalmente. Porém:

- **GlobalEffects.tsx**: 3 blobs com cores hardcoded (`bg-amber-500`, `bg-yellow-500`, `bg-amber-400`) e grain com opacidade fixa (`opacity-20`)
- **AuthPage.tsx**: Usa `var(--color-accent)` para blobs mas tem opacidades fixas
- **Dashboard.tsx**: Usa variáveis de tema mas sem controle de efeitos de fundo
- **ManagerDashboard.tsx**: Idem
- **Admin.tsx**: Idem
- **Layout.tsx** (header): Usa variáveis mas sem granularidade por ambiente

Cada ambiente aplica cores em contextos diferentes (headers, cards, efeitos, backgrounds).

## Plano de Implementação

### 1. Expandir o tipo `ColorScheme` e criar `EnvironmentTheme`

Adicionar em `src/types.ts` um novo tipo `EnvironmentEffects` com tokens granulares para cada ambiente:

```typescript
export interface EnvironmentEffects {
  // Background
  pageBg: string;           // Fundo da página do ambiente
  // Blob effects
  blob1Color: string;       // Cor do blob 1
  blob2Color: string;       // Cor do blob 2
  blob3Color: string;       // Cor do blob 3
  blobOpacity: string;      // Opacidade dos blobs (ex: "0.20")
  blobSize: string;         // Tamanho dos blobs em rem (ex: "18")
  blobBlur: string;         // Blur dos blobs em px (ex: "64")
  // Grain / Noise
  grainOpacity: string;     // Opacidade do grain (ex: "0.20")
  grainBlendMode: string;   // Blend mode (ex: "multiply")
  grainContrast: string;    // Contrast (ex: "150")
  // Glassmorphism overrides
  glassOpacity: string;     // Opacidade do efeito glass
  glassBlur: string;        // Blur do glass em px
  glassBorderOpacity: string; // Opacidade da borda glass
}

export type EnvironmentKey = 'auth' | 'client' | 'manager' | 'admin' | 'global';

export type EnvironmentThemes = Record<EnvironmentKey, EnvironmentEffects>;
```

### 2. Criar defaults para cada ambiente

Em `src/lib/themeDefaults.ts`, adicionar `DEFAULT_ENVIRONMENT_EFFECTS` com valores padrão para cada ambiente (`auth`, `client`, `manager`, `admin`, `global`).

### 3. Expandir `SystemConfig` e banco de dados

- Adicionar campo `environment_themes` (jsonb) na tabela `system_config` via migration
- Adicionar `environmentThemes: EnvironmentThemes` ao tipo `SystemConfig`

### 4. Atualizar `BrandContext.tsx`

- Injetar CSS variables por ambiente: `--env-blob1-color`, `--env-blob-opacity`, `--env-grain-opacity`, etc.
- Expor o ambiente ativo para componentes consumirem

### 5. Refatorar `GlobalEffects.tsx`

- Receber o `environmentKey` ativo como prop ou via context
- Substituir todas as cores hardcoded por CSS variables do ambiente:
  - `bg-amber-500` → `style={{ backgroundColor: 'var(--env-blob1-color)' }}`
  - `opacity-20` → `style={{ opacity: 'var(--env-blob-opacity)' }}`
  - Grain opacity, contrast, blend mode → variáveis

### 6. Criar aba "Ambientes" no ThemeEditorPanel

Nova seção no editor de temas com **5 sub-abas** (Global, Login, Cliente, Gestor, Admin). Cada sub-aba expõe:

- **Background**: Cor de fundo da página
- **Blobs**: 3 color pickers (blob 1, 2, 3) + sliders para opacidade, tamanho, blur
- **Grain**: Slider de opacidade, selector de blend mode, slider de contraste
- **Glass**: Sliders para opacidade, blur, borda

Layout em grid de 2 colunas seguindo o padrão atual do ThemeEditorPanel.

### 7. Aplicar contexto de ambiente nos pages

- `AuthPage.tsx`, `Dashboard.tsx`, `ManagerDashboard.tsx`, `Admin.tsx` — cada um define qual `environmentKey` está ativo (via context ou prop no GlobalEffects)
- O GlobalEffects renderiza os efeitos com as variáveis CSS do ambiente ativo

---

### Resumo de arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/types.ts` | Adicionar `EnvironmentEffects`, `EnvironmentKey`, `EnvironmentThemes` |
| `src/lib/themeDefaults.ts` | Adicionar defaults por ambiente |
| `supabase/migrations/` | Migration para campo `environment_themes` |
| `src/contexts/BrandContext.tsx` | Injetar CSS vars por ambiente |
| `src/components/hub/GlobalEffects.tsx` | Refatorar para usar variáveis de ambiente |
| `src/components/hub/ThemeEditorPanel.tsx` | Nova aba "Ambientes" com controles granulares |
| `src/pages/AuthPage.tsx` | Definir environmentKey = 'auth' |
| `src/pages/Dashboard.tsx` | Definir environmentKey = 'client' |
| `src/pages/ManagerDashboard.tsx` | Definir environmentKey = 'manager' |
| `src/pages/Admin.tsx` | Definir environmentKey = 'admin' |
| `src/App.tsx` | Passar environmentKey ao GlobalEffects |

