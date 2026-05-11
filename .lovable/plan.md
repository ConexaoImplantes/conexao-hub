## Reverter código ao estado de 07/05 ~12:09

Como aquela versão não aparece no histórico do editor, vou reconstruir manualmente removendo apenas as alterações feitas em 08/05 (resiliência a falhas de rede). Nenhum outro arquivo foi alterado entre 07/05 12:09 e 08/05 13:19, então a reconstrução será fiel.

### Arquivos afetados

**1. `src/contexts/AuthContext.tsx`**
Remover:
- Helpers `clearBrokenSession()` e `isFetchFailure()` (linhas 26–37)
- `safetyTimeout` de 3s no `useEffect` (linhas 40–43, 84)
- Tratamento de `isFetchFailure` em `initAuth` e `fetchProfile` (linhas 64–72, 77–80, 121–124)

Restaurar a inicialização simples original:
```ts
const initAuth = async () => {
  await checkDbConnection();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await fetchProfile(session.user.id);
  } else {
    setIsLoading(false);
  }
};
```

**2. `src/contexts/BrandContext.tsx`**
Remover:
- `timeoutId` de 2.5s e flag `isMounted` no `useEffect` de carregamento (linhas 92–118)

Restaurar para o `.then/.catch/.finally` simples sem timeout de segurança.

### O que NÃO será mexido

- Banco de dados (migrations de 07/05 da tabela `invite_tokens` permanecem)
- Edge functions
- Componentes `InviteShareModal.tsx`, `Admin.tsx`, e demais arquivos
- Configurações de tema, RLS, Cloud

### Risco conhecido

Sem os timeouts de segurança, se o Cloud voltar a ter o problema de timeout do dia 08/05 a aplicação pode ficar travada em "Carregando Sistema...". Caso isso aconteça, basta reverter para a mensagem do plano executado (que ficará no chat).

### Após executar

Testar login no preview para confirmar que o app sobe normalmente.
