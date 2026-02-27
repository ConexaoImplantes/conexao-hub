

## Substituir todos os `alert()` por toasts da plataforma

### Problema
Notificações usam `alert()` nativo do navegador em vez dos toasts estilizados da plataforma (sonner).

### Arquivos e alterações

**1. `src/pages/Admin.tsx`** (~13 ocorrências)
- Importar `toast` de `sonner`
- Substituir cada `alert(mensagem)` por `toast.success(mensagem)` ou `toast.error(mensagem)` conforme o contexto (sucesso vs erro)
- Linhas afetadas: 298, 340, 349, 382, 391, 409, 424, 454, 478, 560, 562, 1731

**2. `src/contexts/AuthContext.tsx`** (1 ocorrência)
- Importar `toast` de `sonner`
- Linha 177: `alert("Cadastro realizado...")` → `toast.success("Cadastro realizado...")`

**3. `src/pages/AuthPage.tsx`** (2 ocorrências)
- Importar `toast` de `sonner`
- Linha 104: `alert(result)` → `toast.success(result)`
- Linha 106: `alert("Erro: " + e.message)` → `toast.error("Erro: " + e.message)`

**4. `src/components/hub/UserCommunicationModal.tsx`** (3 ocorrências)
- Importar `toast` de `sonner`
- Linha 30: `alert('Webhook URL não configurada...')` → `toast.error(...)`
- Linha 47: `alert(t('comm.success'))` → `toast.success(...)`
- Linha 50: `alert('Erro ao enviar.')` → `toast.error(...)`

### Regra de mapeamento
- Mensagens de sucesso → `toast.success()`
- Mensagens de erro → `toast.error()`
- Mensagens informativas → `toast.info()`

