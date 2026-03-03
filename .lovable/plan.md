

## Diagnóstico

A imagem do usuário mostra a interface com fundo branco e elementos claros. O problema é que existem **dezenas de classes Tailwind com prefixo `dark:`** e bases claras (`bg-gray-50`, `bg-white`) espalhadas por vários componentes. Embora a classe `.dark` esteja no `<html>`, algo no ambiente do usuário (cache, extensão de navegador, ou race condition) pode estar impedindo a aplicação correta.

A solução definitiva é **eliminar todas as referências a light mode do código**: remover prefixos `dark:`, substituir bases claras por equivalentes escuros, e garantir que não haja nenhuma dependência do seletor `.dark`.

## Plano

### 1. Limpar `src/index.css`
- Remover todos os seletores `.dark .icon-box`, `.dark .icon-box-sm`, `.dark .icon-box-lg`, `.dark .liquid-glass-gold` — mesclar os estilos diretamente no seletor principal (sem condicional)

### 2. Limpar componentes com `dark:` e `bg-gray-50` / `bg-white`
Arquivos afetados (10 arquivos, ~180 ocorrências):
- `src/pages/AuthPage.tsx` — `dark:bg-white/5` → `bg-white/5`, `dark:border-white/10` → `border-white/10`, `dark:text-red-400` → `text-red-400`, `dark:hover:bg-white/10` → `hover:bg-white/10`
- `src/pages/Admin.tsx` — `bg-gray-50 dark:bg-black/20` → `bg-black/20`
- `src/pages/Dashboard.tsx` — `bg-white/10`, `bg-white/20` (já ok, são transparências sobre escuro)
- `src/components/hub/UserCommunicationModal.tsx` — `bg-gray-50 dark:bg-black/20` → `bg-black/20`
- `src/components/hub/SqlSetupModal.tsx` — `hover:bg-gray-100 dark:hover:bg-gray-800` → `hover:bg-gray-800`
- `src/components/hub/ThemeEditorPanel.tsx` — `hover:bg-black/5 dark:hover:bg-white/5` → `hover:bg-white/5`
- `src/components/hub/CollectionFormModal.tsx` — `bg-white` em toggle thumb (aceitável, é branco sobre fundo colorido)
- `src/components/hub/MaterialFormModal.tsx` — idem toggle thumb
- `src/components/hub/MaterialCard.tsx` — `bg-white/20` (já ok, é glow effect)
- `src/components/hub/ViewerModal.tsx` — `bg-white` em iframes de PDF/HTML (aceitável, conteúdo externo)

### 3. Limpar `src/components/ui/chart.tsx`
- Remover referência a `light` no objeto `THEMES`

### Resumo
- Remover **todos** os prefixos `dark:` substituindo pelo estilo dark direto
- Remover **todas** as bases claras (`bg-gray-50`, `bg-gray-100`) substituindo por equivalentes escuros
- Manter `bg-white` apenas onde faz sentido visual (thumb de toggle, iframes de conteúdo externo, badges sobre vídeo)
- Consolidar `.dark .X` no CSS em `.X` direto

**Arquivos editados:**
- `src/index.css`
- `src/pages/AuthPage.tsx`
- `src/pages/Admin.tsx`
- `src/components/hub/UserCommunicationModal.tsx`
- `src/components/hub/SqlSetupModal.tsx`
- `src/components/hub/ThemeEditorPanel.tsx`
- `src/components/ui/chart.tsx`

