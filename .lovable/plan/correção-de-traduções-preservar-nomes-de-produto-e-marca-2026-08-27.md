# Correção de traduções: preservar nomes de produto e marca

## O que a varredura encontrou

Analisei os títulos multilíngues de todos os materiais e trilhas no banco. A boa notícia: a maioria dos nomes de produto (Easy Grip, Vulcano Actives, inLego, Master Flex, Start Flex, Stop Drill, Expertguide, Index Sensitive, Flex Gold NP, Torq, Flash, Slim) **está preservada**. Mas existem erros reais:

**1. Marca traduzida/corrompida (crítico)**

- Trilha "Implantes Conexão" → EN: **"Comexão implants"** (marca traduzida + erro de digitação no nome da empresa).

**2. Padrão do título quebrado entre idiomas**
O padrão PT é `Implante: <Produto>` / `Kit: <Produto>`, mas alguns registros viraram outra estrutura só em EN/ES:

- `Implante: Easy Grip` → EN "Easy Grip Implant", ES "Implante Easy Grip"
- `Implante: Short NP BLT` → EN "Short NP BLT Implant", ES "Implante Short NP BLT"
- `Guia Estratégico de Vendas: Kit Stop Drill` → EN "Strategic Sales Guide: **Stop Drill Kit**" (idem Expertguide) — o nome comercial "Kit Stop Drill" foi reordenado.

**3. Terminologia inconsistente entre materiais irmãos**

- "Guia Estratégico de Vendas" traduzido ora como "Sales Strategy Guide", ora como "Strategic Sales Guide".
- "Playbook Estratégico" → ES "Manual Estratégico" em um material e "Guía Estratégica" em outro.

**4. Cobertura incompleta**
Mais de 25 materiais (áudios dos Kits, vídeos e HTMLs da trilha de treinamento) têm **apenas pt-br** — em EN/ES o usuário vê o título em português.

**5. Causa raiz**
A Edge Function `translate-title` não recebe nenhuma lista de termos protegidos nem o padrão de formatação. O modelo é livre para reordenar e "traduzir" nomes próprios.

## Plano de ação

### A. Blindar a tradução automática (evita reincidência)

- Criar um glossário único de termos protegidos (marcas, linhas e produtos: Conexão, Conexão Implantes, Hub Conexão, Vulcano Actives, inLego, Easy, Easy Grip, Flash, Slim, Torq, Short HE RD, Short NP BLT, Flex Gold NP, Index Sensitive, Master Flex, Start Flex, Stop Drill, Expertguide, SPIN, DISC).
- Passar esse glossário no prompt do `translate-title` com regra explícita: nunca traduzir, nunca reordenar, nunca flexionar esses termos; preservar a estrutura do título original (o que está antes/depois dos `:` continua na mesma posição).
- Adicionar uma **verificação pós-tradução** na própria função: se algum termo protegido presente no original sumir da tradução, a função corrige/reverte o trecho antes de devolver o resultado.
- Aplicar a mesma proteção na tradução de títulos de trilhas (`CollectionFormModal`).

### B. Corrigir os dados já gravados

- Migração de dados corrigindo os títulos citados acima (trilha "Conexão Implantes", os `Implante: X`, os `Kit X` reordenados) e padronizando "Guia Estratégico de Vendas" → "Sales Strategy Guide" / "Guía Estratégica de Ventas" em todos os materiais.

### C. Completar o que falta

- Gerar EN/ES para os materiais que hoje só têm pt-br, já usando a função blindada, e revisar o resultado antes de gravar.

### D. Validação

- Conferência final no ambiente do usuário nos três idiomas, comparando cada nome de produto com o original.

## Detalhes técnicos

- Novo módulo compartilhado com a lista de termos protegidos, usado pelo prompt e pela verificação pós-processamento.
- `supabase/functions/translate-title/index.ts`: prompt reforçado + validação de termos + fallback.
- Migração SQL de UPDATE nos campos `title` (jsonb) de `materials` e `collections`.

&nbsp;

 Acrescente a esse plano a normalização dos nomes dos materiais. Se você conseguir normalizar os nomes, para que haja padrão, tanto dos materiais como das trilhas. Inclua isso e pode seguir com a implementarção.

&nbsp;