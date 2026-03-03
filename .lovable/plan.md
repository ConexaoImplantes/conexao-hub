

## Problema

A tabela `user_progress` tem constraint `UNIQUE(user_id, material_id)` — o progresso é global. Se o usuário vê um material na aba "Materiais", ele é marcado como concluído e isso reflete nas trilhas também.

## Solução

Adicionar `collection_id` (nullable) à tabela `user_progress` para separar o contexto:
- `collection_id = NULL` → visualização avulsa (aba Materiais)
- `collection_id = UUID` → visualização dentro de uma trilha específica

### 1. Migração SQL

- Adicionar coluna `collection_id UUID NULL` em `user_progress`
- Dropar constraint `user_progress_user_id_material_id_key`
- Criar nova constraint `UNIQUE(user_id, material_id, collection_id)` com `NULLS NOT DISTINCT` (para que NULL = NULL na unicidade)
- Atualizar policies de RLS que já existem (sem mudança necessária, pois filtram por `user_id`)

### 2. Atualizar `src/types.ts` — `UserProgress`

Adicionar campo opcional `collectionId?: string`

### 3. Atualizar `src/lib/mockDb.ts`

- `upsertProgress`: aceitar parâmetro opcional `collectionId`, incluir no payload e no `onConflict`
- `getUserProgress`: mapear `collection_id` do resultado

### 4. Atualizar `src/pages/Dashboard.tsx`

- **`handleViewMaterial`**: passar `selectedCollection?.id` quando `activeView === 'collection-detail'`
- **`handleCloseViewer`**: idem — passar `collectionId` ao `upsertProgress`
- **Cálculo de progresso da trilha** (linhas ~317 e ~173): filtrar `userProgress` por `collectionId === selectedCollection.id` em vez de só `materialId`
- **`CollectionCard`** (progresso nas cards da lista): mesma lógica — filtrar por `collectionId`
- Guardar no estado `viewingMaterial` o `collectionId` atual para usar no `handleCloseViewer`

### 5. Atualizar `src/components/hub/CollectionCard.tsx`

Verificar se o cálculo de progresso filtra por `collectionId`.

### Resumo do fluxo

```text
Aba Materiais → abre material → upsertProgress(userId, matId, status, null)
Aba Trilhas → abre material dentro da trilha X → upsertProgress(userId, matId, status, X.id)
Cálculo progresso trilha X → filtra userProgress WHERE collectionId = X.id
```

Arquivos alterados:
- Migration SQL (nova)
- `src/types.ts`
- `src/lib/mockDb.ts`
- `src/pages/Dashboard.tsx`
- `src/components/hub/CollectionCard.tsx`

