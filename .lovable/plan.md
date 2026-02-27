

## Problema

Os links de convite estão usando `window.location.origin` para gerar a URL, o que resulta na URL do preview (`lovableproject.com`) que exige autenticação da plataforma Lovable. Usuários externos recebem "Access denied".

## Correção

**Arquivo: `src/pages/Admin.tsx` (linha ~1763)**

Substituir `window.location.origin` por uma constante com a URL publicada fixa:

```typescript
const publishedUrl = 'https://conexao-hub.lovable.app';
const fullUrl = `${publishedUrl}/?token=${tk.token}`;
```

Isso garante que todos os links de convite gerados sempre apontem para a URL pública, acessível sem login na plataforma Lovable.

