

## Plano Completo

Entendi todas as mudanças solicitadas. Aqui está o resumo do que farei:

1. **Corrigir exclusão de usuários** -- o `deleteUser` atual só remove da tabela `profiles`, deixando o registro em `auth.users` e `user_roles` intactos. O usuário pode fazer login de novo e o trigger recria o perfil.
2. **Adicionar botão para deletar tokens de convite usados** -- atualmente o botão de excluir só aparece em tokens **não usados** (`!isUsed`). Tokens usados/expirados ficam acumulando sem opção de limpeza.
3. **Adicionar personalização de gradientes** no painel de temas -- os gradientes da plataforma (logo, botões, texto shimmer, liquid-glass-gold, hero banners) estão hardcoded com `#c9a655`/`#e8d48b`/`#a8873a`. Precisam ser configuráveis via ThemeEditorPanel.

---

### Tarefa 1: Edge Function `delete-user` + atualizar `mockDb.deleteUser`

**Criar:** `supabase/functions/delete-user/index.ts`
- CORS headers
- Valida JWT do chamador via `supabase.auth.getUser()`
- Verifica role `super_admin` via `has_role()`
- Deleta `user_roles` onde `user_id = userId`
- Deleta `profiles` onde `id = userId`
- Usa `supabaseAdmin.auth.admin.deleteUser(userId)` com service role key
- `verify_jwt = false` no config.toml, validação manual no código

**Atualizar:** `src/lib/mockDb.ts` (linha 182-185)
- Substituir delete direto por `supabase.functions.invoke('delete-user', { body: { userId } })`

### Tarefa 2: Permitir exclusão de tokens usados/expirados

**Atualizar:** `src/pages/Admin.tsx` (linha ~1791)
- Remover a condição `{!isUsed && (...)}` que esconde o botão de excluir em tokens usados
- Mostrar o botão `Trash2` para **todos** os tokens (usados, expirados e ativos)

### Tarefa 3: Personalização de gradientes no tema

**Adicionar ao `ColorScheme`** (em `src/types.ts`):
- `gradientStart` -- cor inicial do gradiente dourado (default: `#c9a655`)
- `gradientMid` -- cor intermediária (default: `#e8d48b`)
- `gradientEnd` -- cor final (default: `#a8873a`)

**Atualizar `src/lib/themeDefaults.ts`:**
- Adicionar os 3 novos tokens nos defaults light e dark

**Atualizar `src/contexts/BrandContext.tsx`:**
- Gerar CSS vars `--color-gradient-start`, `--color-gradient-mid`, `--color-gradient-end`

**Atualizar `src/components/hub/ThemeEditorPanel.tsx`:**
- Nova categoria "Gradientes" com os 3 tokens
- Preview do gradiente resultante em tempo real

**Atualizar CSS e componentes** para usar as variáveis:
- `src/index.css`: `.liquid-glass-gold` usar as vars
- `src/pages/AuthPage.tsx`: logo, botão submit, texto shimmer
- `src/pages/Dashboard.tsx`: hero banners

**Migration SQL:** adicionar os novos campos no `theme_light` e `theme_dark` defaults da tabela `system_config`

