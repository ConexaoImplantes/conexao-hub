# ⚙️ Manual do Administrador (Super Admin)

> Este manual detalha **todas** as funcionalidades do painel de **Super Administrador** (`super_admin`). O administrador tem acesso total à plataforma — pode criar, editar, excluir, aprovar, exportar e configurar todos os aspectos do sistema.

---

## 📑 Índice

1. [Visão geral do painel](#1--visão-geral-do-painel)
2. [Aba Materiais](#2--aba-materiais)
3. [Aba Usuários](#3--aba-usuários)
4. [Aba Trilhas (Coleções)](#4--aba-trilhas-coleções)
5. [Aba Métricas](#5--aba-métricas)
6. [Aba Configurações](#6--aba-configurações)
   - [Identidade Visual](#61--identidade-visual)
   - [Integrações](#62--integrações)
   - [Temas](#63--temas)
   - [Gamificação](#64--gamificação)
   - [Convites](#65--convites)

---

## 1. 🖥️ Visão geral do painel

O painel do administrador possui **5 abas**:

| Aba | Ícone | Descrição |
|---|---|---|
| **Materiais** | 🖼️ | CRUD completo de materiais |
| **Usuários** | 👥 | Gestão completa de usuários |
| **Trilhas** | 📖 | CRUD de coleções/trilhas |
| **Métricas** | 📊 | Indicadores + exportação |
| **Configurações** | ⚙️ | Identidade, temas, gamificação, convites |

---

## 2. 📄 Aba Materiais

### Filtros e ações

A barra de ferramentas no topo contém:

1. **Campo de busca** — busca pelo título do material.
2. **Filtro por tipo** — Todos, PDF, Imagem, Vídeo, Áudio, Página Interativa.
3. **Filtro por status** — Todos, Ativo, Inativo.
4. **Botão "+ Adicionar Material"** — abre o formulário de criação.

### Tabela de materiais

Colunas (desktop):

| Coluna | Descrição |
|---|---|
| **Título** | Nome do material |
| **Tipo** | PDF, Imagem, Vídeo, Áudio ou Página Interativa |
| **Status** | Ativo (verde) ou Inativo (cinza) |
| **Permissões** | Perfis com acesso (C, D, G, A...) |
| **Assets** | Idiomas disponíveis (PT, EN, ES) |
| **XP** | Pontos de experiência ⭐ |
| **Ações** | Botões de ação (ver abaixo) |

### Ações por material

| Botão | Ícone | Ação |
|---|---|---|
| **Visualizar** | 👁️ | Abre o visualizador modal do material |
| **Ativar/Desativar** | 👁️/👁️‍🗨️ | Alterna o status ativo/inativo |
| **Editar** | ✏️ | Abre o formulário de edição |
| **Excluir** | 🗑️ | Abre confirmação de exclusão |

### Criar um material

1. Clique em **"+ Adicionar Material"**.
2. O modal de criação abre com os campos:
   - **Título** (em PT, EN, ES) — pelo menos PT é obrigatório
   - **Tipo** — PDF, Imagem, Vídeo, Áudio ou Página Interativa (HTML)
   - **XP** — pontos de experiência
   - **Tags** — palavras-chave para filtro
   - **Perfis permitidos** — quais perfis podem ver o material
   - **Assets** — URL do arquivo para cada idioma (PT, EN, ES)
   - **URL de legenda** (para vídeos)
   - **Status da tradução** — Rascunho, Revisão ou Publicado
3. Clique em **"Salvar"** para criar.

### Editar um material

1. Clique no ícone de **lápis** ✏️ na linha do material.
2. O mesmo modal abre, pré-preenchido com os dados atuais.
3. Faça as alterações desejadas.
4. Clique em **"Salvar"** para atualizar.

### Excluir um material

1. Clique no ícone de **lixeira** 🗑️.
2. Um modal de confirmação aparece: _"Tem certeza que deseja excluir?"_
3. Confirme para excluir permanentemente.

> ⚠️ A exclusão é **irreversível**. O material e todos os seus assets serão removidos.

---

## 3. 👥 Aba Usuários

### Filtros

1. **Campo de busca** — por nome ou email.
2. **Filtro por perfil** — Todos, Cliente, Distribuidor, Consultor, Gestor.
3. **Filtro por status** — Todos, Ativo, Pendente, Inativo, Recusado.

### Tabela de usuários

| Coluna | Descrição |
|---|---|
| **Usuário** | Nome + email |
| **WhatsApp** | Número (clicável) |
| **CRO** | Registro profissional |
| **Perfil** | Badge colorido |
| **Permissões** | Tipos de material liberados |
| **Status** | Badge: Ativo, Pendente, Inativo, Recusado |
| **XP** | Pontos acumulados |
| **Ações** | Botões de gestão |

### Ações por usuário

| Ação | Quando disponível | Descrição |
|---|---|---|
| ✅ **Aprovar** | Status = Pendente | Ativa a conta do usuário |
| ❌ **Rejeitar** | Status = Pendente | Abre modal para informar o motivo da recusa |
| 🚫 **Desativar** | Status = Ativo | Muda o status para Inativo |
| ✅ **Reativar** | Status = Inativo/Recusado | Reativa a conta |
| 💬 **Comunicar** | Sempre | Abre modal para enviar mensagem ao usuário |
| ✏️ **Editar** | Sempre | Abre modal para editar perfil e permissões |
| 🗑️ **Excluir** | Sempre | Remove o usuário permanentemente |

### Aprovar um usuário pendente

1. Na coluna de ações, clique no ícone **✅ (check verde)**.
2. O status muda instantaneamente para **Ativo**.
3. O usuário receberá a notificação em tempo real (se estiver na tela de progresso).

### Rejeitar um usuário pendente

1. Clique no ícone **❌ (X vermelho)**.
2. Um modal abre pedindo o **motivo da recusa** (obrigatório).
3. Digite o motivo (ex: _"Dados incompletos"_, _"Perfil não autorizado"_).
4. Clique em **"Confirmar Rejeição"**.

> ⚠️ O motivo da recusa será exibido para o usuário na tela de progresso do cadastro.

### Editar um usuário

1. Clique no ícone **✏️ (lápis)**.
2. O modal de edição permite alterar:
   - **Nome**
   - **Email**
   - **WhatsApp**
   - **CRO**
   - **Perfil** (Cliente, Distribuidor, Consultor, Gestor)
   - **Permissões de tipo** — quais tipos de material o usuário pode ver (PDF, Imagem, Vídeo, Áudio)
3. Clique em **"Salvar"** para aplicar.

### Exportar CSV de usuários

- Na barra de ferramentas, clique no botão **"Exportar CSV"** (ícone de download).
- Um arquivo `.csv` será baixado com todos os dados dos usuários filtrados.

---

## 4. 📖 Aba Trilhas (Coleções)

### Visão geral

As trilhas (coleções) agrupam materiais em uma sequência de aprendizagem.

### Filtros e ações

1. **Campo de busca** — busca pelo nome da trilha.
2. **Botão "+ Nova Coleção"** — abre o formulário de criação.

### Cards de trilhas

Cada trilha é exibida como um card com:
- Título
- Descrição
- Imagem de capa
- Quantidade de materiais
- XP bônus
- Perfis permitidos
- Status (Ativa/Inativa)
- Botões: **Editar** ✏️ e **Excluir** 🗑️

### Criar uma trilha

1. Clique em **"+ Nova Coleção"**.
2. Preencha:
   - **Título** (PT, EN, ES)
   - **Descrição** (PT, EN, ES)
   - **Imagem de capa** (URL)
   - **XP bônus** — pontos extras ao concluir toda a trilha
   - **Perfis permitidos** — quais perfis podem ver a trilha
   - **Materiais** — selecione e ordene os materiais da trilha
3. Clique em **"Salvar"**.

### Timeline expandível

Ao clicar em uma trilha, a **timeline de conteúdos** se expande mostrando:
- Lista ordenada dos materiais
- Posição, título, tipo e XP de cada material
- Botão para contrair novamente

### Editar uma trilha

1. Clique em **✏️** no card da trilha.
2. O modal abre pré-preenchido.
3. Altere os campos desejados.
4. Clique em **"Salvar"**.

### Excluir uma trilha

1. Clique em **🗑️** no card.
2. Confirme no modal de confirmação.

---

## 5. 📈 Aba Métricas

O administrador tem acesso às mesmas métricas do Gestor, **mais filtros avançados e exportação**.

### KPIs (Indicadores principais)

| KPI | Descrição |
|---|---|
| **Total de Visualizações** | Soma de todos os acessos |
| **Usuários Únicos** | Quantos usuários diferentes acessaram |
| **Material Mais Acessado** | Nome do material mais popular |
| **Trilhas Iniciadas** | Quantidade de trilhas com pelo menos 1 material aberto |
| **Trilhas Concluídas** | Quantidade de trilhas 100% finalizadas |
| **Taxa de Conclusão** | Concluídas / Iniciadas × 100% |

### Filtros avançados (exclusivos do admin)

Além da busca, o admin tem:

1. **Filtro por tipo de material** — filtra métricas apenas de PDFs, Vídeos, etc.
2. **Filtro por perfil de usuário** — filtra acessos apenas de Clientes, Distribuidores, etc.

Esses filtros afetam **todos** os dados da aba: KPIs, rankings e gráficos.

### Ranking de materiais

Tabela com:
| Coluna | Descrição |
|---|---|
| **#** | Posição |
| **Material** | Título + ícone de tipo |
| **Views** | Total de visualizações |
| **Únicos** | Usuários únicos |
| **Último acesso** | Data/hora mais recente |

Clique em uma linha do ranking para abrir o **modal de detalhes**, mostrando o **histórico completo de acesso** daquele material (usuário, perfil, idioma, data/hora).

### Ranking de usuários

| Coluna | Descrição |
|---|---|
| **#** | Posição |
| **Usuário** | Nome |
| **Perfil** | Badge |
| **Acessos** | Total de materiais acessados |

### Gráficos

1. **Gráfico de área** — evolução temporal de visualizações
2. **Gráfico de pizza** — distribuição por tipo de material
3. **Gráfico de barras** — comparativo entre materiais

### Exportação

Dois formatos disponíveis:

1. **📥 Exportar CSV**
   - Clique no botão de download.
   - Gera um arquivo `.csv` com:
     - Seção "Métricas de Materiais": Material, Tipo, Visualizações, Usuários Únicos, Último Acesso.
     - Seção "Ranking de Usuários": Posição, Usuário, Perfil, Acessos.

2. **📄 Exportar PDF**
   - Clique no botão de PDF.
   - Gera um documento PDF em formato paisagem (A4) com screenshot da aba inteira.

---

## 6. ⚙️ Aba Configurações

A aba de Configurações possui **5 sub-seções**, acessíveis por uma barra lateral (no desktop) ou barra horizontal (no celular):

| Sub-seção | Ícone | Descrição |
|---|---|---|
| **Identidade Visual** | 🖼️ | Nome e logo do app |
| **Integrações** | 🔗 | Webhook URL |
| **Temas** | 🎨 | Editor de cores e efeitos visuais |
| **Gamificação** | 🏆 | Patentes/níveis de XP |
| **Convites** | 🔗 | Geração de links de convite |

Cada sub-seção é detalhada abaixo.

---

### 6.1. 🖼️ Identidade Visual

Configure a aparência global da plataforma:

1. **Nome do Aplicativo**
   - Campo de texto para definir o nome exibido na plataforma.
   - Aparece no header, na tela de login e em todo o sistema.
   - Valor padrão: _"Conexão Hub"_

2. **Logo**
   - **URL da logo** — cole a URL de uma imagem (PNG, SVG, etc.)
   - **Upload de arquivo** — clique no botão de upload para enviar uma imagem do seu computador
   - Se nenhuma logo for definida, o sistema exibe as iniciais do nome do app em um quadrado colorido com gradiente.

**Para salvar:**
- Após alterar os campos, clique no botão **"💾 Salvar Configurações"** no final da página.

---

### 6.2. 🔗 Integrações

Configure integrações externas:

1. **Webhook URL**
   - Campo para inserir a URL de um webhook.
   - A plataforma pode enviar notificações para sistemas externos através desta URL.
   - Deixe em branco se não utilizar.

**Para salvar:**
- Clique em **"💾 Salvar Configurações"**.

---

### 6.3. 🎨 Temas

O editor de temas é a seção mais completa das configurações. Ele permite personalizar **todas as cores e efeitos visuais** da plataforma.

> ℹ️ A plataforma opera em **dark mode permanente**. Não há mais seletor de modo claro/escuro/sistema — todas as edições afetam apenas o tema escuro.

#### Editor de cores (42 tokens)

O editor exibe **todas as variáveis de cor** do sistema, organizadas em categorias:

| Categoria | Exemplos de tokens |
|---|---|
| **Base** | Fundo (bg), Superfície (surface) |
| **Tipografia** | Texto principal (textMain), Texto secundário (textMuted) |
| **Bordas** | Borda (border) |
| **Marca** | Cor de destaque (accent), Hover (accentHover) |
| **Gradientes** | Início, Meio e Fim do gradiente |
| **Feedback** | Sucesso (success), Erro (error), Alerta (warning), Info (info) + backgrounds |
| **Componentes** | Sidebar (sidebarBg), Header (headerBg) |
| **Efeitos** | Foco (focusRing), Seleção (selection), Overlay |

**Como editar uma cor:**
1. Localize o token desejado na lista.
2. Clique no **seletor de cor** (quadrado colorido) ao lado do nome.
3. Escolha a nova cor usando o color picker.
4. O preview atualiza em tempo real.

#### Efeitos por ambiente

Abaixo das cores, o editor permite configurar **efeitos visuais por ambiente**:

| Ambiente | Descrição |
|---|---|
| **Global** | Efeitos padrão para toda a plataforma |
| **Auth (Login)** | Efeitos na tela de login/cadastro |
| **Client** | Efeitos no dashboard do cliente |
| **Manager** | Efeitos no painel do gestor |
| **Admin** | Efeitos no painel do administrador |

**Tokens de efeito por ambiente (13 tokens cada):**

| Token | Descrição |
|---|---|
| `pageBg` | Cor de fundo da página |
| `blob1Color`, `blob2Color`, `blob3Color` | Cores dos blobs animados de fundo |
| `blobOpacity` | Opacidade dos blobs (0 a 1) |
| `blobSize` | Tamanho dos blobs em pixels |
| `blobBlur` | Desfoque dos blobs em pixels |
| `grainOpacity` | Opacidade da textura de grão |
| `grainBlendMode` | Modo de mesclagem do grão (overlay, multiply, etc.) |
| `grainContrast` | Contraste da textura de grão |
| `glassOpacity` | Opacidade do efeito glass |
| `glassBlur` | Desfoque do efeito glass em pixels |
| `glassBorderOpacity` | Opacidade da borda do efeito glass |

**Para salvar:**
- Clique em **"💾 Salvar Configurações"** para persistir todas as alterações.
- Um toast de confirmação aparecerá: _"Configurações salvas e aplicadas!"_

---

### 6.4. 🏆 Gamificação

Gerencie os **níveis de gamificação** (patentes) do sistema de XP.

#### Lista de patentes

Cada patente é exibida com:
- **Nome** — ex: "Bronze", "Prata", "Ouro"
- **XP Mínimo** — quantidade mínima de pontos para atingir esse nível
- **Cor** — cor de identificação visual
- **Ordem** — posição na hierarquia

#### Criar uma patente

1. Na parte inferior da seção, preencha:
   - **Nome da patente** — ex: "Diamante"
   - **XP Mínimo** — ex: 5000
   - **Cor** — selecione usando o color picker (padrão: dourado `#c9a655`)
2. Clique em **"Adicionar"** (botão +).
3. A patente aparece na lista.

#### Editar uma patente

1. Clique no ícone **✏️** ao lado da patente.
2. Altere nome, XP ou cor.
3. Salve a alteração.

#### Excluir uma patente

1. Clique no ícone **🗑️** ao lado da patente.
2. Confirme a exclusão.

#### Ordenação

As patentes são ordenadas automaticamente pelo campo `order_index`. A ordem determina a hierarquia dos níveis.

> 💡 **Dica:** Mantenha os valores de XP crescentes e sem sobreposição. Exemplo: Bronze (0), Prata (100), Ouro (300), Platina (600), Diamante (1000).

---

### 6.5. 🔗 Convites

Gerencie os **links de convite** para novos usuários.

#### Gerar um novo convite

1. **Selecione o perfil** — dropdown com: Cliente, Distribuidor, Consultor, Gestor, Administrador.
2. **Defina a validade** — número de dias até o link expirar (padrão: 7 dias).
3. Clique em **"Gerar Convite"**.
4. O novo link aparece na lista abaixo.

#### Lista de convites

Cada convite mostra:
| Campo | Descrição |
|---|---|
| **Perfil** | Para qual perfil o convite foi gerado |
| **Token** | Código único do convite (truncado) |
| **Status** | Ativo, Usado ou Expirado |
| **Expira em** | Data e hora de expiração |
| **Usado por** | Nome do usuário que usou (se aplicável) |

#### Copiar link

- Clique no ícone **📋 (copiar)** ao lado do convite.
- O link completo é copiado para a área de transferência.
- Formato: `https://conexao-hub.lovable.app/?token=XXXX`

#### Excluir um convite

- Clique no ícone **🗑️** ao lado do convite.
- O convite é removido permanentemente.

> ⚠️ **Atenção:** Convites já usados não podem ser reutilizados, mesmo que não tenham sido excluídos.

---

> 📌 **Resumo rápido para o Administrador:**
> - **Materiais:** CRUD completo (criar, editar, ativar/desativar, excluir)
> - **Usuários:** Aprovar, rejeitar (com motivo), editar, excluir, exportar CSV
> - **Trilhas:** Criar, editar, excluir coleções com timeline de materiais
> - **Métricas:** KPIs, rankings, gráficos + filtros avançados + exportar CSV/PDF
> - **Configurações:** Identidade visual, integrações, temas (38+ cores), gamificação, convites
