

## Plano: Armazenar arquivos HTML no Storage

### Contexto
Atualmente, materiais do tipo "Página Interativa" usam apenas URLs externas. O objetivo é permitir o **upload de arquivos .html** diretamente na plataforma, armazenando-os no file storage do Lovable Cloud.

### 1. Criar bucket de storage `materials`
Migration SQL para criar um bucket dedicado com políticas de acesso:
- Bucket público para leitura (os arquivos são servidos via URL pública no iframe)
- Upload restrito a `super_admin`
- Aceitar apenas arquivos `.html` e `.htm` (com limite de tamanho)

### 2. Atualizar `AssetManagerModal.tsx`
- Quando `material.type === 'html'`, substituir o campo de texto URL por um **input de upload de arquivo** (`<input type="file" accept=".html,.htm">`)
- Fazer upload via `supabase.storage.from('materials').upload(...)` 
- Gerar a URL pública automaticamente e salvar no campo `url` do asset
- Manter opção de URL externa como alternativa (toggle entre "Upload" e "URL externa")

### 3. Atualizar `MaterialFormModal.tsx`
- Na seção de URL do tipo `html`, adicionar o mesmo componente de upload como opção primária
- Placeholder e labels atualizados para refletir upload de arquivo

### 4. `ViewerModal.tsx` — sem alterações
O iframe já renderiza qualquer URL, seja externa ou do storage.

### Arquivos afetados
- 1 migration SQL (bucket + RLS policies)
- `src/components/hub/AssetManagerModal.tsx` — upload de arquivo para tipo html
- `src/components/hub/MaterialFormModal.tsx` — upload na criação do material

### Segurança
- Arquivos servidos com `sandbox` no iframe (já implementado)
- Upload restrito a admins via RLS no bucket
- Validação client-side do tipo de arquivo (`.html`, `.htm`)

