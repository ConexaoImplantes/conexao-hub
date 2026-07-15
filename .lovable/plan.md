# Plano: Onboarding guiado por ambiente

Onboarding em duas camadas para cada ambiente (Admin, Gestor, Usuário):
1. **Modal de boas-vindas** na primeira entrada — explica o que o usuário pode fazer e visualizar naquele ambiente.
2. **Tour interativo** com destaque (spotlight) sobre elementos reais da tela + balão explicativo passo-a-passo.
3. **Balão flutuante** fixo no canto inferior direito, presente em todos os ambientes, para reabrir o tour a qualquer momento.

---

## 1. Persistência da preferência

- Guardar por usuário + ambiente no `profiles.preferences` (jsonb já existente), sob a chave `onboarding`:
  ```json
  { "onboarding": { "admin": { "seen": true }, "manager": { "seen": false }, "client": { "seen": true } } }
  ```
- Para contas mock (`mock-*`) usar `localStorage` (`hub:onboarding:<role>`), sem tocar no banco.
- Checkbox no modal: *"Não mostrar novamente"* → grava `seen: true`.
- O balão flutuante ignora essa preferência: sempre reabre o tour sob demanda.

## 2. Componentes novos

Em `src/components/onboarding/`:

- **`OnboardingProvider.tsx`** — contexto global: estado do tour ativo (`step`, `running`), método `startTour(envId)`, integração com o ambiente ativo do `App.tsx`.
- **`WelcomeModal.tsx`** — modal inicial com resumo do ambiente (título, permissões-chave, o que pode ver/fazer), botões *Fazer tour*, *Pular*, e checkbox *Não mostrar novamente*.
- **`OnboardingTour.tsx`** — overlay com spotlight (buraco recortado sobre o elemento-alvo via `clip-path`) + tooltip posicionado (top/bottom/left/right), botões *Anterior / Próximo / Concluir / Pular*, indicador `3/8`.
- **`OnboardingLauncher.tsx`** — botão flutuante bottom-right (ícone balão de ajuda), com tooltip "Refazer tour". Escondido enquanto o tour está ativo.
- **`tours/adminTour.ts`, `managerTour.ts`, `clientTour.ts`** — arrays de passos declarativos:
  ```ts
  { targetSelector: '[data-tour="materials-tab"]', title: '...', body: '...', placement: 'bottom' }
  ```

## 3. Conteúdo dos tours

**Ambiente Usuário (`client`)** — 8 passos:
1. Boas-vindas + patente/XP atual (foco no card de perfil/gamificação).
2. Aba **Materiais** — o que é.
3. Filtros (tipo, tag, busca).
4. Card de material → botão *Visualizar*.
5. Seletor de idiomas dentro do card (PT/EN/ES).
6. Aba **Trilhas** — coleções e progresso.
7. Sistema de conquistas / XP / patentes.
8. Onde alterar idioma e sair.

**Ambiente Gestor (`manager`)** — 6 passos:
1. Boas-vindas — acesso somente leitura ampliado.
2. Painel de métricas do gestor.
3. Auditoria (o que aparece / o que é oculto).
4. Permissões visíveis (somente super_admin altera).
5. Alternância entre painel do gestor e ambiente do usuário.
6. Balão de ajuda sempre disponível.

**Ambiente Admin (`super_admin`)** — 10 passos:
1. Boas-vindas.
2. Materiais (CRUD, ativos/inativos).
3. Usuários (toggle de ativação, aprovação, exclusão).
4. Trilhas e coleções.
5. Métricas.
6. Permissões granulares (papel × ambiente).
7. Auditoria.
8. Configurações + tema.
9. Manutenção por ambiente.
10. Balão de ajuda.

## 4. Marcação dos alvos (data-tour)

Adicionar `data-tour="<chave>"` nos elementos reais já existentes (`Dashboard.tsx`, `Admin.tsx`, `MaterialCard.tsx`, cabeçalho, etc.). Nenhuma mudança de lógica ou estilo — apenas atributos.

## 5. Integração

- Montar `OnboardingProvider` dentro de `AppInner` (`src/App.tsx`), após `active` estar definido.
- Quando `active` muda para um ambiente cujo `preferences.onboarding[env].seen !== true` → abre `WelcomeModal` automaticamente.
- `OnboardingLauncher` renderizado sempre que houver `active` (não aparece na tela de seleção de ambiente nem na tela de manutenção).
- Persistência via `supabase.from('profiles').update({ preferences })` + atualização otimista no `AuthContext`.

## 6. Estilo

- Reutiliza tokens do design system (Navy/Gold, glassmorphism, sem cores hardcoded).
- Modal reaproveita padrão dos modais existentes (`ConfirmModal`, `ViewerModal`).
- Overlay do tour: `backdrop` escuro com recorte via `clip-path: polygon(...)` calculado a partir do `getBoundingClientRect()` do alvo; atualiza em `resize`/`scroll`.
- Tooltip: liquid-glass, seta apontando para o alvo.
- Balão flutuante: mesmo padrão visual dos botões de ação (círculo dourado, ícone `HelpCircle`).

## Detalhes técnicos

```text
src/
├── components/onboarding/
│   ├── OnboardingProvider.tsx     (contexto + auto-open)
│   ├── WelcomeModal.tsx           (modal inicial + checkbox)
│   ├── OnboardingTour.tsx         (spotlight + tooltip)
│   ├── OnboardingLauncher.tsx     (balão bottom-right)
│   └── tours/
│       ├── clientTour.ts
│       ├── managerTour.ts
│       └── adminTour.ts
├── App.tsx                        (monta Provider + Launcher)
├── pages/Dashboard.tsx            (+ data-tour attrs)
├── pages/Admin.tsx                (+ data-tour attrs)
└── components/hub/MaterialCard.tsx (+ data-tour attrs)
```

- Sem novas dependências (spotlight/tooltip caseiros — evita bundle de libs como `driver.js` / `intro.js` e mantém o visual coerente).
- Sem alterações de schema (usa `profiles.preferences` existente).
- i18n: strings dos passos passam pelo `LanguageContext` (PT-BR, EN-US, ES-ES).
