

## Problema

`isLogin` inicia como `true` e só muda para `false` dentro do `useEffect` (assíncrono). Quando o usuário acessa com `?token=xxx`, ele vê brevemente (ou permanentemente, dependendo do timing) o formulário de **login** em vez do formulário de **cadastro**.

## Correção

**Arquivo: `src/pages/AuthPage.tsx` (linha 16)**

Inicializar `isLogin` de forma síncrona baseado nos parâmetros da URL:

```typescript
// Antes:
const [isLogin, setIsLogin] = useState(true);

// Depois:
const [isLogin, setIsLogin] = useState(() => {
  const params = new URLSearchParams(window.location.search);
  return !params.has('token') && !params.has('role');
});
```

Isso garante que se houver `?token=` ou `?role=` na URL, o formulário de cadastro é mostrado **imediatamente**, sem flash do formulário de login.

