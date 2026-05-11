# =====================================================================
# Hub Conexão — build estático (Vite) + Nginx
# =====================================================================
# As variáveis VITE_* precisam estar disponíveis no momento do BUILD,
# pois o Vite as inlineia no bundle. Por isso são passadas como ARG.
# =====================================================================

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Build args (Vite injeta em build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

# Instala dependências (usa lockfile do bun se existir, fallback npm)
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f bun.lockb ]; then \
      npm install -g bun && bun install --frozen-lockfile; \
    else \
      npm ci; \
    fi

COPY . .
RUN if [ -f bun.lockb ]; then bun run build; else npm run build; fi

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine

# Configuração SPA (todas as rotas → index.html)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
