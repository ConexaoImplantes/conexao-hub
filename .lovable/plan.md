## Migração do Lovable Cloud para Supabase externa

Gerar um pacote completo de SQL + scripts auxiliares para recriar o backend atual em um projeto Supabase novo (externo), preservando schema, dados, RLS, triggers, storage, edge functions e UUIDs.

### Entregáveis em `/mnt/documents/migration/`

1. `**01_schema.sql**` — schema consolidado e idempotente:
  - Extensão `pgcrypto`
  - Enums: `app_role`, `app_status`, `app_language`, `material_type`, `translation_status`, `progress_status`
  - 12 tabelas públicas + view `system_config_public`
  - Funções `SECURITY DEFINER`: `has_role`, `get_user_role`, `handle_new_user`, `update_updated_at_column`, `validate_invite_token_expiry`
  - Triggers: `on_auth_user_created` em `auth.users`; `update_updated_at_*` em todas as tabelas com `updated_at`; `validate_invite_token_expiry` em `invite_tokens`
  - RLS habilitado + todas as políticas PERMISSIVE atuais
  - Índices em `material_id`, `user_id`, `collection_id` e `access_logs.timestamp`
2. `**02_storage.sql**` — buckets `branding`, `materials`, `trail-covers` (públicos) com policies de upload/leitura.
3. `**03_seed_config.sql**` — `system_config` (id=1) com `app_name`, `logo_url`, `theme_dark`, `theme_mode`, `environment_themes` exatos do projeto atual + `gamification_levels` (5) + `invite_tokens` ainda ativos (44).
4. `**04_seed_content.sql**` — conteúdo independente de `auth.users`:
  - `materials` (50)
  - `material_assets` (126)
  - `collections` (7)
  - `collection_items` (19)
5. `**05_seed_users.sql**` — `profiles` (38) + `user_roles` (38). ⚠️ Roda **só após** recriar `auth.users` com os mesmos UUIDs.
6. `**06_seed_progress.sql**` — `user_progress` (328) + `access_logs` (877) + `collection_progress` (0).
7. `**07_auth_users.***` — migração dos usuários do `auth`:
  - **Opção A (padrão):** `import_auth_users.ts` via `supabase.auth.admin.createUser`, preservando UUIDs. Senhas atuais não são exportáveis — usuários recebem link de reset.
  - **Opção B:** comando `pg_dump` + `pg_restore` da tabela `auth.users` preservando `encrypted_password` (login mantido). Requer `SUPABASE_DB_URL` dos dois projetos.
8. `**README.md**` — ordem de execução, pré-requisitos e checklist.

### Ordem de execução no novo Supabase

```text
1. Criar projeto Supabase novo
2. SQL Editor → 01_schema.sql
3. SQL Editor → 02_storage.sql
4. SQL Editor → 03_seed_config.sql
5. SQL Editor → 04_seed_content.sql
6. Recriar auth.users (Opção A ou B)
7. SQL Editor → 05_seed_users.sql
8. SQL Editor → 06_seed_progress.sql
9. Re-upload dos arquivos dos buckets (script opcional)
10. Re-deploy das 3 Edge Functions (delete-user, generate-trail-cover, translate-title) com secrets
11. Atualizar VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY no frontend
```

### Pontos técnicos

- **UUIDs preservados** em todos os INSERTs para manter integridade referencial (profiles ↔ user_roles ↔ progress ↔ logs).
- **JSONB** (`title`, `description`, `theme_dark`, `environment_themes`, `preferences`) exportados como JSON literais válidos.
- **Sem FKs declarados** no schema atual — replicado igual para evitar quebras de ordem de insert.
- **Storage objects** (binários) não vão no SQL; precisam ser re-uploadados via script separado se confirmado.
- **Edge Functions** já versionadas em `supabase/functions/` — basta `supabase functions deploy` no novo projeto + recriar secrets (`LOVABLE_API_KEY`, etc.).

### Volume atual a migrar


| Tabela              | Linhas |
| ------------------- | ------ |
| profiles            | 38     |
| user_roles          | 38     |
| materials           | 50     |
| material_assets     | 126    |
| collections         | 7      |
| collection_items    | 19     |
| user_progress       | 328    |
| collection_progress | 0      |
| access_logs         | 877    |
| gamification_levels | 5      |
| invite_tokens       | 44     |
| system_config       | 1      |


### Perguntas antes de gerar os arquivos

1. **Auth:** Opção A (script Admin API, usuários trocam senha) ou Opção B (pg_dump preservando senhas)? B
2. **Storage:** quer também o script para copiar os arquivos dos 3 buckets? SIM
3. Confirma que o frontend continua no Lovable mas apontando para a nova URL/anon key? Não. O frontend rodará em uma VPS, ele será uma stack dentro de um docker swarm. preciso que gere o docker-compose.yml do projeto para criarmos a imagem no docker-hub. segue um modelo de docker-compose.yml:  
  

  ```dockercompose
  version: "3.8"

  services:

  ## --------------------------- CONEXÃO HUB --------------------------- ##

    app:
      # No modo Portainer/Swarm, usamos a imagem pré-construída no Docker Hub
      image: hevertonperes/conexao-hub:latest
      
      # container_name e build foram removidos para compatibilidade com Portainer Stacks
      
      deploy:
        replicas: 1
        restart_policy:
          condition: on-failure
        resources:
          limits:
            cpus: "1"
            memory: 1024M

      networks:
        - network_conexao

      environment:
        - NODE_ENV=production
        - TZ=America/Sao_Paulo
        - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
        - VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
        - VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
        - VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}

      ## 🌐 Configurações Traefik (Segurança e Redirecionamento)
      labels:
        - "traefik.enable=true"
        # Roteador Seguro (HTTPS)
        - "traefik.http.routers.conexao_hub.rule=Host(`hub.vpsconexao.org`)"
        - "traefik.http.routers.conexao_hub.entrypoints=websecure"
        - "traefik.http.routers.conexao_hub.tls.certresolver=letsencryptresolver"
        # Redirecionamento Automático (HTTP -> HTTPS)
        - "traefik.http.routers.conexao_hub_http.rule=Host(`hub.vpsconexao.org`)"
        - "traefik.http.routers.conexao_hub_http.entrypoints=web"
        - "traefik.http.routers.conexao_hub_http.middlewares=conexao_redirect"
        - "traefik.http.middlewares.conexao_redirect.redirectscheme.scheme=https"
        # Porta interna do container (Nginx/Vite)
        - "traefik.http.services.conexao_hub.loadbalancer.server.port=80"

  ## --------------------------- INFRA --------------------------- ##

  networks:
    network_conexao:
      external: true
      name: network_conexao

  ```