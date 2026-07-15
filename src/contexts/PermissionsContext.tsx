import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Role } from '../types';

export type PermissionKey = string;

export interface PermissionCatalogItem {
  key: string;
  module: string;
  label: string;
  description: string | null;
  sort_order: number;
}

interface PermissionsContextType {
  permissions: Set<PermissionKey>;
  loading: boolean;
  has: (key: PermissionKey) => boolean;
  hasAny: (...keys: PermissionKey[]) => boolean;
  hasAll: (...keys: PermissionKey[]) => boolean;
  refresh: () => Promise<void>;
  /** Full catalog (loaded on demand for the Admin permissions matrix) */
  loadCatalog: () => Promise<PermissionCatalogItem[]>;
  /** All role→permission bindings (for the Admin matrix) */
  loadMatrix: () => Promise<Array<{ role: Role; permission_key: string }>>;
  /** Set all permissions for a given role (super_admin cannot be modified) */
  saveRolePermissions: (role: Role, keys: PermissionKey[]) => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Set<PermissionKey>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setPermissions(new Set());
      setLoading(false);
      return;
    }
    // Super admin has everything
    if (user.role === 'super_admin') {
      setPermissions(new Set(['*']));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_key')
        .eq('role', user.role);
      if (error) throw error;
      setPermissions(new Set((data ?? []).map((r: any) => r.permission_key as string)));
    } catch (e) {
      console.error('[PermissionsContext] load failed:', e);
      setPermissions(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const has = useCallback(
    (key: PermissionKey) => permissions.has('*') || permissions.has(key),
    [permissions]
  );
  const hasAny = useCallback(
    (...keys: PermissionKey[]) => permissions.has('*') || keys.some((k) => permissions.has(k)),
    [permissions]
  );
  const hasAll = useCallback(
    (...keys: PermissionKey[]) => permissions.has('*') || keys.every((k) => permissions.has(k)),
    [permissions]
  );

  const loadCatalog = useCallback(async (): Promise<PermissionCatalogItem[]> => {
    const { data, error } = await supabase
      .from('permissions')
      .select('key, module, label, description, sort_order')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []) as PermissionCatalogItem[];
  }, []);

  const loadMatrix = useCallback(async () => {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('role, permission_key');
    if (error) throw error;
    return (data ?? []) as Array<{ role: Role; permission_key: string }>;
  }, []);

  const saveRolePermissions = useCallback(
    async (role: Role, keys: PermissionKey[]) => {
      if (role === 'super_admin') {
        throw new Error('As permissões do Super Admin não podem ser alteradas.');
      }
      // Replace strategy: delete all for role, then insert selected
      const { error: delErr } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role);
      if (delErr) throw delErr;
      if (keys.length > 0) {
        const rows = keys.map((k) => ({ role, permission_key: k }));
        const { error: insErr } = await supabase.from('role_permissions').insert(rows);
        if (insErr) throw insErr;
      }
      // If the current user's role was changed, refresh
      if (user?.role === role) await load();
    },
    [load, user]
  );

  return (
    <PermissionsContext.Provider
      value={{ permissions, loading, has, hasAny, hasAll, refresh: load, loadCatalog, loadMatrix, saveRolePermissions }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider');
  return ctx;
};

/** Boolean hook for a single permission */
export const usePermission = (key: PermissionKey) => {
  const { has } = usePermissions();
  return has(key);
};
