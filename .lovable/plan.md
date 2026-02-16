

## Plano de Implementação — Importação do hubConexao para Lovable

### Resumo do Projeto
O **Hub Conexão** (MaterialShare Pro) é um sistema de compartilhamento de materiais (PDFs, imagens, vídeos) com controle de acesso por perfil (Cliente, Distribuidor, Consultor, Super Admin), suporte a 3 idiomas (PT-BR, EN-US, ES-ES), temas claro/escuro com branding customizável, e painel administrativo completo.

---

### Fase 1 — Tipos e Configuração Base
Criar os arquivos de tipo e configuração fundamentais:
- **`src/types.ts`** — Interfaces TypeScript (UserProfile, Material, Collection, AccessLog, ColorScheme, SystemConfig)
- **`src/lib/supabaseClient.ts`** — Cliente Supabase adaptado para o ambiente Lovable (sem .env, com placeholders)
- Instalar dependência **`@supabase/supabase-js`**

---

### Fase 2 — Contexts (Providers)
Migrar os 4 contextos que controlam o estado global da aplicação:
- **ThemeContext** — Alternância dark/light mode
- **LanguageContext** — Sistema de tradução i18n com 3 idiomas e ~130+ chaves de tradução
- **BrandContext** — Configuração de marca/cores dinâmicas via CSS variables
- **AuthContext** — Autenticação via Supabase com fallback para mock data

---

### Fase 3 — Camada de Dados (mockDb)
- **`src/lib/mockDb.ts`** — Abstração de dados que tenta Supabase e faz fallback para dados locais
- **`src/lib/seed.ts`** — Script de seed para criação de usuários demo (referência)

---

### Fase 4 — Componentes da Aplicação
Migrar todos os componentes visuais, adaptando imports para a estrutura `src/`:

**Componentes principais:**
- **Layout** — Header flutuante com glassmorphism, alternância de tema/idioma, logout
- **GlobalEffects** — Blobs animados de fundo e textura visual
- **MaterialCard** — Card de material com gradientes por tipo (PDF/imagem/vídeo)

**Modais:**
- **ViewerModal** — Visualizador de materiais (YouTube, Vimeo, Drive, PDFs, imagens)
- **MaterialFormModal** — Formulário de criação/edição de material com preview de vídeo
- **AssetManagerModal** — Gerenciador de versões multi-idioma dos arquivos
- **UserEditModal** — Edição de perfil de usuário com permissões de tipo
- **UserCommunicationModal** — Envio de mensagens via webhook (email/WhatsApp)
- **ConfirmModal** — Modal de confirmação de exclusão
- **SqlSetupModal** — Modal com script SQL para setup inicial do banco

---

### Fase 5 — Páginas
Migrar as 3 páginas principais:
- **AuthPage** — Tela de login/cadastro com landing page por perfil, login mock para demo, e detecção de banco ausente
- **Dashboard** — Lista de materiais filtráveis por tipo e busca, com visualização inline
- **Admin** — Painel administrativo completo com abas (Materiais, Usuários, Configurações, Métricas)

---

### Fase 6 — Integração no App.tsx
- Envolver a aplicação com os providers na ordem correta: Theme → Language → Brand → Auth
- Configurar navegação condicional (não autenticado → AuthPage, admin → Admin, demais → Dashboard)
- Migrar estilos e animações customizadas do `index.html` original para `tailwind.config.ts` e `src/index.css`
- Atualizar `index.html` com título e meta tags do projeto

---

### ⚠️ Pontos Importantes
- **Supabase**: O projeto funcionará em modo mock/demo até que uma conexão Supabase seja configurada
- **Sem refatoração**: Todo o código será migrado preservando a lógica original
- **React 18**: Compatível — não há uso de APIs exclusivas do React 19
- **Tailwind CDN → PostCSS**: As cores customizadas (page, surface, main, muted, accent, etc.) e animações (blob, fade-in, slide-up, shimmer, float) serão migradas para a configuração local

