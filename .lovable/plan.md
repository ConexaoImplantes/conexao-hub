## Objetivo

Transformar o fluxo "Gerar Convite" em uma jornada com modal de dados do destinatário, geração de link de WhatsApp pré-preenchido e rastreamento de status (Pendente → Enviado) por convite.

## Jornada implementada

1. Em **Configurações → Convites**, o card de cada convite gerado passa a ter um botão **"Gerar Link"** (substitui o atual "Copiar" como ação principal de compartilhamento — "Copiar" continua disponível como ação secundária).
2. Clique em **"Gerar Link"** → abre **Modal de Compartilhamento**.
3. Usuário preenche: Nome do Remetente, Nome do Destinatário, Celular do Destinatário (com máscara/validação E.164). Padrão do número será 5519988776655 (ddi+ddd+numero)
4. Clique em **"Gerar Link"** dentro do modal → sistema monta a URL do WhatsApp, salva os dados no convite, fecha o modal.
5. No card do convite:
  - Botão "Gerar Link" some.
  - Aparece **ícone do WhatsApp** + **badge "PENDENTE"** (amarelo).
6. Usuário clica no **ícone do WhatsApp** → abre o link em nova aba (`target="_blank"`), badge muda para **"ENVIADO"** (verde), ícone do WhatsApp some.
7. Aparece a linha: *"Link compartilhado com {nome_destinatario} em dd/mm/yyyy às hh:mm:ss. Link expira em dd/mm/yyyy"*.

## Saudação dinâmica

Calculada no momento do clique em "Gerar Link" do modal (hora local do remetente):

- 00:00–11:59 → "Bom dia"
- 12:00–17:59 → "Boa tarde"
- 18:00–23:59 → "Boa noite"

## Mensagem padrão (URL-encoded)

```
{saudacao} {nome_destinatario}

Aqui é o {nome_remetente}

Segue abaixo o link para gerar sua credencial de acesso ao Hub-Conexão.

Link: {link_convite}

Qualquer dúvida,
estou à disposição
```

URL final: `https://api.whatsapp.com/send?phone={celular}&text={mensagem_encoded}`
(corrigindo o domínio do brief: `api.whatsapp.com`, não `api.whatsapp`).

## Mudanças técnicas

### Banco de dados (migração)

Adicionar colunas em `invite_tokens`:

- `sender_name text`
- `recipient_name text`
- `recipient_phone text`
- `recipient_message text` (mensagem final gerada, opcional para auditoria)
- `shared_at timestamptz` (preenchido quando ícone WhatsApp é clicado → vira "Enviado")
- `share_prepared_at timestamptz` (quando o link foi gerado → vira "Pendente")

Status derivado em UI:

- sem `share_prepared_at` → mostra botão "Gerar Link"
- com `share_prepared_at` e sem `shared_at` → "PENDENTE" + ícone WhatsApp
- com `shared_at` → "ENVIADO" + texto de confirmação

### Frontend

- **Novo componente**: `src/components/hub/InviteShareModal.tsx` (modal com 3 inputs + botão, validação Zod, máscara de telefone).
- `**src/pages/Admin.tsx**`: trocar botão "Copiar" como primário pelo botão "Gerar Link"; renderizar ícone WhatsApp + badge dinâmico + frase de confirmação por convite.
- `**src/lib/mockDb.ts**`: novos métodos `prepareInviteShare(tokenId, {senderName, recipientName, recipientPhone, message})` e `markInviteShared(tokenId)`.

### Validação (Zod)

- Nome remetente: 2–80 chars, trim.
- Nome destinatário: 2–80 chars, trim.
- Celular: dígitos 10–15, normalizado para E.164 sem `+` (formato exigido pela API WhatsApp).

## Fora do escopo

- Não envia mensagem automaticamente (apenas abre o WhatsApp Web/app pré-preenchido).
- Não altera o fluxo de criação inicial do token (role + expiração continuam como hoje).
- Não notifica o destinatário se o link expirar.