# Requirements — Hub Conexão

> Requisitos funcionais (RF) e não-funcionais (RNF) do produto. Atualizado em maio/2026.

---

## 1. Requisitos Funcionais

### 1.1 Autenticação e Cadastro
- **RF-01** Login com email + senha (Supabase Auth).
- **RF-02** Cadastro **somente via convite** — link `/auth?invite=<token>` com role embutido.
- **RF-03** Token de convite tem expiração padrão de 7 dias (`expires_at`), validação por trigger.
- **RF-04** Após signup, perfil entra em `status=pending` aguardando aprovação do admin.
- **RF-05** Admin pode aprovar (`active`), rejeitar (`rejected` + `rejection_reason`), inativar (`inactive`).
- **RF-06** Hard delete de usuário apenas via Edge Function `delete-user` (super_admin, sem auto-delete).
- **RF-07** Recuperação de senha via fluxo nativo Supabase (email de reset).
- **RF-08** PDF dos convites gerados (Nome, Celular formatado BR, Credencial, Status, Data de compartilhamento, Data de expiração).

### 1.2 Perfis e Papéis (Roles)
- **RF-10** 5 roles: `super_admin`, `manager`, `consultant`, `distributor`, `client`.
- **RF-11** Roles armazenadas exclusivamente em `user_roles` (jamais em `profiles`).
- **RF-12** Cada usuário pode ter apenas um role efetivo (`get_user_role` retorna LIMIT 1).
- **RF-13** Apenas role `client` possui campo CRO obrigatório.
- **RF-14** `manager` tem acesso read-only completo via convite (sem opção de auto-cadastro).

### 1.3 Materiais
- **RF-20** CRUD de materiais (super_admin).
- **RF-21** Tipos suportados: `pdf`, `image`, `video`, `audio`, `html` (página interativa).
- **RF-22** Cada material tem título por idioma (`jsonb`) e `allowed_roles[]`.
- **RF-23** Assets por idioma em `material_assets` (URL + subtitle opcional + status de tradução).
- **RF-24** XP padrão por tipo, customizável por material (`points`).
- **RF-25** Tags livres e categoria opcional.
- **RF-26** Material só é visível se `active=true` AND role do usuário ∈ `allowed_roles`.
- **RF-27** Tradução automática de título via IA (`translate-title` edge function, Gemini).
- **RF-28** Áudio do Google Drive renderizado em iframe mascarado (bypass CORS, oculta link externo).
- **RF-29** Material `html` renderizado em iframe sandboxed via `srcDoc`.

### 1.4 Trilhas (Collections)
- **RF-30** CRUD de trilhas com título/descrição multi-idioma, capa, `allowed_roles`, XP bônus.
- **RF-31** Items da trilha (`collection_items`) com `order_index` para reordenação.
- **RF-32** UI separada: seleção de materiais + reordenação numérica.
- **RF-33** Progresso isolado por trilha (`user_progress.collection_id` distingue contextos).
- **RF-34** Conclusão de trilha quando todos os items estão `completed` → XP bônus + tela de celebração.
- **RF-35** Geração de capa por IA (Navy/Gold) via `generate-trail-cover` (Gemini image).

### 1.5 Gamificação
- **RF-40** XP acumulado em `profiles.points`.
- **RF-41** Crédito de XP: 30% ao iniciar material, 70% ao concluir.
- **RF-42** Patentes (`gamification_levels`) configuráveis (nome, `min_points`, ordem, cor).
- **RF-43** Ranking dinâmico baseado em XP.

### 1.6 Internacionalização
- **RF-50** 3 idiomas: `pt-br`, `en-us`, `es-es`.
- **RF-51** `LanguageContext` custom (sem libs externas).
- **RF-52** Visualização de material respeita idioma do usuário (fallback para PT-BR).

### 1.7 Métricas (Admin / Gestor)
- **RF-60** Toda abertura de material registra log imutável em `access_logs`.
- **RF-61** Painel de métricas: views totais, ranking de materiais, ranking de usuários, histórico.
- **RF-62** Conclusões por material via `user_progress`.
- **RF-63** Desempenho por trilha via `collection_progress`.

### 1.8 Configuração e Tema
- **RF-70** `system_config` singleton (id=1): app_name, logo_url, webhook_url, paleta dark, themeMode, environment_themes.
- **RF-71** Theme Editor visual no painel admin (42 tokens CSS).
- **RF-72** Overrides por ambiente: `auth`, `client`, `manager`, `admin`, `global`.
- **RF-73** Gradientes customizáveis (gradientStart/Mid/End).
- **RF-74** Glassmorphism, grain, blobs como efeitos fundamentais (não opcionais).

### 1.9 Convites
- **RF-80** Geração de convite com role, dados do destinatário (nome, telefone, mensagem).
- **RF-81** Compartilhamento via WhatsApp (modal dedicado).
- **RF-82** Status do convite: `active`, `used`, `expired`.
- **RF-83** Exportação PDF dos convites gerados.

### 1.10 UX / Atalhos
- **RF-90** Atalhos: `Ctrl+F` (busca), `Esc` (fechar modal), `?` (ajuda de atalhos).
- **RF-91** Notificações exclusivamente via `sonner` toasts.
- **RF-92** Tabelas em mobile viram card-lists; modais viram bottom sheets.

---

## 2. Requisitos Não-Funcionais

### 2.1 Segurança
- **RNF-01** RLS ativo em **todas** as tabelas públicas (modo PERMISSIVE).
- **RNF-02** Roles validadas exclusivamente via função `has_role()` `SECURITY DEFINER` (anti-recursão RLS).
- **RNF-03** Service Role Key nunca exposta ao cliente — só em Edge Functions.
- **RNF-04** `access_logs` imutável (sem UPDATE/DELETE permitido por RLS).
- **RNF-05** Senhas não armazenadas em texto plano (gerenciado por Supabase Auth).
- **RNF-06** Validação server-side para deleção (super_admin only, sem auto-delete).
- **RNF-07** Token de convite com expiração obrigatória validada por trigger.
- **RNF-08** URLs internas (Supabase) ocultadas via view `system_config_public`.

### 2.2 Performance
- **RNF-10** Bundle inicial otimizado (Vite + tree-shaking + code-split por rota).
- **RNF-11** Imagens com lazy loading.
- **RNF-12** Paginação em tabelas (`usePagination`).
- **RNF-13** Limite default Supabase de 1000 linhas considerado em queries grandes.

### 2.3 Acessibilidade
- **RNF-20** Componentes shadcn/ui (acessíveis por padrão — Radix UI).
- **RNF-21** Contraste WCAG AA garantido nos tokens do theme dark.
- **RNF-22** Suporte completo a navegação por teclado.

### 2.4 Compatibilidade
- **RNF-30** Browsers modernos (últimas 2 versões de Chrome/Edge/Firefox/Safari).
- **RNF-31** Polyfill JS/MutationObserver para `color-mix()` em Safari antigo.
- **RNF-32** Responsivo (mobile, tablet, desktop).

### 2.5 Manutenibilidade
- **RNF-40** TypeScript strict.
- **RNF-41** ESLint configurado.
- **RNF-42** Componentes pequenos e focados.
- **RNF-43** Arquivos `src/integrations/supabase/client.ts` e `types.ts` auto-gerados (nunca editar).
- **RNF-44** Migrations versionadas via Lovable Cloud.

### 2.6 Observabilidade
- **RNF-50** Logs de Edge Functions disponíveis via Lovable Cloud.
- **RNF-51** Erros surfaceados ao usuário via `sonner` toasts.
- **RNF-52** Console limpo em produção (sem `console.log` residual).

### 2.7 Deploy e Operação
- **RNF-60** Deploy automático via Lovable (push = publish).
- **RNF-61** Custom domain opcional.
- **RNF-62** Backup gerenciado pelo Lovable Cloud.
- **RNF-63** Deploy alternativo em VPS documentado (`docs/deploy-vps.md`).

---

## 3. Restrições

- **R-01** Stack fixa: React 18 + Vite 5 + Tailwind v3 + TypeScript 5.
- **R-02** Backend: Lovable Cloud (Supabase gerenciado). Não trocar sem migração explícita.
- **R-03** Dark mode permanente — light mode não suportado.
- **R-04** Cadastro público desativado — apenas convite.
- **R-05** Manager não pode editar nada (read-only por design).
