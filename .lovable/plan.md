
## Objetivo

Eliminar **toda** noção de "tema light" / "modo light" / "alternância de tema" da plataforma. O app passa a operar exclusivamente em dark mode, com o design system mostrado na imagem (navy `#0f172a` + dourado `#c9a655` + favicon globo "C" atual) como único padrão — sem coluna legada, sem campo `themeMode`, sem `preferences.theme`.

## Mudanças no banco (migration)

Tabela `public.system_config`:
- Remover a coluna `theme_light`.
- Remover a coluna `theme_mode`.
- Ajustar a coluna `preferences` em `public.profiles`: alterar o default para `'{"language":"pt-br"}'::jsonb` e fazer um `UPDATE` em todas as linhas existentes removendo a chave `theme` do JSON (`preferences = preferences - 'theme'`).
- Atualizar a função `public.handle_new_user()` para inserir `preferences` sem a chave `theme`.

Views:
- Recriar `public.system_config_public` removendo `theme_light` e `theme_mode` do `SELECT` (mantém `security_invoker = true`).

## Mudanças no frontend

`src/types.ts`
- Remover a interface `ThemeModeConfig`.
- Remover o campo `themeMode` de `SystemConfig`.
- Remover/limpar `preferences.theme` em `UserProfile` (manter só `language`).

`src/lib/themeDefaults.ts`
- Remover `DEFAULT_THEME_MODE` e o import correspondente.

`src/contexts/BrandContext.tsx`
- Remover qualquer referência a `themeMode` / `DEFAULT_THEME_MODE` no objeto `defaults` e no carregamento.

`src/contexts/ThemeContext.tsx`
- Remover o arquivo (não há mais alternância). Remover `ThemeProvider` de `src/App.tsx` e qualquer `useTheme` que ainda exista.

`src/lib/mockDb.ts`
- Remover leitura/escrita de `theme_mode` e `theme_light` em `getSystemConfig` / `updateSystemConfig`.
- Tirar `theme: 'dark'` dos mocks e do fallback de `preferences`.

`src/lib/seed.ts` e `src/contexts/AuthContext.tsx` (`ensureProfile`)
- Tirar `theme: 'dark'` do payload de `preferences`.

`src/components/hub/SqlSetupModal.tsx`
- Remover `theme_light` do schema de setup e tirar `"theme": "dark"` do default de `preferences`.

`src/components/hub/ThemeEditorPanel.tsx` (se houver toggle/seletor de modo)
- Remover qualquer UI de "alternar tema" ou "tema padrão". Manter só edição da paleta dark e dos environment themes.

`src/pages/Admin.tsx` (aba de configurações)
- Remover qualquer controle relacionado a modo/tema light.

Documentação (`docs/database-schema.md`, `docs/requirements.md`, `docs/tasks.md`, `docs/design.md`, `docs/SPEC.md`, `docs/design-system-dark.md`, `docs/branding-guide.md`)
- Remover menções a `theme_light`, `theme_mode`, "modo dual", "tema padrão dark", deixando explícito que **só existe dark**.

## Verificação após a build

1. Rodar `rg "theme_light|theme_mode|themeMode|ThemeModeConfig|preferences.*theme|'light'|\"light\""` em `src/` e `supabase/` — deve retornar zero ocorrências (exceto comentários históricos em migrations antigas, que ficam intocadas).
2. Abrir o preview, confirmar tela de login navy/dourado idêntica ao print.
3. Abrir Admin → Configurações e confirmar que não há mais qualquer seletor de modo.

## Itens a confirmar com você antes da implementação

1. **Logo / favicon**: o print mostra o favicon globo azul atual (`/favicon.ico`). Você quer que eu **mantenha** esse mesmo arquivo como logo + favicon padrão (não precisa subir nada novo) — confirma?
2. **Migration destrutiva**: dropar `theme_light` e `theme_mode` apaga dados que existem hoje nessas colunas. Os valores atuais são apenas paletas/legado e não impactam o app. OK prosseguir?
3. **Reset de `preferences.theme` em perfis existentes**: vou rodar `UPDATE profiles SET preferences = preferences - 'theme'`. OK?
