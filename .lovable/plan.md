

## Adicionar tipo de material "Áudio" à plataforma

### Contexto
Áudio segue o mesmo padrão dos demais materiais: o admin cadastra uma **URL externa** (Google Drive, link direto MP3/WAV/OGG, etc.) e a plataforma reproduz via player embutido. **Não há upload de arquivos.**

### Alterações necessárias

**1. Migração SQL**
- Adicionar `'audio'` ao enum `material_type` existente no banco

**2. `src/types.ts`**
- Adicionar `'audio'` ao tipo `MaterialType`: `'image' | 'pdf' | 'video' | 'audio'`

**3. `src/contexts/LanguageContext.tsx`**
- Adicionar traduções nos 3 idiomas:
  - `filter.audio`, `material.type.audio`, placeholder de URL para áudio

**4. `src/components/hub/MaterialFormModal.tsx`**
- Adicionar opção de tipo `audio` com ícone `Headphones`
- Placeholder de URL: ex. "Link do áudio (MP3, Google Drive, etc.)"

**5. `src/components/hub/MaterialCard.tsx`**
- Adicionar caso `'audio'` em `getIcon()`, `getLabel()`, `getGradient()`, `getBorderColor()`

**6. `src/components/hub/ViewerModal.tsx`**
- Adicionar bloco para `material.type === 'audio'`:
  - Player `<audio controls>` estilizado com ícone grande centralizado e título
  - Suporte a Google Drive (extrair ID e montar URL de streaming) e links diretos

**7. `src/pages/Dashboard.tsx`**
- Adicionar categoria de filtro para áudio com ícone `Headphones`
- Incluir `audio` na contagem de materiais

**8. `src/pages/Admin.tsx`**
- Adicionar `audio` nos filtros de tipo de material na gestão de conteúdo

### O que NÃO muda
- Nenhum bucket de storage novo
- Nenhuma lógica de upload — o fluxo é idêntico aos outros tipos: **admin cola a URL, plataforma reproduz**

