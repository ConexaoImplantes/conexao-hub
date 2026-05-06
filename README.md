# Hub Conexão — Conexão Digital Implant

Plataforma de compartilhamento de conhecimento e materiais (PDFs, vídeos, áudios, páginas interativas) com sistema de trilhas, gamificação por XP, multi-idioma (PT-BR / EN-US / ES-ES) e painéis administrativo e gestor.

> **URL pública**: https://conexao-hub.lovable.app
> **Projeto Lovable**: https://lovable.dev/projects/28c2c01a-f31c-4af5-a9a2-e18efc1592ac

---

## Stack

- **Frontend**: React 18 + Vite 5 + TypeScript + Tailwind CSS 3 + shadcn/ui
- **Backend**: Lovable Cloud (Postgres gerenciado + Auth + Storage + Edge Functions)
- **Roteamento**: React Router (SPA)
- **Estado**: Context API (`AuthContext`, `BrandContext`, `LanguageContext`, `ShortcutContext`)
- **AI**: Lovable AI Gateway (Gemini) — geração de capas de trilhas e tradução automática

---

## Recursos principais

- 🔐 Autenticação por convite (cada link já carrega o `role` pré-definido)
- 👥 5 perfis: `super_admin`, `manager`, `consultant`, `distributor`, `client`
- 📄 Materiais com tradução por idioma (`material_assets`) e categorias/tags
- 📖 Trilhas (collections) com progresso isolado por trilha e XP bônus de conclusão
- ⭐ Gamificação configurável (patentes / `gamification_levels`)
- 📊 Métricas em tempo real: `access_logs` registra toda visualização de material
- 🎨 Tema customizável via `system_config` (42 tokens, dark mode permanente)
- 🌐 i18n custom (PT-BR / EN-US / ES-ES)
- ⌨️ Atalhos de teclado (`Ctrl+F`, `Esc`, `?`)

---

## Documentação

| Arquivo | Para quem |
|---|---|
| [`docs/database-schema.md`](docs/database-schema.md) | Desenvolvedores — schema do banco, RLS, edge functions |
| [`docs/branding-guide.md`](docs/branding-guide.md) | Designers e devs — identidade visual, tokens, efeitos |
| [`docs/design-system-dark.md`](docs/design-system-dark.md) | Tokens consolidados (dark mode) |
| [`docs/manual-admin.md`](docs/manual-admin.md) | Administradores — painel completo |
| [`docs/manual-gestor.md`](docs/manual-gestor.md) | Gestores — painel read-only |
| [`docs/manual-cliente.md`](docs/manual-cliente.md) | Clientes/Distribuidores/Consultores |
| [`docs/manual-cadastro.md`](docs/manual-cadastro.md) | Fluxo de cadastro por convite |
| [`docs/demo-credentials.md`](docs/demo-credentials.md) | Contas mock de demonstração |
| [`docs/deploy-vps.md`](docs/deploy-vps.md) | Deploy alternativo em VPS própria |

---

## Desenvolvimento local

```sh
npm install
npm run dev
```

Variáveis de ambiente (`.env`, gerenciadas automaticamente pelo Lovable Cloud):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

---

## Edge Functions

Em `supabase/functions/`:

- **`delete-user`** — único caminho de hard delete (sincroniza `auth.users` + `profiles` + `user_roles`)
- **`generate-trail-cover`** — gera capa Navy/Gold de trilhas via Gemini
- **`translate-title`** — traduz títulos de materiais (PT↔EN↔ES)

Deploy automático ao salvar.

---

## Convenções críticas

- **Roles** vivem **somente** em `user_roles`. Nunca em `profiles` (privilege escalation).
- **Dark mode permanente** — não usar `dark:` prefix nem classes light (`bg-white`, etc.).
- **Cores** sempre via tokens CSS (`var(--color-*)`). Nunca hardcode.
- **Notificações** — apenas `sonner` toasts. Nunca `alert()`.
- **Mobile** — tabelas viram card-lists; modais viram bottom sheets.
- **`access_logs`** — toda abertura de material via `ViewerModal` registra um log (cobre todos os tipos).
