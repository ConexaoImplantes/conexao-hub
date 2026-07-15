import { EnvironmentId } from '../../../lib/environments';

export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  /** CSS selector of the element to spotlight. Omit for a centered welcome step. */
  targetSelector?: string;
  title: string;
  body: string;
  placement?: Placement;
  /** Optional callback executed when the step is shown (e.g. switch tabs). */
  onEnter?: () => void;
  /**
   * When true, the tour hides the Next button and waits for the user to interact
   * with the highlighted element before advancing to the next step.
   * `advanceEvent` picks which DOM event on the target advances the tour.
   */
  interactive?: boolean;
  advanceEvent?: 'click' | 'change' | 'input';
  /** Optional label overriding the default "Clique para continuar" hint. */
  interactiveHint?: string;
}

export interface EnvironmentTour {
  /** Header title for the welcome modal. */
  welcomeTitle: string;
  /** Short description shown on the welcome modal. */
  welcomeBody: string;
  /** Bullet list summarizing what the user can do/see. */
  highlights: string[];
  /** Interactive steps run after the welcome modal. */
  steps: TourStep[];
}

const clientTour: EnvironmentTour = {
  welcomeTitle: 'Bem-vindo(a) ao Hub Conexão',
  welcomeBody:
    'Aqui você encontra materiais, trilhas de conhecimento e acompanha sua evolução com XP e patentes.',
  highlights: [
    'Explorar materiais em PDF, imagem, vídeo, áudio e página interativa',
    'Alternar entre os idiomas Português, Inglês e Espanhol',
    'Percorrer trilhas de conteúdo e concluir coleções',
    'Ganhar XP a cada material visto e subir de patente',
  ],
  steps: [
    {
      targetSelector: '[data-tour="user-level-card"]',
      title: 'Sua patente e XP',
      body: 'Aqui você acompanha seu nível atual, quanto XP já ganhou e quanto falta para o próximo nível.',
      placement: 'right',
    },
    {
      targetSelector: '[data-tour="view-toggle"]',
      title: 'Materiais e Trilhas',
      body: 'Alterne entre a biblioteca de materiais e as trilhas. Clique em uma das opções para continuar.',
      placement: 'right',
      interactive: true,
      interactiveHint: 'Clique em Materiais ou Trilhas',
    },
    {
      targetSelector: '[data-tour="material-filters"]',
      title: 'Filtros por tipo',
      body: 'Filtre os materiais pelo formato (PDF, imagem, vídeo, áudio, página) e por tags. Clique em um filtro para continuar.',
      placement: 'right',
      interactive: true,
      interactiveHint: 'Clique em qualquer filtro',
    },
    {
      targetSelector: '[data-tour="search-input"]',
      title: 'Busca rápida',
      body: 'Digite aqui para buscar por título. Dica: use Ctrl+F para focar direto na busca.',
      placement: 'bottom',
    },
    {
      targetSelector: '[data-tour="material-card"]',
      title: 'Cards de material',
      body: 'Cada card mostra o tipo, título, tags e XP que você ganha ao visualizá-lo.',
      placement: 'top',
    },
    {
      targetSelector: '[data-tour="material-languages"]',
      title: 'Escolha o idioma',
      body: 'Clique em PT, EN ou ES para abrir o material no idioma desejado. Idiomas indisponíveis aparecem trancados.',
      placement: 'top',
    },
    {
      targetSelector: '[data-tour="language-switcher"]',
      title: 'Idioma da plataforma',
      body: 'Troque o idioma da interface a qualquer momento aqui no cabeçalho.',
      placement: 'bottom',
    },
    {
      targetSelector: '[data-tour="onboarding-launcher"]',
      title: 'Refazer o tour',
      body: 'Sempre que quiser rever esta apresentação, clique neste balão no canto inferior direito.',
      placement: 'left',
    },
  ],
};

const managerTour: EnvironmentTour = {
  welcomeTitle: 'Bem-vindo(a) ao Painel do Gestor',
  welcomeBody:
    'O painel do gestor oferece uma visão ampla de leitura sobre a plataforma. As alterações estruturais continuam com o Super Admin.',
  highlights: [
    'Ver todos os materiais e trilhas cadastrados',
    'Acompanhar métricas e relatórios de uso',
    'Consultar auditoria (quando liberada pelo Super Admin)',
    'Alternar para o ambiente do usuário e ver como ele enxerga a plataforma',
  ],
  steps: [
    {
      targetSelector: '[data-tour="admin-tabs"]',
      title: 'Áreas do painel',
      body: 'Estas abas concentram as áreas visíveis para o gestor: materiais, usuários, trilhas, métricas e permissões liberadas.',
      placement: 'bottom',
    },
    {
      targetSelector: '[data-tour="tab-analytics"]',
      title: 'Métricas',
      body: 'Acompanhe acessos, materiais mais vistos e progresso geral. Clique na aba para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Métricas',
    },
    {
      targetSelector: '[data-tour="tab-audit"]',
      title: 'Auditoria',
      body: 'Histórico das ações realizadas na plataforma. Contas de teste e Super Admin não aparecem. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Auditoria',
    },
    {
      targetSelector: '[data-tour="tab-permissions"]',
      title: 'Permissões',
      body: 'Consulte quais permissões cada papel e usuário possui. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Permissões',
    },
    {
      targetSelector: '[data-tour="env-switch"]',
      title: 'Trocar de ambiente',
      body: 'Alterne entre o painel do gestor e o ambiente do usuário para validar a experiência dele.',
      placement: 'bottom',
    },
    {
      targetSelector: '[data-tour="onboarding-launcher"]',
      title: 'Refazer o tour',
      body: 'Clique aqui a qualquer momento para rever esta apresentação.',
      placement: 'left',
    },
  ],
};

const adminTour: EnvironmentTour = {
  welcomeTitle: 'Bem-vindo(a) ao Painel Administrativo',
  welcomeBody:
    'Aqui você configura toda a plataforma: conteúdo, usuários, permissões, tema, auditoria e manutenção.',
  highlights: [
    'Cadastrar e organizar materiais e trilhas',
    'Aprovar, editar e ativar/desativar usuários',
    'Definir permissões granulares por papel e por usuário',
    'Ativar manutenção em qualquer ambiente com data de retorno',
    'Ajustar tema, cores e identidade visual',
  ],
  steps: [
    {
      targetSelector: '[data-tour="admin-tabs"]',
      title: 'Navegação principal',
      body: 'Todas as áreas administrativas ficam nestas abas: materiais, usuários, trilhas, métricas, permissões, auditoria, manutenção e configurações.',
      placement: 'bottom',
    },
    {
      targetSelector: '[data-tour="tab-materials"]',
      title: 'Materiais',
      body: 'Crie, edite, ative/desative e exclua materiais. Cada material pode ter várias línguas. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Materiais',
    },
    {
      targetSelector: '[data-tour="tab-users"]',
      title: 'Usuários',
      body: 'Aprove novos cadastros, ative/desative contas com um clique e defina permissões individuais. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Usuários',
    },
    {
      targetSelector: '[data-tour="tab-collections"]',
      title: 'Trilhas',
      body: 'Monte coleções de materiais em ordem, com XP próprio. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Trilhas',
    },
    {
      targetSelector: '[data-tour="tab-analytics"]',
      title: 'Métricas',
      body: 'Consumo, acessos, materiais mais vistos. Contas mock e Super Admin não são contabilizadas. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Métricas',
    },
    {
      targetSelector: '[data-tour="tab-permissions"]',
      title: 'Permissões granulares',
      body: 'Configure o que cada papel enxerga e sobreponha por usuário. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Permissões',
    },
    {
      targetSelector: '[data-tour="tab-audit"]',
      title: 'Auditoria',
      body: 'Histórico imutável com filtros por papel, ambiente e ação. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Auditoria',
    },
    {
      targetSelector: '[data-tour="tab-maintenance"]',
      title: 'Manutenção por ambiente',
      body: 'Coloque qualquer ambiente em manutenção com data e hora de retorno. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Manutenção',
    },
    {
      targetSelector: '[data-tour="tab-settings"]',
      title: 'Configurações e tema',
      body: 'Identidade visual, cores por ambiente, textos e integrações. Clique para abrir.',
      placement: 'bottom',
      interactive: true,
      interactiveHint: 'Clique na aba Configurações',
    },
    {
      targetSelector: '[data-tour="onboarding-launcher"]',
      title: 'Refazer o tour',
      body: 'Clique aqui a qualquer momento para rever esta apresentação.',
      placement: 'left',
    },
  ],
};

export const TOURS: Record<EnvironmentId, EnvironmentTour> = {
  client: clientTour,
  manager: managerTour,
  admin: adminTour,
};
