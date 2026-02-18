
# Análise do Repositório e Plano de Implementação de Features

## O que foi identificado no repositório

Após análise completa do repositório `hubConexao`, foram identificadas **6 grandes features** presentes lá que ainda não existem neste projeto:

---

## Features a Implementar

### 1. Trilhas de Aprendizagem (Collections)
O repositório possui um sistema completo de agrupamento de materiais em "trilhas":
- Página `Collections.tsx` com listagem de trilhas
- Página `CollectionDetail.tsx` com detalhe de cada trilha e progresso
- Componente `CollectionCard.tsx` com capa, descrição multilíngue e barra de progresso
- `CollectionFormModal.tsx` para criação/edição pelo admin
- Aba `CollectionsTab.tsx` no painel admin
- **Banco de dados**: requer 2 novas tabelas (`collections` e `collection_items`)

### 2. Sistema de Gamificação (XP e Rankings)
- Campo `points` nos materiais e coleções
- Campo `points` e `rank` no perfil do usuário
- Ranking de usuários mais engajados
- Barras de progresso visuais
- Níveis: Iniciante, Bronze, Prata, Ouro, Master
- **Banco de dados**: requer coluna `points` no perfil e nos materiais

### 3. Progresso do Usuário por Material
- Rastreamento de materiais `started` / `completed` por usuário
- **Banco de dados**: nova tabela `user_progress`
- Exibição de progresso no card do material

### 4. Sistema de Tags e Categorias nos Materiais
- Campo `tags: string[]` e `category?: string` nos materiais
- Componente `TagInput.tsx` para entrada de tags
- Filtro por tags/categoria no Dashboard

### 5. Sistema de Atalhos de Teclado Globais
- `ShortcutContext.tsx` com registro/desregistro de atalhos
- `KeyboardHelpModal.tsx` com modal de ajuda (`?` ou `Shift+?`)
- Hook `useKeyboardShortcuts.ts`
- Atalhos úteis: `Ctrl+F` busca, `Escape` fecha modal, `N` novo material, etc.

### 6. Paginação na Lista de Materiais (Admin e Dashboard)
- Hook `usePagination.ts` pronto no repositório
- Controles de página: anterior, próxima, salto direto
- Reset automático ao filtrar

### 7. Melhorias no Analytics (Gráficos com Recharts)
- Gráfico de área temporal de acessos (`AreaChart`)
- Gráfico de pizza por tipo de material (`PieChart`)
- Gráfico de barras por perfil (`BarChart`)
- Skeleton loader para tabela de analytics (`SkeletonTable`)

### 8. SkeletonCards de Loading
- Componente `SkeletonCard.tsx` para exibir durante carregamento
- `SkeletonTable.tsx` para a aba de analytics

---

## Banco de Dados Necessário

Serão criadas as seguintes tabelas via migração:

```text
collections
├── id (uuid, PK)
├── title (jsonb, multilíngue)
├── description (jsonb, multilíngue)
├── cover_image (text, nullable)
├── allowed_roles (app_role[], default: {client})
├── active (boolean, default: true)
├── points (integer, default: 0)
└── created_at / updated_at

collection_items
├── id (uuid, PK)
├── collection_id (uuid, FK -> collections)
├── material_id (uuid, FK -> materials)
└── order_index (integer)

user_progress
├── id (uuid, PK)
├── user_id (uuid)
├── material_id (uuid, FK -> materials)
├── status (enum: started | completed)
└── completed_at (timestamptz)
```

Além de colunas adicionadas:
- `points integer DEFAULT 0` na tabela `materials`
- `points integer DEFAULT 0` na tabela `profiles`
- `tags text[] DEFAULT '{}'` na tabela `materials`
- `category text` na tabela `materials`

---

## Plano de Execução (em fases)

### Fase 1 - Banco de dados e Tipos
- Migração SQL com as novas tabelas e colunas
- Atualizar `src/types.ts` com os novos campos
- Políticas RLS para `collections`, `collection_items` e `user_progress`

### Fase 2 - Infrastructure (Contextos e Hooks)
- Criar `src/contexts/ShortcutContext.tsx`
- Criar `src/hooks/usePagination.ts`
- Atualizar `src/App.tsx` para incluir o `ShortcutProvider`

### Fase 3 - Componentes Base
- Criar `src/components/hub/SkeletonCard.tsx`
- Criar `src/components/hub/SkeletonTable.tsx`
- Criar `src/components/hub/TagInput.tsx`
- Criar `src/components/hub/KeyboardHelpModal.tsx`
- Criar `src/components/hub/CollectionCard.tsx`
- Criar `src/components/hub/CollectionFormModal.tsx`

### Fase 4 - Dashboard do Usuário
- Atualizar `src/pages/Dashboard.tsx` com paginação, tags, skeleton e progresso
- Criar `src/pages/Collections.tsx` (trilhas para o usuário)
- Criar `src/pages/CollectionDetail.tsx`

### Fase 5 - Painel Admin
- Adicionar aba "Coleções" no Admin
- Atualizar aba Analytics com gráficos (Recharts já instalado)
- Atualizar formulário de material para incluir tags/pontos

### Fase 6 - Gamificação
- Acumular XP ao visualizar materiais e completar trilhas
- Exibir ranking de usuários no Analytics
- Exibir pontos e nível no perfil do usuário no Layout

---

## Impacto e Compatibilidade

- Nenhuma feature existente será removida — apenas estendida
- O mockDb continuará funcionando para demonstração
- O Supabase (Lovable Cloud) terá as tabelas reais
- Todas as novas tabelas terão RLS configurado corretamente
- A gamificação é progressiva: usuários existentes começam com 0 pontos
