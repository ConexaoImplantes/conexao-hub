import { EnvironmentId } from '../../../lib/environments';
import { Language } from '../../../types';

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
  /** Optional label overriding the default hint. */
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

type TourMap = Record<EnvironmentId, EnvironmentTour>;

// ---------- PT-BR ----------
const clientPt: EnvironmentTour = {
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
    { targetSelector: '[data-tour="user-level-card"]', title: 'Seu progresso', body: 'Este cartão mostra o seu nível atual, quantos pontos de experiência (XP) você já acumulou e quanto falta para subir de nível. Você ganha XP cada vez que abre um material.', placement: 'right' },
    { targetSelector: '[data-tour="view-toggle"]', title: 'Materiais e Trilhas', body: 'Use estes dois botões para escolher o que ver. "Materiais" mostra todos os conteúdos avulsos. "Trilhas" mostra sequências de materiais organizadas em ordem, para você estudar do começo ao fim. Pode clicar à vontade — o tour continua normalmente.', placement: 'right' },
    { targetSelector: '[data-tour="material-filters"]', title: 'Filtrar por formato', body: 'Aqui você mostra apenas um tipo de conteúdo: PDF, imagem, vídeo, áudio ou página interativa. O número ao lado indica quantos itens existem em cada formato. Clique em "Todos" para voltar a ver tudo.', placement: 'right' },
    { targetSelector: '[data-tour="search-input"]', title: 'Buscar pelo título', body: 'Digite uma palavra do título para encontrar um material rapidamente. Atalho: aperte Ctrl+F em qualquer momento para ir direto para este campo.', placement: 'bottom' },
    { targetSelector: '[data-tour="material-card"]', title: 'Os cartões de material', body: 'Cada cartão é um conteúdo. Ele mostra o formato, o título, as etiquetas e quantos XP você ganha ao abri-lo. Clique no cartão para visualizar e, quando permitido, baixar o arquivo.', placement: 'top' },
    { targetSelector: '[data-tour="collection-card"]', title: 'As trilhas', body: 'Cada trilha reúne vários materiais em ordem. Ao abrir uma trilha você vê a lista de etapas, seu progresso e o XP extra ao concluir tudo.', placement: 'top' },
    { targetSelector: '[data-tour="language-switcher"]', title: 'Idioma', body: 'Troque o idioma da plataforma aqui. A lista de materiais também muda: você vê apenas os conteúdos disponíveis no idioma escolhido.', placement: 'bottom' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Rever este tour', body: 'Pronto! Sempre que quiser rever esta apresentação, clique neste botão no canto inferior direito da tela.', placement: 'left' },
  ],
};

const managerPt: EnvironmentTour = {
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
    { targetSelector: '[data-tour="admin-tabs"]', title: 'Áreas do painel', body: 'Toda a navegação do painel fica nestas abas. Você vê apenas as áreas liberadas para o seu perfil: materiais, usuários, trilhas, métricas e, quando o Super Admin permitir, permissões e auditoria.', placement: 'bottom' },
    { targetSelector: '[data-tour="tab-analytics"]', title: 'Métricas', body: 'Mostra quantos acessos a plataforma recebeu, quais materiais são mais vistos e como está o progresso dos usuários. Contas de teste não entram na conta. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Métricas' },
    { targetSelector: '[data-tour="tab-audit"]', title: 'Auditoria', body: 'Registro de tudo o que foi feito na plataforma: quem fez, o que fez e quando. Serve para conferência e segurança. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Auditoria' },
    { targetSelector: '[data-tour="tab-permissions"]', title: 'Permissões', body: 'Lista o que cada papel (cliente, distribuidor, consultor, gestor) pode fazer, e também as permissões definidas usuário por usuário. Use os filtros por papel e por ambiente. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Permissões' },
    { targetSelector: '[data-tour="env-switch"]', title: 'Trocar de ambiente', body: 'Este seletor troca de ambiente sem precisar sair da conta. Escolha "Ambiente do Usuário" para ver a plataforma exatamente como o cliente vê.', placement: 'bottom' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Refazer o tour', body: 'Clique aqui a qualquer momento para rever esta apresentação.', placement: 'left' },
  ],
};

const adminPt: EnvironmentTour = {
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
    { targetSelector: '[data-tour="admin-tabs"]', title: 'Navegação principal', body: 'Esta barra é o menu do painel. Cada aba abre uma área diferente: materiais, usuários, trilhas, métricas, permissões, auditoria, manutenção e configurações.', placement: 'bottom' },
    { targetSelector: '[data-tour="tab-materials"]', title: 'Materiais', body: 'Aqui você cadastra os conteúdos (PDF, imagem, vídeo, áudio e material interativo), define quem pode ver, o XP de cada um e envia a versão em cada idioma. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Materiais' },
    { targetSelector: '[data-tour="tab-users"]', title: 'Usuários', body: 'Lista todas as contas. Você aprova quem acabou de se cadastrar, ativa ou desativa uma conta com um clique, edita os dados e ajusta permissões individuais. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Usuários' },
    { targetSelector: '[data-tour="tab-collections"]', title: 'Trilhas', body: 'Trilhas são sequências de materiais em ordem, com XP extra ao concluir. Aqui você cria a trilha, escolhe os materiais e define a ordem das etapas. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Trilhas' },
    { targetSelector: '[data-tour="tab-analytics"]', title: 'Métricas', body: 'Painel de números: acessos, materiais mais vistos e evolução dos usuários. Contas de teste e Super Admin nunca são contabilizadas. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Métricas' },
    { targetSelector: '[data-tour="tab-permissions"]', title: 'Permissões granulares', body: 'Define o que cada papel pode fazer e permite exceções para um usuário específico. Há filtros por papel e por ambiente para achar rapidamente o que procura. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Permissões' },
    { targetSelector: '[data-tour="tab-audit"]', title: 'Auditoria', body: 'Registro permanente de todas as ações feitas na plataforma, com filtros por papel, ambiente e tipo de ação. Nada aqui pode ser apagado. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Auditoria' },
    { targetSelector: '[data-tour="tab-maintenance"]', title: 'Manutenção por ambiente', body: 'Permite pausar um ambiente. Enquanto a manutenção estiver ligada, quem entra vê um aviso com a data e hora previstas de retorno, em vez da tela normal. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Manutenção' },
    { targetSelector: '[data-tour="tab-settings"]', title: 'Configurações e tema', body: 'Ajusta o nome da plataforma, o logo, as cores de cada ambiente e demais preferências visuais. Clique na aba para abrir (ou use "Avançar").', placement: 'bottom', interactive: true, interactiveHint: 'Clique na aba Configurações' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Refazer o tour', body: 'Clique aqui a qualquer momento para rever esta apresentação.', placement: 'left' },
  ],
};

// ---------- EN-US ----------
const clientEn: EnvironmentTour = {
  welcomeTitle: 'Welcome to Hub Conexão',
  welcomeBody:
    'Here you will find materials, learning trails and track your progress with XP and ranks.',
  highlights: [
    'Explore materials in PDF, image, video, audio and interactive page',
    'Switch between Portuguese, English and Spanish',
    'Follow content trails and complete collections',
    'Earn XP for every material viewed and rank up',
  ],
  steps: [
    { targetSelector: '[data-tour="user-level-card"]', title: 'Your progress', body: 'This card shows your current level, how many experience points (XP) you have earned and how much is missing to level up. You earn XP every time you open a material.', placement: 'right' },
    { targetSelector: '[data-tour="view-toggle"]', title: 'Materials and Trails', body: 'These two buttons switch what you see. "Materials" lists every single piece of content. "Trails" lists ordered sequences of materials, so you can study from start to finish. Feel free to click — the tour keeps going.', placement: 'right' },
    { targetSelector: '[data-tour="material-filters"]', title: 'Filter by format', body: 'Show only one type of content: PDF, image, video, audio or interactive page. The number next to each option tells how many items exist in that format. Click "All" to see everything again.', placement: 'right' },
    { targetSelector: '[data-tour="search-input"]', title: 'Search by title', body: 'Type a word from the title to find a material quickly. Shortcut: press Ctrl+F anytime to jump straight to this field.', placement: 'bottom' },
    { targetSelector: '[data-tour="material-card"]', title: 'Material cards', body: 'Each card is one piece of content. It shows the format, title, tags and how much XP you earn by opening it. Click the card to view and, when allowed, download the file.', placement: 'top' },
    { targetSelector: '[data-tour="collection-card"]', title: 'Trails', body: 'Each trail groups several materials in order. Opening a trail shows the list of steps, your progress and the extra XP for completing it.', placement: 'top' },
    { targetSelector: '[data-tour="language-switcher"]', title: 'Language', body: 'Change the platform language here. The material list changes too: you only see content available in the chosen language.', placement: 'bottom' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Replay this tour', body: 'That is it! Whenever you want to see this presentation again, click this button in the bottom-right corner.', placement: 'left' },
  ],
};

const managerEn: EnvironmentTour = {
  welcomeTitle: 'Welcome to the Manager Panel',
  welcomeBody:
    'The manager panel gives you a broad read-only view of the platform. Structural changes remain with the Super Admin.',
  highlights: [
    'See all registered materials and trails',
    'Follow usage metrics and reports',
    'Consult the audit log (when enabled by the Super Admin)',
    'Switch to the user environment to see it through their eyes',
  ],
  steps: [
    { targetSelector: '[data-tour="admin-tabs"]', title: 'Panel areas', body: 'All panel navigation lives in these tabs. You only see the areas released for your profile: materials, users, trails, metrics and, when the Super Admin allows, permissions and audit.', placement: 'bottom' },
    { targetSelector: '[data-tour="tab-analytics"]', title: 'Metrics', body: 'Shows how many accesses the platform received, which materials are most viewed and how users are progressing. Test accounts are not counted. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Metrics tab' },
    { targetSelector: '[data-tour="tab-audit"]', title: 'Audit log', body: 'A record of everything done on the platform: who did it, what they did and when. Useful for review and security. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Audit tab' },
    { targetSelector: '[data-tour="tab-permissions"]', title: 'Permissions', body: 'Lists what each role (client, distributor, consultant, manager) can do, plus permissions defined user by user. Use the role and environment filters. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Permissions tab' },
    { targetSelector: '[data-tour="env-switch"]', title: 'Switch environment', body: 'This selector switches environments without signing out. Pick "User Environment" to see the platform exactly as the client sees it.', placement: 'bottom' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Replay the tour', body: 'Click here anytime to see this presentation again.', placement: 'left' },
  ],
};

const adminEn: EnvironmentTour = {
  welcomeTitle: 'Welcome to the Admin Panel',
  welcomeBody:
    'This is where you configure the whole platform: content, users, permissions, theme, audit and maintenance.',
  highlights: [
    'Create and organize materials and trails',
    'Approve, edit and activate/deactivate users',
    'Set granular permissions per role and per user',
    'Enable maintenance on any environment with an expected return',
    'Adjust theme, colors and visual identity',
  ],
  steps: [
    { targetSelector: '[data-tour="admin-tabs"]', title: 'Main navigation', body: 'This bar is the panel menu. Each tab opens a different area: materials, users, trails, metrics, permissions, audit, maintenance and settings.', placement: 'bottom' },
    { targetSelector: '[data-tour="tab-materials"]', title: 'Materials', body: 'This is where you register content (PDF, image, video, audio and interactive material), choose who can see it, set its XP and upload a version per language. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Materials tab' },
    { targetSelector: '[data-tour="tab-users"]', title: 'Users', body: 'Lists every account. Approve new sign-ups, activate or deactivate an account in one click, edit details and adjust individual permissions. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Users tab' },
    { targetSelector: '[data-tour="tab-collections"]', title: 'Trails', body: 'Trails are ordered sequences of materials with extra XP on completion. Here you create the trail, pick the materials and set the order of the steps. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Trails tab' },
    { targetSelector: '[data-tour="tab-analytics"]', title: 'Metrics', body: 'The numbers panel: accesses, most-viewed materials and user progress. Test accounts and Super Admin are never counted. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Metrics tab' },
    { targetSelector: '[data-tour="tab-permissions"]', title: 'Granular permissions', body: 'Defines what each role can do and allows exceptions for a specific user. Role and environment filters help you find things fast. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Permissions tab' },
    { targetSelector: '[data-tour="tab-audit"]', title: 'Audit log', body: 'A permanent record of every action on the platform, with filters by role, environment and action type. Nothing here can be deleted. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Audit tab' },
    { targetSelector: '[data-tour="tab-maintenance"]', title: 'Environment maintenance', body: 'Lets you pause an environment. While maintenance is on, anyone entering sees a notice with the expected return date and time instead of the normal screen. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Maintenance tab' },
    { targetSelector: '[data-tour="tab-settings"]', title: 'Settings and theme', body: 'Adjusts the platform name, logo, the colors of each environment and other visual preferences. Click the tab to open (or use "Skip step").', placement: 'bottom', interactive: true, interactiveHint: 'Click the Settings tab' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Replay the tour', body: 'Click here anytime to see this presentation again.', placement: 'left' },
  ],
};

// ---------- ES-ES ----------
const clientEs: EnvironmentTour = {
  welcomeTitle: 'Bienvenido(a) al Hub Conexão',
  welcomeBody:
    'Aquí encuentras materiales, rutas de aprendizaje y sigues tu progreso con XP y rangos.',
  highlights: [
    'Explorar materiales en PDF, imagen, video, audio y página interactiva',
    'Cambiar entre Portugués, Inglés y Español',
    'Recorrer rutas de contenido y completar colecciones',
    'Ganar XP con cada material visto y subir de rango',
  ],
  steps: [
    { targetSelector: '[data-tour="user-level-card"]', title: 'Tu progreso', body: 'Esta tarjeta muestra tu nivel actual, cuántos puntos de experiencia (XP) llevas y cuánto falta para subir de nivel. Ganas XP cada vez que abres un material.', placement: 'right' },
    { targetSelector: '[data-tour="view-toggle"]', title: 'Materiales y Rutas', body: 'Estos dos botones cambian lo que ves. "Materiales" muestra todos los contenidos sueltos. "Rutas" muestra secuencias ordenadas de materiales para estudiar de principio a fin. Puedes hacer clic sin problema: el tour continúa.', placement: 'right' },
    { targetSelector: '[data-tour="material-filters"]', title: 'Filtrar por formato', body: 'Muestra solo un tipo de contenido: PDF, imagen, video, audio o página interactiva. El número al lado indica cuántos elementos hay en cada formato. Haz clic en "Todos" para volver a verlo todo.', placement: 'right' },
    { targetSelector: '[data-tour="search-input"]', title: 'Buscar por título', body: 'Escribe una palabra del título para encontrar un material rápidamente. Atajo: pulsa Ctrl+F en cualquier momento para ir directo a este campo.', placement: 'bottom' },
    { targetSelector: '[data-tour="material-card"]', title: 'Las tarjetas de material', body: 'Cada tarjeta es un contenido. Muestra el formato, el título, las etiquetas y cuántos XP ganas al abrirlo. Haz clic en la tarjeta para verlo y, cuando esté permitido, descargarlo.', placement: 'top' },
    { targetSelector: '[data-tour="collection-card"]', title: 'Las rutas', body: 'Cada ruta reúne varios materiales en orden. Al abrir una ruta ves la lista de etapas, tu progreso y el XP extra al completarla.', placement: 'top' },
    { targetSelector: '[data-tour="language-switcher"]', title: 'Idioma', body: 'Cambia el idioma de la plataforma aquí. La lista de materiales también cambia: solo ves el contenido disponible en el idioma elegido.', placement: 'bottom' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Repetir el tour', body: '¡Listo! Cuando quieras volver a ver esta presentación, haz clic en este botón en la esquina inferior derecha.', placement: 'left' },
  ],
};

const managerEs: EnvironmentTour = {
  welcomeTitle: 'Bienvenido(a) al Panel del Gestor',
  welcomeBody:
    'El panel del gestor ofrece una visión amplia de solo lectura sobre la plataforma. Los cambios estructurales quedan a cargo del Super Admin.',
  highlights: [
    'Ver todos los materiales y rutas registrados',
    'Seguir métricas e informes de uso',
    'Consultar la auditoría (cuando el Super Admin lo permita)',
    'Cambiar al entorno del usuario y ver cómo lo percibe',
  ],
  steps: [
    { targetSelector: '[data-tour="admin-tabs"]', title: 'Áreas del panel', body: 'Toda la navegación del panel está en estas pestañas. Solo ves las áreas habilitadas para tu perfil: materiales, usuarios, rutas, métricas y, cuando el Super Admin lo permita, permisos y auditoría.', placement: 'bottom' },
    { targetSelector: '[data-tour="tab-analytics"]', title: 'Métricas', body: 'Muestra cuántos accesos recibió la plataforma, qué materiales se ven más y cómo avanzan los usuarios. Las cuentas de prueba no se cuentan. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Métricas' },
    { targetSelector: '[data-tour="tab-audit"]', title: 'Auditoría', body: 'Registro de todo lo que se hizo en la plataforma: quién, qué y cuándo. Sirve para revisión y seguridad. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Auditoría' },
    { targetSelector: '[data-tour="tab-permissions"]', title: 'Permisos', body: 'Lista lo que puede hacer cada rol (cliente, distribuidor, consultor, gestor) y los permisos definidos usuario por usuario. Usa los filtros por rol y entorno. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Permisos' },
    { targetSelector: '[data-tour="env-switch"]', title: 'Cambiar de entorno', body: 'Este selector cambia de entorno sin cerrar sesión. Elige "Entorno del Usuario" para ver la plataforma tal como la ve el cliente.', placement: 'bottom' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Repetir el tour', body: 'Haz clic aquí en cualquier momento para volver a ver esta presentación.', placement: 'left' },
  ],
};

const adminEs: EnvironmentTour = {
  welcomeTitle: 'Bienvenido(a) al Panel Administrativo',
  welcomeBody:
    'Aquí configuras toda la plataforma: contenido, usuarios, permisos, tema, auditoría y mantenimiento.',
  highlights: [
    'Registrar y organizar materiales y rutas',
    'Aprobar, editar y activar/desactivar usuarios',
    'Definir permisos granulares por rol y por usuario',
    'Activar mantenimiento en cualquier entorno con fecha de retorno',
    'Ajustar tema, colores e identidad visual',
  ],
  steps: [
    { targetSelector: '[data-tour="admin-tabs"]', title: 'Navegación principal', body: 'Esta barra es el menú del panel. Cada pestaña abre un área distinta: materiales, usuarios, rutas, métricas, permisos, auditoría, mantenimiento y configuración.', placement: 'bottom' },
    { targetSelector: '[data-tour="tab-materials"]', title: 'Materiales', body: 'Aquí registras los contenidos (PDF, imagen, video, audio y material interactivo), defines quién puede verlos, su XP y subes la versión de cada idioma. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Materiales' },
    { targetSelector: '[data-tour="tab-users"]', title: 'Usuarios', body: 'Lista todas las cuentas. Aprueba nuevos registros, activa o desactiva una cuenta con un clic, edita los datos y ajusta permisos individuales. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Usuarios' },
    { targetSelector: '[data-tour="tab-collections"]', title: 'Rutas', body: 'Las rutas son secuencias ordenadas de materiales con XP extra al completarlas. Aquí creas la ruta, eliges los materiales y defines el orden. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Rutas' },
    { targetSelector: '[data-tour="tab-analytics"]', title: 'Métricas', body: 'Panel de números: accesos, materiales más vistos y avance de los usuarios. Las cuentas de prueba y el Super Admin nunca se cuentan. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Métricas' },
    { targetSelector: '[data-tour="tab-permissions"]', title: 'Permisos granulares', body: 'Define lo que puede hacer cada rol y permite excepciones para un usuario concreto. Hay filtros por rol y por entorno. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Permisos' },
    { targetSelector: '[data-tour="tab-audit"]', title: 'Auditoría', body: 'Registro permanente de todas las acciones de la plataforma, con filtros por rol, entorno y tipo de acción. Nada se puede borrar. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Auditoría' },
    { targetSelector: '[data-tour="tab-maintenance"]', title: 'Mantenimiento por entorno', body: 'Permite pausar un entorno. Mientras el mantenimiento esté activo, quien entra ve un aviso con la fecha y hora previstas de regreso. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Mantenimiento' },
    { targetSelector: '[data-tour="tab-settings"]', title: 'Configuración y tema', body: 'Ajusta el nombre de la plataforma, el logo, los colores de cada entorno y otras preferencias visuales. Haz clic en la pestaña (o usa "Avanzar").', placement: 'bottom', interactive: true, interactiveHint: 'Haz clic en la pestaña Configuración' },
    { targetSelector: '[data-tour="onboarding-launcher"]', title: 'Repetir el tour', body: 'Haz clic aquí en cualquier momento para volver a ver esta presentación.', placement: 'left' },
  ],
};

const TOURS_BY_LANG: Record<Language, TourMap> = {
  'pt-br': { client: clientPt, manager: managerPt, admin: adminPt },
  'en-us': { client: clientEn, manager: managerEn, admin: adminEn },
  'es-es': { client: clientEs, manager: managerEs, admin: adminEs },
};

export const getTour = (env: EnvironmentId, lang: Language): EnvironmentTour =>
  TOURS_BY_LANG[lang]?.[env] ?? TOURS_BY_LANG['pt-br'][env];

/** Back-compat: default PT-BR map for any callers that don't have a language. */
export const TOURS: TourMap = TOURS_BY_LANG['pt-br'];

// ---------- UI strings for the onboarding chrome ----------
export interface OnboardingUIStrings {
  badge: Record<EnvironmentId, string>;
  roleBadge: {
    client: string;
    distributor: string;
    consultant: string;
  };
  dontShowAgain: string;
  notNow: string;
  startTour: string;
  close: string;
  closeTour: string;
  skip: string;
  previous: string;
  next: string;
  finish: string;
  stepOf: (current: number, total: number) => string;
  clickToContinue: string;
  skipStep: string;
  launcherTooltip: string;
}

const ui: Record<Language, OnboardingUIStrings> = {
  'pt-br': {
    badge: { admin: 'Painel Administrativo', manager: 'Ambiente do Gestor', client: 'Ambiente do Usuário' },
    roleBadge: { client: 'Ambiente do Cliente', distributor: 'Ambiente do Distribuidor', consultant: 'Ambiente do Consultor' },
    dontShowAgain: 'Não mostrar novamente',
    notNow: 'Agora não',
    startTour: 'Fazer o tour',
    close: 'Fechar',
    closeTour: 'Fechar tour',
    skip: 'Pular',
    previous: 'Anterior',
    next: 'Próximo',
    finish: 'Concluir',
    stepOf: (c, t) => `Passo ${c} de ${t}`,
    clickToContinue: 'Clique para continuar',
    skipStep: 'Avançar',
    launcherTooltip: 'Refazer o tour',
  },
  'en-us': {
    badge: { admin: 'Admin Panel', manager: 'Manager Panel', client: 'User Environment' },
    roleBadge: { client: 'Client Area', distributor: 'Distributor Area', consultant: 'Consultant Area' },
    dontShowAgain: 'Don\'t show again',
    notNow: 'Not now',
    startTour: 'Take the tour',
    close: 'Close',
    closeTour: 'Close tour',
    skip: 'Skip',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    stepOf: (c, t) => `Step ${c} of ${t}`,
    clickToContinue: 'Click to continue',
    skipStep: 'Skip step',
    launcherTooltip: 'Replay the tour',
  },
  'es-es': {
    badge: { admin: 'Panel Administrativo', manager: 'Panel del Gestor', client: 'Entorno del Usuario' },
    roleBadge: { client: 'Área del Cliente', distributor: 'Área del Distribuidor', consultant: 'Área del Consultor' },
    dontShowAgain: 'No mostrar de nuevo',
    notNow: 'Ahora no',
    startTour: 'Hacer el tour',
    close: 'Cerrar',
    closeTour: 'Cerrar tour',
    skip: 'Saltar',
    previous: 'Anterior',
    next: 'Siguiente',
    finish: 'Finalizar',
    stepOf: (c, t) => `Paso ${c} de ${t}`,
    clickToContinue: 'Haz clic para continuar',
    skipStep: 'Avanzar',
    launcherTooltip: 'Repetir el tour',
  },
};

export const getOnboardingUI = (lang: Language): OnboardingUIStrings => ui[lang] ?? ui['pt-br'];
