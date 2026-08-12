# Suporte a .pptx / .ppt no tipo de material HTML

## Objetivo
Permitir que o tipo de material "HTML / Página Interativa" também aceite apresentações PowerPoint (.pptx e .ppt), tanto por upload quanto por link (Google Drive ou URL direta), e que elas abram normalmente dentro do modal de visualização.

## O que muda para o usuário

1. **Cadastro do material (painel administrativo)**
   - No formulário de material, ao escolher o tipo HTML, o campo de upload passa a aceitar `.html`, `.htm`, `.ppt` e `.pptx`.
   - Mesma mudança no gerenciador de versões por idioma (upload por idioma).
   - Textos de ajuda atualizados: "Página HTML ou apresentação (.ppt/.pptx)".

2. **Visualização (modal do usuário)**
   - Se o arquivo for `.ppt`/`.pptx` hospedado no storage ou em URL pública direta: renderiza no visualizador Office Online em tela cheia (slides navegáveis, sem download visível).
   - Se o link for do Google Drive: usa o preview nativo do Drive (já suportado hoje para outros tipos).
   - Arquivos `.html` continuam funcionando exatamente como hoje.
   - O overlay "Carregando material…" continua sendo exibido até o slide carregar.

3. **Download**
   - O botão de download (quando o Super Admin habilita) continua funcionando via proxy, agora com a extensão correta `.pptx`/`.ppt` no nome do arquivo.

## Detalhes técnicos

- `src/components/hub/MaterialFormModal.tsx` e `src/components/hub/AssetManagerModal.tsx`:
  - `accept=".html,.htm,.ppt,.pptx"` no input de arquivo; validação de extensão ampliada; `contentType` correto no upload para o bucket `materials` (`application/vnd.openxmlformats-officedocument.presentationml.presentation` para pptx, `application/vnd.ms-powerpoint` para ppt).
- `src/components/hub/ViewerModal.tsx`:
  - Novo helper `isPresentation(url)` (checa extensão, ignorando querystring).
  - O `useEffect` que faz `fetch(url).text()` para materiais HTML passa a ignorar apresentações (evita baixar o binário como texto).
  - No bloco de render do tipo `html`: se for apresentação e o link for Drive → iframe `drive.google.com/file/d/<id>/preview`; caso contrário → iframe `https://view.officeapps.live.com/op/embed.aspx?src=<url encodada>`.
  - `extForType` reconhece `ppt`/`pptx` para o nome do arquivo baixado.
- Sem mudanças de banco de dados: o tipo continua sendo `html`.

## Limitação a registrar
O visualizador Office Online exige que a URL do arquivo seja publicamente acessível. Arquivos enviados ao bucket `materials` (público) e links diretos públicos funcionam; arquivos do Google Drive usam o preview do próprio Drive, sem depender do Office.
