

# Plano: Concluir material ao fechar o viewer e computar XP

## Problema Atual
Quando o usuario abre um material da trilha, ele e marcado como "started" e recebe 30% do XP. Porem, ao fechar o viewer (ViewerModal), nada acontece -- o material nunca e marcado como "completed" e os 70% restantes do XP nunca sao concedidos.

## Solucao

Alterar o fluxo de fechamento do `ViewerModal` no `Dashboard.tsx` para:

1. **Ao fechar o viewer**: marcar o material como `completed` via `mockDb.upsertProgress`
2. **Conceder XP restante**: os 70% restantes do XP do material (so se ainda nao estava completed)
3. **Verificar conclusao da trilha**: se o usuario esta dentro de uma trilha e todos os materiais ficaram completos, conceder o bonus XP da trilha
4. **Atualizar estado local**: refletir imediatamente o progresso na UI sem precisar recarregar

## Detalhes Tecnicos

### Arquivo: `src/pages/Dashboard.tsx`

- Criar funcao `handleCloseViewer` que:
  - Verifica se o material ja estava `completed` no `userProgress`
  - Se nao estava, chama `mockDb.upsertProgress(userId, materialId, 'completed')`
  - Concede os pontos restantes (70% do XP do material) via `mockDb.addPoints`
  - Atualiza `userProgress` no estado local para refletir `completed`
  - Se `activeView === 'collection-detail'` e `selectedCollection` existe, verifica se todos os materiais da trilha agora estao completos; se sim, concede o XP bonus da trilha
  - Fecha o modal (`setViewingMaterial(null)`)

- Substituir o `onClose={() => setViewingMaterial(null)}` do `ViewerModal` por `onClose={handleCloseViewer}`

### Nenhuma alteracao no ViewerModal
O `ViewerModal` ja chama `onClose` ao fechar. Toda a logica fica no Dashboard.

### Fluxo de XP
- Abrir material: 30% do XP (ja implementado)
- Fechar material: 70% do XP restante (novo)
- Completar todos os materiais de uma trilha: bonus XP da trilha (novo)

