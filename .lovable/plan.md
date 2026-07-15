## Objetivo
Permitir download de materiais no ViewerModal, controlado por uma flag por material (`downloadable`) que o Super Admin ativa/desativa no modal de criar/editar material. Ao mesmo tempo, remover o campo de tags do formulário para dar lugar a esse novo controle.

## Mudanças

### 1. Banco de dados (migration)
- Adicionar coluna `downloadable BOOLEAN NOT NULL DEFAULT false` na tabela `materials`.
- Nenhuma mudança de RLS/GRANT (a tabela já possui).

### 2. Tipos (`src/types.ts`)
- Adicionar `downloadable: boolean` em `Material`.

### 3. Modal de material (`src/components/hub/MaterialFormModal.tsx`)
- **Remover** o campo/seção de **Tags** (inclui import de `TagInput`, estado e persistência de `tags`).
  - Nota: `tags` continua existindo no banco; apenas não editaremos mais pela UI. Ao salvar, preservar `tags` já existentes (não sobrescrever com array vazio em edição).
- **Adicionar** toggle "Permitir download deste material" no lugar antes ocupado pelas tags.
  - Visível tanto na criação quanto na edição.
  - Só é editável pelo `super_admin`; para outros roles fica desabilitado e apenas exibe o estado atual.
- Persistir `downloadable` no insert/update (snake_case no banco ↔ camelCase no tipo).

### 4. Leitura de materiais
- Onde `materials` são lidos (Admin, Dashboard, Collections, etc.), incluir `downloadable` no mapeamento para `Material` (default `false` se ausente).

### 5. ViewerModal (`src/components/hub/ViewerModal.tsx`)
- Se `material.downloadable === true`, exibir botão "Baixar" (ícone `Download` do lucide) no cabeçalho, à esquerda do X, com o mesmo estilo (`bg-white/10 ...`).
- Comportamento por tipo:
  - **image**: usar `resolvedUrl` → tentar `fetch` como blob e disparar `a.download`; em falha (CORS), abrir em nova aba.
  - **pdf**: se Google Drive, usar `https://drive.google.com/uc?export=download&id=<id>`; se direto, download direto.
  - **video/audio**: mesma lógica do PDF (Drive usa `uc?export=download`; direto baixa direto). YouTube: botão oculto mesmo com flag ligada (sem download legítimo).
  - **html**: salvar `htmlContent` já carregado como `.html`; se ainda não carregou, baixar via fetch do `asset.url`.
- Nome do arquivo derivado do `displayTitle` + extensão apropriada.

## Detalhes técnicos
- Migration só faz `ALTER TABLE public.materials ADD COLUMN downloadable BOOLEAN NOT NULL DEFAULT false;` — sem GRANT novo (tabela existente).
- Após aprovação da migration, `src/integrations/supabase/types.ts` é regenerado e as edições de código que dependem da nova coluna entram em seguida.
- Preservação de `tags` na edição: ao montar o payload de update, reutilizar o valor de `tags` já carregado do material original, evitando perda de dados.

## Fora do escopo (para depois)
- Adicionar permissão de "materiais" para gestor.
- Registrar downloads em `audit_logs`.
- Marca d'água em arquivos baixados.
- Botão de download fora do ViewerModal (ex.: no card).
