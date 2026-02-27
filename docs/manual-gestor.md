# 📊 Manual do Gestor

> Este manual detalha todas as funcionalidades do **Painel do Gestor** (perfil `manager`). O gestor tem acesso de **somente leitura** — pode visualizar dados de materiais, usuários, trilhas e métricas, mas **não pode criar, editar ou excluir** nenhum item.

---

## 📑 Índice

1. [Visão geral do painel](#1--visão-geral-do-painel)
2. [Aba Materiais](#2--aba-materiais)
3. [Aba Usuários](#3--aba-usuários)
4. [Aba Trilhas / Coleções](#4--aba-trilhas--coleções)
5. [Aba Métricas](#5--aba-métricas)

---

## 1. 🖥️ Visão geral do painel

Ao fazer login como Gestor, você acessa o **Painel do Gestor** com o título:

> **Painel do Gestor**
> _Visualize materiais, usuários, trilhas e métricas da plataforma._

No topo, há **4 abas** para navegar:
| Aba | Ícone | Descrição |
|---|---|---|
| **Materiais** | 🖼️ | Lista de todos os materiais da plataforma |
| **Usuários** | 👥 | Lista de todos os usuários cadastrados |
| **Trilhas** | 📖 | Coleções de materiais organizados |
| **Métricas** | 📊 | Indicadores de desempenho e rankings |

A aba ativa fica destacada com efeito **liquid-glass-gold**.

> ⚠️ **Importante:** Você **não** verá botões de "Criar", "Editar", "Excluir" ou "Exportar" em nenhuma aba. Essas ações são exclusivas do Administrador.

---

## 2. 📄 Aba Materiais

### Filtros disponíveis

No topo da aba, há uma barra com:

1. **Campo de busca** — Digite o nome do material para filtrar em tempo real.
2. **Filtro por tipo** — Dropdown com as opções:
   - Todos
   - PDF
   - Imagem
   - Vídeo
   - Áudio
   - Página Interativa

### Tabela de materiais

**No desktop**, os materiais são exibidos em uma tabela com as colunas:

| Coluna | Descrição |
|---|---|
| **Título** | Nome do material no idioma selecionado |
| **Tipo** | PDF, Imagem, Vídeo, Áudio ou Página Interativa |
| **Status** | Badge "Ativo" (verde) ou "Inativo" (cinza) |
| **Permissões** | Círculos com a inicial de cada perfil que tem acesso (C=Cliente, D=Distribuidor, etc.) |
| **Assets** | Badges com os idiomas disponíveis (PT, EN, ES) |
| **XP** | Pontos de experiência do material, com ícone de estrela ⭐ |

**No celular**, cada material é exibido como um **card** compacto com as mesmas informações.

> 💡 A tabela é **ordenada alfabeticamente** pelo título.

### Sem resultados

Se nenhum material for encontrado, aparece a mensagem: _"Nenhum material encontrado"_.

---

## 3. 👥 Aba Usuários

### Filtros disponíveis

1. **Campo de busca** — Busca por nome ou email do usuário.
2. **Filtro por perfil** — Dropdown com:
   - Todos
   - Cliente
   - Distribuidor
   - Consultor
   - Gestor

### Tabela de usuários

**No desktop:**

| Coluna | Descrição |
|---|---|
| **Usuário** | Nome + email + ícone de avatar |
| **WhatsApp** | Número de telefone (com link clicável) |
| **CRO** | Registro profissional (quando preenchido) |
| **Perfil** | Badge com o nome do perfil |
| **Permissões** | Tipos de material liberados (ex: PDF, Vídeo) ou "Todos" |
| **Status** | Badge colorido: Ativo (verde), Pendente (amarelo), Inativo (cinza), Recusado (vermelho) |
| **XP** | Pontos acumulados pelo usuário |

**No celular**, cada usuário é exibido como um card compacto.

> 💡 A lista é **ordenada alfabeticamente** pelo nome.

### Status dos usuários

| Status | Cor | Significado |
|---|---|---|
| **Ativo** | 🟢 Verde | Conta aprovada e em uso |
| **Pendente** | 🟡 Amarelo | Aguardando aprovação do admin |
| **Inativo** | ⚪ Cinza | Conta desativada |
| **Recusado** | 🔴 Vermelho | Cadastro recusado pelo admin |

---

## 4. 📖 Aba Trilhas / Coleções

### Lista de trilhas

As trilhas são exibidas como **cards** contendo:
- **Título** da trilha
- **Descrição** (quando disponível)
- **Imagem de capa** (quando disponível)
- **Quantidade de materiais** na trilha
- **XP bônus** da trilha
- **Perfis permitidos** (badges)
- **Status** — Ativa ou Inativa

### Detalhes da trilha

Ao clicar em uma trilha, você verá:

1. **Banner** com título, descrição e informações gerais.
2. **Timeline de materiais** — lista ordenada de todos os materiais da trilha, cada um mostrando:
   - Posição numérica (1, 2, 3...)
   - Título do material
   - Tipo (PDF, Vídeo, etc.)
   - XP do material
3. **Botão "← Voltar"** para retornar à lista.

> 💡 Na visão do gestor, a timeline é apenas informativa — não há botões de interação com os materiais.

---

## 5. 📈 Aba Métricas

A aba de métricas oferece uma visão completa do desempenho da plataforma, totalmente em **somente leitura**.

### KPIs (Indicadores principais)

No topo, cards grandes exibem:

| KPI | Descrição |
|---|---|
| **Total de Visualizações** | Soma de todas as visualizações de materiais |
| **Usuários Únicos** | Quantos usuários diferentes acessaram materiais |
| **Material Mais Acessado** | Nome do material com mais views |
| **Trilhas Iniciadas** | Quantas trilhas foram começadas |
| **Trilhas Concluídas** | Quantas trilhas foram finalizadas |
| **Taxa de Conclusão** | Percentual de trilhas concluídas vs iniciadas |

### Ranking de materiais

Tabela ordenada por número de visualizações:

| Coluna | Descrição |
|---|---|
| **#** | Posição no ranking |
| **Material** | Título + tipo |
| **Views** | Número total de visualizações |
| **Únicos** | Número de usuários únicos |
| **Último Acesso** | Data/hora do acesso mais recente |

Os 3 primeiros do ranking recebem destaque visual (🥇🥈🥉).

### Ranking de usuários mais ativos

| Coluna | Descrição |
|---|---|
| **#** | Posição |
| **Usuário** | Nome |
| **Perfil** | Badge do perfil |
| **Acessos** | Total de materiais visualizados |

### Gráficos

A aba inclui gráficos visuais gerados automaticamente:

1. **Gráfico de área** — evolução de visualizações ao longo do tempo.
2. **Gráfico de pizza** — distribuição de views por tipo de material.
3. **Gráfico de barras** — comparativo entre materiais.

> 💡 Os gráficos se adaptam ao tamanho da tela e são interativos (passe o mouse para ver detalhes).

---

> 📌 **Resumo rápido para o Gestor:**
> - Você tem **acesso completo de leitura** a materiais, usuários, trilhas e métricas
> - Você **não pode** criar, editar, excluir ou exportar dados
> - Use os filtros de busca e tipo para encontrar informações rapidamente
> - A aba Métricas é a mais rica, com KPIs, rankings e gráficos
