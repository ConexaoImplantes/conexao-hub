

## Diagnóstico

O código atual tem um problema estrutural grave: a **Seção 5 (Ordenação)** foi inserida **dentro** da Seção 4 (Seleção), quebrando o JSX. Olhando as linhas 304-349:

```text
Linha 304: checkbox div do item de seleção
Linha 306: </div>  ← fecha o checkbox, mas NÃO o botão do item
Linha 308: === SEÇÃO 5 INTEIRA INJETADA AQUI ===  ← ERRADO
Linha 348: fim da seção 5
Linha 349: <span>título</span>  ← continuação do item de seleção (???)
```

O resultado é uma UI quebrada e confusa onde seleção e ordenação se misturam.

## Plano de correção

Reescrever o `CollectionFormModal.tsx` com duas seções **completamente separadas e bem fechadas**:

1. **Seção 4 - "Selecionar Materiais"**: Lista com checkboxes + busca. Cada item é um botão completo com checkbox, título, tipo e XP. Sem setas. Apenas adicionar/remover.

2. **Divisor visual** (border-t) entre as seções.

3. **Seção 5 - "Ordem dos Materiais"**: Aparece apenas quando `selectedMaterialIds.length > 0`. Lista numerada (1, 2, 3...) dos materiais selecionados com botões ChevronUp/ChevronDown. Mostra título, tipo, XP e controles de posição.

### Mudanças concretas em `CollectionFormModal.tsx`:

- **Fechar corretamente** o bloco da Seção 4 (a lista de seleção com todos os seus `</button>`, `</div>`) antes de iniciar a Seção 5
- Adicionar um **divisor** (`border-t`) entre seleção e ordenação
- A Seção 5 aparece quando há **1+** material selecionado (não 2+), para o admin sempre ver a ordem definida
- Manter toda a lógica existente (`moveUp`, `moveDown`, `toggleMaterial`) sem alteração

### Resultado visual esperado:

```text
┌─────────────────────────────────────┐
│  ... campos de título, descrição    │
│─────────────────────────────────────│
│  SELECIONAR MATERIAIS    3 sel.     │
│  🔍 Buscar...                       │
│  ☑ Material A    PDF   150 XP       │
│  ☐ Material B    VID   100 XP       │
│  ☑ Material C    IMG    50 XP       │
│  ☑ Material D    HTML  100 XP       │
│─────────────────────────────────────│
│  ORDEM DOS MATERIAIS                │
│  ① Material A  PDF  150  ↑ ↓       │
│  ② Material C  IMG   50  ↑ ↓       │
│  ③ Material D  HTML 100  ↑ ↓       │
└─────────────────────────────────────┘
```

Arquivo alterado: `src/components/hub/CollectionFormModal.tsx` (linhas 275-365 reescritas).

