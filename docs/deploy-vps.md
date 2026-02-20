# Manual de Deploy: Hub Conexao — VPS + Supabase

## Visao Geral

Este manual descreve como instalar a plataforma Hub Conexao em uma **VPS tradicional** (Contabo, Hetzner, DigitalOcean, Hostinger, etc.) usando **Nginx** como servidor web e **Supabase** como backend.

---

## Pre-requisitos

- VPS com Ubuntu 22.04 ou 24.04 (minimo 1GB RAM, 1 vCPU)
- Acesso SSH (via Bitvise, PuTTY, Terminal, etc.)
- Dominio apontando para o IP da VPS (opcional, mas recomendado)
- Conta no Supabase (gratuita em supabase.com)
- Repositorio do projeto no GitHub

---

## Parte 1: Configurar o Supabase

> Esta parte e identica para qualquer tipo de hosting. Siga exatamente os mesmos passos do manual Vercel.

### 1.1 Criar o Projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Escolha um nome, senha e regiao
4. Aguarde a criacao

### 1.2 Copiar Credenciais

Em **Settings > API**, anote:

| Credencial | Variavel |
|---|---|
| **Project URL** | `VITE_SUPABASE_URL` |
| **anon / public key** | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| **Project Reference ID** | `VITE_SUPABASE_PROJECT_ID` |

### 1.3 Executar o Script SQL

No **SQL Editor** do Supabase, execute o script completo de criacao de tabelas, funcoes, triggers e RLS. O script esta disponivel no arquivo `.lovable/plan.md` (secao 1.3).

### 1.4 Configurar Autenticacao

Em **Authentication > Settings**:
- Ative "Enable Email Signup"
- Em **URL Configuration**, defina o **Site URL** como seu dominio (ex: `https://hubconexao.com.br`)

### 1.5 Criar Usuario Admin

1. Crie o usuario em **Authentication > Users > Add User**
2. No SQL Editor, promova-o:

```sql
UPDATE public.user_roles SET role = 'super_admin' WHERE user_id = 'ID_DO_USUARIO';
UPDATE public.profiles SET status = 'active' WHERE id = 'ID_DO_USUARIO';
```

---

## Parte 2: Preparar a VPS

### 2.1 Conectar via SSH

```bash
# Via terminal (Mac/Linux) ou Bitvise/PuTTY (Windows)
ssh root@SEU_IP_DA_VPS
```

### 2.2 Atualizar o Sistema

```bash
apt update && apt upgrade -y
```

### 2.3 Instalar Node.js (via NVM)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Recarregar o terminal
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts

# Verificar instalacao
node -v   # deve mostrar v20.x ou v22.x
npm -v    # deve mostrar 10.x+
```

### 2.4 Instalar Nginx

```bash
apt install nginx -y

# Verificar se esta rodando
systemctl status nginx
```

### 2.5 Instalar Git

```bash
apt install git -y
```

### 2.6 Instalar Certbot (SSL gratuito)

```bash
apt install certbot python3-certbot-nginx -y
```

---

## Parte 3: Clonar e Buildar o Projeto

### 3.1 Clonar o Repositorio

```bash
# Criar diretorio para projetos web
mkdir -p /var/www
cd /var/www

# Clonar o repositorio
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git hub-conexao

cd hub-conexao
```

### 3.2 Criar arquivo .env

```bash
nano .env
```

Cole o seguinte conteudo (substitua pelos valores do SEU Supabase):

```
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUA_CHAVE_ANON
VITE_SUPABASE_PROJECT_ID=SEU_PROJECT_ID
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

### 3.3 Instalar Dependencias

```bash
npm install
```

### 3.4 Fazer o Build

```bash
npm run build
```

Isso gera a pasta `dist/` com os arquivos estaticos prontos para servir.

### 3.5 Verificar o Build

```bash
ls dist/
# Deve mostrar: index.html, assets/, etc.
```

---

## Parte 4: Configurar o Nginx

### 4.1 Criar Configuracao do Site

```bash
nano /etc/nginx/sites-available/hub-conexao
```

Cole o seguinte conteudo:

**Opcao A — Com dominio:**

```nginx
server {
    listen 80;
    server_name hubconexao.com.br www.hubconexao.com.br;

    root /var/www/hub-conexao/dist;
    index index.html;

    # Compressao gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache de assets estaticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - ESSENCIAL para React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Seguranca basica
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Opcao B — Sem dominio (apenas IP):**

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/hub-conexao/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

### 4.2 Ativar o Site

```bash
# Criar link simbolico
ln -s /etc/nginx/sites-available/hub-conexao /etc/nginx/sites-enabled/

# Remover site padrao do Nginx (opcional)
rm -f /etc/nginx/sites-enabled/default

# Testar configuracao
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### 4.3 Verificar

Acesse `http://SEU_IP_DA_VPS` no navegador. O site deve aparecer.

---

## Parte 5: SSL com Let's Encrypt (HTTPS)

> Requer um dominio configurado apontando para o IP da VPS.

### 5.1 Configurar DNS

No painel do seu provedor de dominio, crie:

| Tipo | Nome | Valor |
|---|---|---|
| A | @ | IP_DA_SUA_VPS |
| A | www | IP_DA_SUA_VPS |

Aguarde a propagacao DNS (pode levar ate 24h, geralmente minutos).

### 5.2 Gerar Certificado SSL

```bash
certbot --nginx -d hubconexao.com.br -d www.hubconexao.com.br
```

Siga as instrucoes:
- Informe seu email
- Aceite os termos
- Escolha redirecionar HTTP para HTTPS (recomendado)

### 5.3 Verificar Renovacao Automatica

```bash
certbot renew --dry-run
```

O Certbot renova automaticamente a cada 90 dias.

---

## Parte 6: Atualizacoes Futuras

Sempre que houver alteracoes no codigo, faca o seguinte na VPS:

### 6.1 Atualizar Manualmente

```bash
cd /var/www/hub-conexao

# Baixar ultimas alteracoes
git pull origin main

# Reinstalar dependencias (se houver mudancas no package.json)
npm install

# Rebuildar
npm run build

# Nginx ja serve os novos arquivos automaticamente
```

### 6.2 Script de Deploy Automatico (Opcional)

Crie um script para facilitar:

```bash
nano /var/www/deploy.sh
```

```bash
#!/bin/bash
echo "🚀 Iniciando deploy do Hub Conexao..."

cd /var/www/hub-conexao

echo "📥 Baixando alteracoes..."
git pull origin main

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Fazendo build..."
npm run build

echo "✅ Deploy concluido! O site ja esta atualizado."
```

```bash
chmod +x /var/www/deploy.sh
```

Para atualizar, basta rodar:

```bash
/var/www/deploy.sh
```

### 6.3 Deploy Automatico via GitHub Webhook (Avancado)

Para deploys automaticos ao dar push no GitHub, voce pode configurar um webhook. Isso requer um servico adicional rodando na VPS (como um pequeno servidor Node.js ou o `webhook` do Linux). Este passo e opcional e avancado.

---

## Parte 7: Monitoramento e Manutencao

### 7.1 Verificar Status dos Servicos

```bash
# Nginx
systemctl status nginx

# Ver logs de acesso
tail -f /var/log/nginx/access.log

# Ver logs de erro
tail -f /var/log/nginx/error.log
```

### 7.2 Reiniciar Servicos

```bash
# Reiniciar Nginx
systemctl restart nginx

# Recarregar configuracao sem downtime
systemctl reload nginx
```

### 7.3 Firewall (Recomendado)

```bash
# Instalar e configurar UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Verificar status
ufw status
```

---

## Diferencas entre Provedores de VPS

O processo e **identico** para todos os provedores. A unica diferenca e como voce acessa o painel de controle para:

| Provedor | Painel | Observacoes |
|---|---|---|
| **Contabo** | my.contabo.com | VPS mais baratas, bom custo-beneficio |
| **Hetzner** | console.hetzner.cloud | Excelente performance na Europa |
| **DigitalOcean** | cloud.digitalocean.com | Interface amigavel, bons tutoriais |
| **Hostinger** | hpanel.hostinger.com | Bom para iniciantes |
| **Vultr** | my.vultr.com | Boa variedade de localizacoes |
| **Linode/Akamai** | cloud.linode.com | Boa documentacao tecnica |

Em todos os casos:
1. Crie uma VPS com Ubuntu 22.04/24.04
2. Anote o IP e senha root (ou configure chave SSH)
3. Siga este manual a partir do Passo 2.1

---

## Arquitetura Final

```
Navegador do Usuario
       |
       | HTTPS (porta 443)
       v
+------------------+
|  VPS (Contabo/   |
|  Hetzner/DO/etc) |
|                  |
|  Nginx           |
|  serve dist/     |
+------------------+
       |
       | API calls (HTTPS)
       v
+------------------+
|  Supabase        |
|  (Cloud)         |
|  - PostgreSQL    |
|  - Auth          |
|  - Edge Funcs    |
+------------------+
```

---

## Checklist Final

- [ ] VPS criada com Ubuntu 22.04/24.04
- [ ] Sistema atualizado (`apt update && apt upgrade`)
- [ ] Node.js instalado via NVM
- [ ] Nginx instalado e rodando
- [ ] Git instalado
- [ ] Repositorio clonado em `/var/www/hub-conexao`
- [ ] Arquivo `.env` criado com credenciais do Supabase
- [ ] `npm install` executado com sucesso
- [ ] `npm run build` executado com sucesso
- [ ] Nginx configurado com `try_files` para SPA
- [ ] Site acessivel via IP
- [ ] DNS configurado (se usando dominio)
- [ ] SSL ativado via Certbot (se usando dominio)
- [ ] Firewall configurado (UFW)
- [ ] Supabase configurado (tabelas, RLS, admin)
- [ ] Testar login, cadastro e navegacao

---

## Custos Estimados

| Provedor | Plano Minimo | RAM | Disco | Preco/mes |
|---|---|---|---|---|
| Contabo | VPS S | 4 GB | 50 GB SSD | ~€5 |
| Hetzner | CX22 | 4 GB | 40 GB | ~€4 |
| DigitalOcean | Basic | 1 GB | 25 GB SSD | $6 |
| Hostinger | KVM 1 | 4 GB | 50 GB | ~€5 |
| Vultr | Cloud | 1 GB | 25 GB SSD | $6 |
| **Supabase** | Free | - | 500 MB DB | Gratis |
