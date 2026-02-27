

## Plano: Criar Manuais de Uso por Perfil

Criar 4 arquivos markdown na pasta `docs/` — um para cada perfil de usuário — com linguagem simples e extremamente detalhados.

### Arquivos a criar

| Arquivo | Perfil |
|---|---|
| `docs/manual-cliente.md` | Cliente (client), Distribuidor (distributor), Consultor (consultant) |
| `docs/manual-gestor.md` | Gestor (manager) |
| `docs/manual-admin.md` | Super Administrador (super_admin) |
| `docs/manual-cadastro.md` | Fluxo de cadastro, aprovação e login (todos os perfis) |

### Conteúdo de cada manual

**`docs/manual-cadastro.md`** — Acesso à Plataforma
- Como receber o link de convite
- Tela de cadastro: campos obrigatórios (nome, email, senha, WhatsApp, CRO)
- Perfil pré-definido pelo convite
- Tela de "Cadastro em Análise" (aguardando aprovação)
- Tela de "Cadastro Recusado" (motivo exibido)
- Tela de "Cadastro Aprovado" (confetti + botão login)
- Login com email e senha
- Ambiente de teste (login mock por perfil)

**`docs/manual-cliente.md`** — Dashboard do Cliente/Distribuidor/Consultor
- Barra lateral: card de nível/XP, toggle Materiais/Trilhas, filtros por tipo (PDF, Imagem, Vídeo, Áudio), filtro por tags, dica de atalho
- Visualização de materiais: busca, paginação, cards com tipo/idioma/XP
- Sistema de XP: 30% ao iniciar, 70% ao concluir
- Trilhas de aprendizagem: cards de coleção, progresso, timeline com materiais sequenciais
- Conclusão de trilha: bônus XP, animação de celebração
- Visualizador de materiais (modal)
- Atalhos de teclado (Ctrl+F, Escape, ?)
- Header: idioma (PT/EN/ES), tema claro/escuro, nível e XP, logout

**`docs/manual-gestor.md`** — Painel do Gestor
- 4 abas: Materiais, Usuários, Trilhas, Métricas
- Aba Materiais: tabela com busca, filtro por tipo, colunas (título, tipo, status, permissões, assets, XP) — somente leitura
- Aba Usuários: tabela com busca, filtro por perfil, colunas (usuário, contatos, perfil, permissões, status) — somente leitura
- Aba Trilhas/Coleções: cards de trilhas, timeline com materiais — somente leitura
- Aba Métricas: KPIs (total views, usuários únicos, top material, trilhas iniciadas/concluídas, taxa de conclusão), rankings (materiais, usuários), gráficos — somente leitura
- Sem botões de ação (criar, editar, excluir, exportar)

**`docs/manual-admin.md`** — Painel do Administrador
- 5 abas: Materiais, Usuários, Trilhas, Métricas, Configurações
- Aba Materiais: CRUD completo (criar, editar, ativar/desativar, excluir), busca, filtros por tipo e status, visualizar material, XP por material
- Aba Usuários: gestão completa (aprovar, rejeitar com motivo, editar perfil/permissões, excluir, exportar CSV)
- Aba Trilhas: CRUD de coleções, timeline expandível de conteúdos
- Aba Métricas: mesmas do gestor + filtros avançados (tipo, perfil) + exportar CSV
- Aba Configurações (5 sub-seções):
  - Identidade Visual: nome do app, logo (URL ou upload)
  - Integrações: webhook URL
  - Temas: editor de cores (38+ tokens light/dark), modo de tema, efeitos por ambiente (blobs, grain, glass)
  - Gamificação: CRUD de patentes (nome, XP mínimo, cor, ordenação)
  - Convites: gerar links por perfil com validade, copiar, excluir

### Padrão de escrita

- Títulos claros com hierarquia (H1 > H2 > H3)
- Linguagem simples, como se explicasse para alguém não-técnico
- Passo a passo numerado para cada ação
- Notas e dicas em blockquotes
- Emojis para identificação visual rápida de seções

