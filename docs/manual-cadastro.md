# 📋 Manual de Cadastro e Acesso à Plataforma

> Este manual explica como criar sua conta, acompanhar a aprovação e fazer login na plataforma. Válido para **todos os perfis** (Cliente, Distribuidor, Consultor, Gestor e Administrador).

---

## 📑 Índice

1. [Como receber o link de convite](#1--como-receber-o-link-de-convite)
2. [Abrindo o link de convite](#2--abrindo-o-link-de-convite)
3. [Preenchendo o formulário de cadastro](#3--preenchendo-o-formulário-de-cadastro)
4. [Cadastro em análise (aguardando aprovação)](#4--cadastro-em-análise-aguardando-aprovação)
5. [Cadastro recusado](#5--cadastro-recusado)
6. [Cadastro aprovado](#6--cadastro-aprovado)
7. [Fazendo login](#7--fazendo-login)
8. [Ambiente de teste (login mock)](#8--ambiente-de-teste-login-mock)
9. [Problemas comuns](#9--problemas-comuns)

---

## 1. 🔗 Como receber o link de convite

O cadastro na plataforma **só é possível através de um link de convite** gerado por um administrador. Não existe cadastro livre — cada convite já define qual será o seu perfil na plataforma.

**Como funciona:**
1. O administrador acessa o painel e vai em **Configurações → Convites**.
2. Ele escolhe o perfil desejado (Cliente, Distribuidor, Consultor, Gestor ou Administrador) e a validade do link.
3. O link gerado é enviado a você por e-mail, WhatsApp ou qualquer outro meio de comunicação.

**Formato do link:**
```
https://conexao-hub.lovable.app/?token=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

> 💡 **Dica:** O link tem uma data de validade. Se expirar, solicite um novo ao administrador.

> ⚠️ **Importante:** Cada link de convite pode ser usado **apenas uma vez**. Após o cadastro, ele é automaticamente marcado como "usado".

---

## 2. 🌐 Abrindo o link de convite

Ao clicar no link de convite, a plataforma vai:

1. **Validar o token** — Você verá a mensagem "Validando convite..." com um ícone de carregamento.
2. **Exibir o formulário de cadastro** — Se o token for válido, o formulário aparecerá com o perfil já pré-definido.

**Se o link for inválido ou expirado:**
- Você verá um aviso em vermelho: _"Este link de convite é inválido ou expirou."_
- Abaixo, uma orientação: _"Solicite um novo link de cadastro ao administrador."_
- Um botão **"Voltar ao Login"** permite retornar à tela principal.

---

## 3. 📝 Preenchendo o formulário de cadastro

O formulário de cadastro contém os seguintes campos:

| Campo | Obrigatório? | Descrição |
|---|---|---|
| **Nome Completo** | ✅ Sim | Seu nome como será exibido na plataforma |
| **Email** | ✅ Sim | Será usado para fazer login |
| **Senha** | ✅ Sim | Defina uma senha segura |
| **WhatsApp** | ✅ Sim | Número para contato |
| **CRO** | ❌ Opcional | Aparece apenas para o perfil "Cliente" — registro profissional |

### Perfil pré-definido

Você verá um card informativo mostrando seu perfil, por exemplo:

> 🛡️ **Perfil pré-definido**
> Cliente

Esse perfil é definido pelo link de convite e **não pode ser alterado** durante o cadastro.

### Dica sobre a senha

- Clique no ícone de **olho** (👁️) ao lado do campo de senha para visualizar o que está digitando.
- Clique novamente para ocultar.

### Enviando o cadastro

1. Preencha todos os campos obrigatórios.
2. Clique no botão **"Confirmar Cadastro"**.
3. Se tudo estiver correto, você verá a mensagem: _"Cadastro realizado! Aguarde a aprovação do administrador."_

> ⚠️ **Atenção:** E-mails reservados para demonstração (como `admin@demo.com`, `client@demo.com`, etc.) **não podem ser usados** para cadastro real.

---

## 4. ⏳ Cadastro em análise (aguardando aprovação)

Após enviar o cadastro, seu status ficará como **"Pendente"**. Isso significa que:

- O administrador precisa revisar e aprovar sua conta.
- A tela de **Progresso de Cadastro** será exibida automaticamente.
- Ela mostra em tempo real o status da sua solicitação.

**O que você verá:**
- Um indicador visual com os passos: **Cadastro → Em análise → Aprovado**
- A etapa atual será destacada com cor dourada.

> 💡 **Dica:** Não feche a página! A atualização do status acontece em tempo real. Quando o administrador aprovar, a tela muda automaticamente.

---

## 5. ❌ Cadastro recusado

Se o administrador recusar seu cadastro, você verá:

- Uma mensagem indicando que o cadastro foi **recusado**.
- O **motivo da recusa** informado pelo administrador (a recusa sempre requer um motivo).
- Exemplo: _"Dados incompletos. Por favor, entre em contato para regularizar."_

**O que fazer:**
1. Leia o motivo com atenção.
2. Entre em contato com o administrador para esclarecer.
3. Solicite um novo link de convite, se necessário.

---

## 6. ✅ Cadastro aprovado

Quando o administrador aprovar seu cadastro:

1. A tela exibirá uma **animação de celebração** (confetti 🎉).
2. Você verá a mensagem: _"Cadastro aprovado!"_
3. Um botão **"Acessar Plataforma"** (ou redirecionamento automático ao login) ficará disponível.

---

## 7. 🔐 Fazendo login

Após a aprovação, você pode acessar a plataforma a qualquer momento:

1. Acesse a URL da plataforma: `https://conexao-hub.lovable.app`
2. Na tela de login, preencha:
   - **Email** — o mesmo usado no cadastro
   - **Senha** — a senha definida no cadastro
3. Clique em **"Entrar na Plataforma"**.

> 💡 **Dica:** Use o ícone de olho para verificar se está digitando a senha corretamente.

**Erros comuns no login:**
| Mensagem | Solução |
|---|---|
| _"Email ou senha incorretos."_ | Verifique se digitou corretamente |
| _"Este e-mail já está cadastrado."_ | Você já tem uma conta — tente fazer login |

---

## 8. 🧪 Ambiente de teste (login mock)

A plataforma oferece um **ambiente de teste** para que você possa explorar as funcionalidades sem precisar de um cadastro real.

**Perfis disponíveis para teste:**
| Perfil | Descrição |
|---|---|
| 🔴 **Super Admin** | Acesso total — todas as funcionalidades |
| 🟡 **Gestor** | Visualização de métricas e relatórios (somente leitura) |
| 🟢 **Cliente** | Dashboard com materiais e trilhas |
| 🔵 **Distribuidor** | Similar ao cliente, com materiais específicos |
| 🟣 **Consultor** | Similar ao cliente, com materiais específicos |

**Como usar:**
1. Na tela de login, procure a seção **"Ambiente de Teste"**.
2. Clique no botão do perfil desejado (ex: "Entrar como Cliente").
3. Você será logado automaticamente com dados fictícios.

> ⚠️ **Importante:** O ambiente de teste usa dados simulados (mock). Nenhuma alteração feita nesse modo afeta o banco de dados real.

---

## 9. ❓ Problemas comuns

### "Tabelas do banco de dados não encontradas"
- Isso significa que o banco de dados não está configurado corretamente.
- Um botão **"Resolver Agora"** aparecerá — clique para ver as instruções de configuração SQL.
- Este problema geralmente é resolvido pelo administrador do sistema.

### "Banco Incompleto"
- Na tela de login, pode aparecer um alerta vermelho com ícone de banco de dados.
- Clique no alerta para abrir o modal com o SQL necessário para configurar as tabelas.

### Link de convite não funciona
- Verifique se o link não expirou (o administrador define a validade).
- Verifique se o link já não foi usado (cada link funciona uma única vez).
- Solicite um novo link ao administrador.

---

> 📌 **Resumo rápido:**
> 1. Receba o link de convite do administrador
> 2. Preencha o formulário de cadastro
> 3. Aguarde a aprovação
> 4. Faça login com email e senha
> 5. Explore a plataforma!
