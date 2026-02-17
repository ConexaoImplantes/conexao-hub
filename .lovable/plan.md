
# Aplicacao da Paleta de Cores - Branding Conexao Digital Implant

## Cores Extraidas das Imagens

| Cor | Hex | Uso na Marca |
|-----|-----|-------------|
| Azul Marinho Profundo | `#0a1e3d` | Fundo principal (backgrounds escuros) |
| Azul Marinho Medio | `#122a4f` | Superficies/cards no tema escuro |
| Dourado | `#c9a655` | Cor de destaque (CTAs, destaques, links ativos) |
| Branco | `#f8fafc` | Texto principal no tema escuro |
| Cinza Azulado | `#64748b` | Texto secundario |

## Proposta de Aplicacao

### Tema Escuro (Principal - reflete o branding forte da marca)

| Variavel | Valor Atual | Valor Proposto | Onde aparece |
|----------|------------|----------------|-------------|
| background | `#0f172a` | `#0a1e3d` | Fundo geral da aplicacao |
| surface | `#1e293b` | `#122a4f` | Cards, modais, header |
| textMain | `#f8fafc` | `#f8fafc` | Textos principais (mantido) |
| textMuted | `#94a3b8` | `#8a9bb8` | Textos secundarios, labels |
| border | `transparent` | `#1e3a5f` | Bordas de cards e inputs |
| accent | `#6366f1` | `#c9a655` | Botoes, links, badges ativos |
| success | `#22c55e` | `#22c55e` | Status de sucesso (mantido) |
| warning | `#eab308` | `#d4aa4f` | Alertas (harmonizado com dourado) |
| error | `#ef4444` | `#ef4444` | Erros (mantido) |

### Tema Claro (Versao profissional e limpa)

| Variavel | Valor Atual | Valor Proposto | Onde aparece |
|----------|------------|----------------|-------------|
| background | `#f8fafc` | `#f0f4f8` | Fundo geral |
| surface | `#ffffff` | `#ffffff` | Cards e modais (mantido) |
| textMain | `#0f172a` | `#0a1e3d` | Texto principal (azul marinho da marca) |
| textMuted | `#64748b` | `#5a6a7e` | Textos secundarios |
| border | `#e2e8f0` | `#d0d8e4` | Bordas |
| accent | `#3b82f6` | `#b8952e` | Dourado mais escuro para contraste em fundo claro |
| success | `#10b981` | `#10b981` | Mantido |
| warning | `#f59e0b` | `#c9a655` | Harmonizado com dourado |
| error | `#ef4444` | `#ef4444` | Mantido |

## Alteracoes Tecnicas

### Arquivo: `src/contexts/BrandContext.tsx`
- Atualizar o objeto `defaults` com os novos valores de `themeLight` e `themeDark`

### Arquivo: `src/index.css`
- Atualizar as variaveis CSS root (fallback) com os novos valores da paleta

### Arquivo: `src/components/hub/Layout.tsx`
- Atualizar o gradiente do avatar/logo de `from-blue-500 to-purple-600` para `from-[#0a1e3d] to-[#c9a655]` (azul marinho para dourado)
- Atualizar o gradiente do avatar do usuario de `from-blue-500 to-purple-500` para o mesmo esquema

### Arquivo: `src/pages/AuthPage.tsx`
- Atualizar gradientes e cores de destaque na tela de login para usar o azul marinho e dourado da marca

## Resultado Esperado
- O tema escuro reflete fielmente o branding sofisticado e premium da Conexao Digital Implant
- O dourado como cor de destaque traz a identidade visual da marca para botoes e elementos interativos
- O tema claro mantem a legibilidade com toques sutis do azul marinho e dourado
- Consistencia visual entre todos os componentes da aplicacao
