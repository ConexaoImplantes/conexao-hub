# 📚 Manual do Cliente / Distribuidor / Consultor

> Este manual detalha todas as funcionalidades do **Dashboard** disponível para os perfis **Cliente**, **Distribuidor** e **Consultor**. A interface é idêntica para os três perfis — a diferença está nos materiais e trilhas liberados pelo administrador.

---

## 📑 Índice

1. [Visão geral do Dashboard](#1--visão-geral-do-dashboard)
2. [Header (barra superior)](#2--header-barra-superior)
3. [Barra lateral (sidebar)](#3--barra-lateral-sidebar)
4. [Visualização de materiais](#4--visualização-de-materiais)
5. [Sistema de XP e gamificação](#5--sistema-de-xp-e-gamificação)
6. [Trilhas de aprendizagem](#6--trilhas-de-aprendizagem)
7. [Visualizador de materiais (modal)](#7--visualizador-de-materiais-modal)
8. [Atalhos de teclado](#8--atalhos-de-teclado)

---

## 1. 🖥️ Visão geral do Dashboard

Ao fazer login, você verá o Dashboard principal dividido em duas áreas:

- **Barra lateral (esquerda):** Card de nível/XP, alternância entre Materiais e Trilhas, filtros por tipo e tags.
- **Área principal (direita):** Cards de materiais ou trilhas de aprendizagem, barra de busca, paginação.

O layout é **responsivo** — no celular, a barra lateral fica no topo da tela como uma barra horizontal com scroll.

---

## 2. 🔝 Header (barra superior)

O header está presente em todas as páginas e contém:

### Idioma
- Botão para alternar entre **Português (PT)**, **Inglês (EN)** e **Espanhol (ES)**.
- A interface inteira muda de idioma, incluindo títulos de materiais (quando disponíveis no idioma selecionado).

### Nível e XP
- Exibe seu nível atual e total de pontos XP.
- Exemplo: _"Nível 3 — 450 XP"_

### Logout
- Botão para **sair da plataforma**.
- Ao clicar, você volta para a tela de login.

---

## 3. 📊 Barra lateral (sidebar)

### Card de nível e XP

No topo da sidebar, um card mostra:
- ⭐ **Seu nível atual** — ex: "Nível 2"
- **Seus pontos XP** — ex: "150 XP"
- **Barra de progresso** — mostra quanto falta para o próximo nível
- **Próximo nível** — ex: "Próximo: 300 XP"

### Toggle Materiais / Trilhas

Dois botões para alternar a visualização:
- **📦 Materiais** — exibe todos os materiais disponíveis em grade
- **📖 Trilhas** — exibe as trilhas de aprendizagem

### Filtros por tipo (apenas na visão Materiais)

Uma lista vertical com os tipos de material:
| Ícone | Tipo | Descrição |
|---|---|---|
| 📦 | **Todos** | Mostra todos os materiais |
| 📄 | **PDF** | Documentos e apostilas |
| 🖼️ | **Imagem** | Fotos e infográficos |
| 🎬 | **Vídeo** | Vídeo-aulas e tutoriais |
| 🎧 | **Áudio** | Podcasts e gravações |
| 🌐 | **Página Interativa** | Landing pages, infográficos interativos e conteúdo HTML |

Cada tipo mostra um **contador** (ex: "PDF 12") indicando quantos materiais estão disponíveis.

O tipo ativo fica destacado com o efeito **liquid-glass-gold** (fundo dourado translúcido).

### Filtro por tags

Abaixo dos tipos, aparecem as **tags** disponíveis como botões pequenos:
- Clique em uma tag para filtrar os materiais que possuem essa tag.
- Clique novamente na mesma tag para **remover** o filtro.
- Múltiplas tags **não** podem ser selecionadas simultaneamente.

### Dica Pro

Na parte inferior da sidebar, há um card com dica:
> 💡 **Dica Pro:** Use `Ctrl+F` para focar na busca rapidamente. Pressione `?` para ver todos os atalhos.

---

## 4. 📄 Visualização de materiais

### Barra de busca

No topo da área principal, há uma barra de busca:
1. Digite o nome do material desejado.
2. Os resultados são filtrados **em tempo real** enquanto você digita.
3. A busca filtra pelo título do material no idioma selecionado.

> 💡 Use o atalho `Ctrl+F` para focar diretamente na barra de busca.

### Cards de materiais

Cada material é exibido como um **card** contendo:
- **Título** do material (no idioma selecionado)
- **Tipo** — ícone + texto (PDF, Imagem, Vídeo, Áudio, Página Interativa)
- **Idiomas disponíveis** — badges com as siglas (PT, EN, ES)
- **XP** — quantidade de pontos que o material vale
- **Status de progresso** — se você já iniciou ou concluiu

**Status possíveis:**
| Status | Visual |
|---|---|
| Não iniciado | Sem indicação especial |
| Iniciado | Badge "Em andamento" com ícone ▶️ |
| Concluído | Badge "Concluído" com ícone ✅ |

### Paginação

Quando há muitos materiais (mais de 12), a lista é dividida em páginas:
- Botões de **página** (1, 2, 3...) na parte inferior.
- Setas **◀ ▶** para navegar entre páginas.
- A página atual fica destacada com efeito dourado.

### Botão "Limpar filtros"

Se nenhum material for encontrado com os filtros ativos, aparece:
- Mensagem _"Nenhum resultado encontrado"_
- Botão **"Limpar filtros"** para remover todos os filtros de uma vez.

---

## 5. ⭐ Sistema de XP e gamificação

### Como funciona

Cada material possui uma quantidade de **XP (pontos de experiência)** definida pelo administrador.

**Distribuição do XP:**
| Ação | XP ganho |
|---|---|
| **Iniciar** um material (primeira visualização) | **30%** do total |
| **Concluir** um material (fechar o visualizador) | **70%** restante |

**Exemplo:** Se um material vale 100 XP:
- Ao abrir pela primeira vez: +30 XP
- Ao fechar o visualizador: +70 XP
- Total: 100 XP

> ⚠️ Visualizações subsequentes **não** geram XP adicional — o XP é concedido apenas uma vez por material.

### Níveis

Conforme você acumula XP, você sobe de nível. Os níveis são configurados pelo administrador (chamados de **"patentes"**) e podem ter:
- **Nome** — ex: "Bronze", "Prata", "Ouro"
- **Cor** — identificação visual
- **XP mínimo** — quantidade necessária para atingir esse nível

O card na sidebar mostra uma barra de progresso indicando quanto falta para o próximo nível.

---

## 6. 🛤️ Trilhas de aprendizagem

### O que são trilhas?

Trilhas são **coleções de materiais organizados em sequência**. Elas permitem seguir um caminho de aprendizagem estruturado, com início, meio e fim.

### Visualização de trilhas

Na aba **Trilhas** (toggle na sidebar), você verá:
- **Cards de coleção** — cada trilha é um card com:
  - Título da trilha
  - Descrição (quando disponível)
  - Imagem de capa (quando disponível)
  - Barra de progresso (ex: "3 de 8 concluídos — 37%")
  - XP bônus ao concluir toda a trilha

### Entrando em uma trilha

1. Clique no card da trilha desejada.
2. A visão muda para o **detalhe da trilha**, mostrando:
   - **Banner** com título, descrição e progresso geral
   - **Timeline vertical** com todos os materiais da trilha, em ordem

### Timeline de materiais

Cada material na timeline mostra:
- **Número** da posição (1, 2, 3...)
- **Título** do material
- **Tipo** (PDF, Vídeo, etc.)
- **XP** do material
- **Status:** Não iniciado, Em andamento ▶️ ou Concluído ✅
- **Botão de ação:**
  - "Iniciar" — se não começou
  - "Continuar" — se já iniciou
  - "Revisar" — se já concluiu

### Botão "Voltar para Trilhas"

No topo do detalhe da trilha, há um botão **"← Voltar para Trilhas"** para retornar à lista de trilhas.

### Conclusão de trilha

Quando você conclui **todos** os materiais de uma trilha:

1. 🎉 Uma **animação de celebração** aparece em tela cheia (confetti + fogos).
2. O **XP bônus** da trilha é adicionado automaticamente.
3. A mensagem exibe: _"Trilha [nome] concluída!"_ e o XP bônus ganho.
4. O card da trilha mostra um badge **"Trilha concluída!"** em verde.

> 💡 **Dica:** O XP bônus da trilha é um prêmio extra, além do XP individual de cada material.

---

## 7. 🔍 Visualizador de materiais (modal)

Ao clicar em um material (seja na grade ou na timeline da trilha), o **Visualizador Modal** abre:

### O que ele exibe
- **PDFs:** Visualizador embutido no navegador
- **Imagens:** Exibição em tela cheia com zoom
- **Vídeos:** Player de vídeo integrado (com legenda quando disponível)
- **Áudios:** Player de áudio
- **Páginas Interativas:** Página HTML exibida em iframe seguro (sandbox)

### Controles
- **Botão fechar (X)** — no canto superior direito
- **Tecla Escape** — fecha o modal

### Comportamento de XP
- **Ao abrir:** Se for a primeira vez, 30% do XP é registrado.
- **Ao fechar:** Os 70% restantes são registrados, e o material é marcado como "Concluído".

> ⚠️ Se você fechar o modal antes de "completar" a visualização, o material ficará com status "Em andamento" até a próxima abertura+fechamento.

---

## 8. ⌨️ Atalhos de teclado

A plataforma suporta atalhos para agilizar a navegação:

| Atalho | Ação |
|---|---|
| `Ctrl + F` | Focar na barra de busca |
| `Escape` | Fechar modal aberto / limpar busca e filtros |
| `?` | Abrir o painel de ajuda com todos os atalhos |

> 💡 Os atalhos **não funcionam** quando o cursor está dentro de um campo de texto (input, textarea, select). Isso evita conflitos com a digitação normal.

### Painel de ajuda

Ao pressionar `?`, um modal aparece listando todos os atalhos disponíveis na página atual, com:
- A combinação de teclas
- A descrição da ação

---

> 📌 **Resumo rápido:**
> - Use a **sidebar** para filtrar materiais por tipo e tags
> - Alterne entre **Materiais** e **Trilhas** no toggle
> - Ganhe **XP** ao abrir e concluir materiais
> - Complete **trilhas** para ganhar XP bônus + celebração
> - Use **Ctrl+F** para buscar e **?** para ver atalhos
