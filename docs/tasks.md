# Tasks — Hub Conexão

> Backlog de tarefas: implementadas (✅), em andamento (🔄), planejadas (⏳). Atualizado em maio/2026.

---

## 1. Concluído ✅

### 1.1 Infraestrutura
- ✅ Setup React 18 + Vite 5 + TypeScript + Tailwind v3
- ✅ Integração Lovable Cloud (Supabase gerenciado)
- ✅ Configuração de RLS PERMISSIVE em todas as tabelas
- ✅ Função `has_role()` SECURITY DEFINER
- ✅ Trigger `handle_new_user` (criação automática de profile + role)
- ✅ Edge Function `delete-user` (hard delete sincronizado)
- ✅ Buckets de storage (`branding`, `materials`, `trail-covers`)
- ✅ Deploy automático Lovable + custom domain opcional
- ✅ Configuração SPA rewrites (`vercel.json`)

### 1.2 Autenticação
- ✅ Login email + senha (Supabase Auth)
- ✅ Cadastro exclusivo por convite com role embutido
- ✅ Validação de token (anon SELECT)
- ✅ Trigger de expiração de convite
- ✅ Aprovação/rejeição manual pelo admin
- ✅ Hard delete via Edge Function (sem auto-delete)
- ✅ Modal `InviteShareModal` (compartilhamento WhatsApp)
- ✅ Exportação PDF dos convites gerados

### 1.3 Materiais
- ✅ CRUD completo (super_admin)
- ✅ 5 tipos: PDF, image, video, audio, HTML interativo
- ✅ Assets por idioma (`material_assets`)
- ✅ Tradução IA de títulos (`translate-title` edge function)
- ✅ Tags, categoria, allowed_roles
- ✅ XP default por tipo + customizável
- ✅ Áudio Google Drive em iframe mascarado
- ✅ Material HTML em iframe sandboxed
- ✅ `ViewerModal` único para todos os tipos
- ✅ Log de acesso automático em todas as aberturas

### 1.4 Trilhas (Collections)
- ✅ CRUD de trilhas multi-idioma
- ✅ Sistema de items com `order_index`
- ✅ UI de seleção + reordenação numérica
- ✅ Progresso isolado por trilha (`user_progress.collection_id`)
- ✅ Detecção de conclusão automática
- ✅ XP bônus de trilha
- ✅ Tela de celebração (`TrailCompletionCelebration`)
- ✅ Geração de capa IA Navy/Gold (`generate-trail-cover`)

### 1.5 Gamificação
- ✅ XP acumulado em `profiles.points`
- ✅ Crédito 30% início / 70% conclusão
- ✅ Patentes configuráveis (`gamification_levels`)
- ✅ Ranking dinâmico

### 1.6 Métricas
- ✅ Tabela `access_logs` imutável
- ✅ Painel de métricas no Admin
- ✅ Ranking de materiais e usuários
- ✅ Histórico de visualizações
- ✅ Conclusões por material e trilha

### 1.7 Internacionalização
- ✅ `LanguageContext` custom (PT-BR / EN-US / ES-ES)
- ✅ Títulos multi-idioma em materiais e trilhas
- ✅ Fallback para PT-BR

### 1.8 Theming
- ✅ Sistema de 42 tokens CSS
- ✅ Persistência em `system_config.theme_dark`
- ✅ Theme Editor visual no Admin
- ✅ Overrides por ambiente (`environment_themes`)
- ✅ Gradientes customizáveis
- ✅ Glassmorphism + grain + blobs (core)
- ✅ Dark mode permanente (sem light)

### 1.9 UX
- ✅ Notificações via `sonner` exclusivamente
- ✅ Mobile: tabelas → cards, modais → bottom sheets
- ✅ Atalhos: Ctrl+F, Esc, ?
- ✅ Modal de ajuda de atalhos
- ✅ Skeleton loaders

### 1.10 Documentação
- ✅ `database-schema.md`
- ✅ `branding-guide.md`
- ✅ `design-system-dark.md`
- ✅ Manuais por persona (admin, gestor, cliente, cadastro)
- ✅ `deploy-vps.md`
- ✅ `demo-credentials.md`
- ✅ `SPEC.md`, `requirements.md`, `design.md`, `tasks.md` (este arquivo)

---

## 2. Em Andamento 🔄

- 🔄 Refinamentos de UX no painel de métricas
- 🔄 Otimização de queries de ranking (paginação server-side)

---

## 3. Planejado ⏳

### 3.1 Curto prazo
- ⏳ Notificações in-app (sino com badge de não-lidas)
- ⏳ Filtros avançados na lista de materiais (por tag, categoria, idioma)
- ⏳ Bulk actions no admin (ativar/desativar múltiplos materiais)
- ⏳ Export CSV de métricas

### 3.2 Médio prazo
- ⏳ Sistema de favoritos de materiais
- ⏳ Comentários/feedback em materiais (moderação admin)
- ⏳ Quizzes ao final de trilhas com XP extra
- ⏳ Certificados PDF ao concluir trilha
- ⏳ Push notifications (PWA)

### 3.3 Longo prazo
- ⏳ App mobile nativo (React Native)
- ⏳ API pública para integrações
- ⏳ Múltiplos níveis de manager (regional, nacional)
- ⏳ Sistema de tickets/suporte interno
- ⏳ Dashboard analítico avançado com gráficos temporais

---

## 4. Débito Técnico

- ⚠️ Triggers reportados como 0 no schema introspection — confirmar via Lovable Cloud que `handle_new_user`, `update_updated_at_column`, `validate_invite_token_expiry` estão ativos; recriar via migration se necessário.
- ⚠️ `theme_light` em `system_config` é legado — manter por compat de schema mas nunca consumir.
- ⚠️ `mockDb.ts` mantém fallback local para `@demo.com` — avaliar remoção quando contas demo migrarem para Supabase real.
- ⚠️ Consultas que atingem o limite de 1000 linhas do Supabase precisam de paginação explícita.

---

## 5. Convenções de Trabalho

- Todo PR deve respeitar tokens CSS (zero cores hardcoded).
- Toda mudança de schema via migration (não editar `types.ts` manualmente).
- Toda nova rota deve declarar role permitido e proteger via `AuthContext`.
- Toda abertura de material deve continuar logando em `access_logs`.
- Toda Edge Function nova deve definir `verify_jwt` explicitamente em `supabase/config.toml`.
