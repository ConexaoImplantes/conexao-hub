

## Plano: Reordenação de materiais dentro das trilhas

### Problema
Atualmente, ao criar/editar uma trilha, os materiais são selecionados via checkboxes mas a ordem é determinada apenas pela sequência de cliques. Não há como o admin visualizar nem alterar a ordem depois de selecionar.

### Solução
Adicionar uma lista de **materiais selecionados ordenável** no `CollectionFormModal.tsx`, com botões de seta (↑ ↓) para mover cada item para cima ou para baixo.

### Alterações em `src/components/hub/CollectionFormModal.tsx`

1. **Separar a UI em duas partes:**
   - **Seleção** (já existente): lista de checkboxes com busca para adicionar/remover materiais
   - **Ordenação** (nova): lista dos materiais selecionados com botões ↑↓ para reordenar

2. **Botões de reordenação por item:**
   - Botão `ChevronUp` — move o material uma posição acima
   - Botão `ChevronDown` — move o material uma posição abaixo
   - Número da posição visível (1, 2, 3...)
   - Desabilitado quando já está no topo/fundo

3. **Funções auxiliares:**
   - `moveUp(index)` — troca `selectedMaterialIds[index]` com `[index-1]`
   - `moveDown(index)` — troca `selectedMaterialIds[index]` com `[index+1]`

4. **Visual:** A lista de ordenação aparece abaixo da lista de seleção, mostrando apenas os materiais selecionados com título, tipo, XP e controles de posição.

### Escopo
- Apenas `src/components/hub/CollectionFormModal.tsx` será alterado
- Sem dependências novas (sem lib de drag-and-drop)
- A ordem já é salva via `mockDb.setCollectionItems` que usa o index do array

