import type { Role } from '../types';

export type EnvironmentId = 'admin' | 'manager' | 'client';

export interface EnvironmentDef {
  id: EnvironmentId;
  label: string;
  description: string;
  /** Icon key resolved in the selector component */
  icon: 'shield' | 'briefcase' | 'user';
}

export const ENVIRONMENTS: Record<EnvironmentId, EnvironmentDef> = {
  admin: {
    id: 'admin',
    label: 'Painel Administrativo',
    description: 'Gestão de materiais, trilhas, usuários, convites e configurações.',
    icon: 'shield',
  },
  manager: {
    id: 'manager',
    label: 'Painel do Gestor',
    description: 'Visão consolidada de usuários, convites e métricas.',
    icon: 'briefcase',
  },
  client: {
    id: 'client',
    label: 'Ambiente do Usuário',
    description: 'Acesso a materiais, trilhas e gamificação.',
    icon: 'user',
  },
};

/**
 * Any permission in these modules unlocks the MANAGER (admin-mirror) environment.
 * Includes both view and write keys — a manager with only invites.view still needs
 * the manager env to reach the Invites panel.
 * NOTE: pure consumer views (materials.view / collections.view / gamification.view)
 * are intentionally excluded — those unlock the client env only.
 */
const MANAGER_UNLOCK_KEYS = new Set<string>([
  // Materials write
  'materials.create', 'materials.edit', 'materials.toggle_active',
  'materials.manage_assets', 'materials.reorder',
  // Collections write
  'collections.create', 'collections.edit', 'collections.toggle_active',
  'collections.manage_items', 'collections.reorder',
  // Users
  'users.view', 'users.create', 'users.edit', 'users.toggle_active',
  'users.change_role', 'users.approve_pending',
  // Invites
  'invites.view', 'invites.create', 'invites.generate_link',
  'invites.toggle_active', 'invites.resend',
  // Gamification write
  'gamification.edit_levels', 'gamification.edit_xp',
  // Settings
  'settings.view', 'settings.edit_branding',
  'settings.edit_theme', 'settings.edit_environment',
  // Analytics / Audit
  'analytics.view_all', 'analytics.export',
  'audit.view',
]);

/**
 * Permission keys that unlock the CLIENT (consumer) environment.
 */
const CLIENT_PERMISSION_KEYS = new Set<string>([
  'materials.view',
  'collections.view',
  'gamification.view',
]);

/**
 * Compute which environments the user may access.
 * - super_admin → ['admin', 'client'] (admin env is exclusive to super_admin; no manager env for them)
 * - other roles → 'manager' if any admin-mirror permission; 'client' if any consumer view
 */
export function getEligibleEnvironments(
  role: Role | undefined,
  permissions: Set<string>
): EnvironmentId[] {
  if (role === 'super_admin' || permissions.has('*')) {
    return ['admin', 'client'];
  }
  const eligible: EnvironmentId[] = [];
  const anyIn = (set: Set<string>) => {
    for (const k of set) if (permissions.has(k)) return true;
    return false;
  };
  if (anyIn(MANAGER_UNLOCK_KEYS)) eligible.push('manager');
  if (anyIn(CLIENT_PERMISSION_KEYS)) eligible.push('client');
  return eligible;
}

const STORAGE_KEY = 'hub.activeEnvironment';

export function getStoredEnvironment(userId: string): EnvironmentId | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}.${userId}`);
    if (raw === 'admin' || raw === 'manager' || raw === 'client') return raw;
    return null;
  } catch {
    return null;
  }
}

export function setStoredEnvironment(userId: string, env: EnvironmentId | null) {
  try {
    if (env) localStorage.setItem(`${STORAGE_KEY}.${userId}`, env);
    else localStorage.removeItem(`${STORAGE_KEY}.${userId}`);
  } catch {
    /* ignore */
  }
}
