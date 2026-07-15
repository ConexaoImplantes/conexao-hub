import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Role } from '../types';

export type PermissionKey = string;
export type PermissionEffect = 'grant' | 'revoke';

export interface PermissionCatalogItem {
  key: string;
  module: string;
  label: string;
  description: string | null;
  sort_order: number;
}

export interface UserOverrideRow {
  user_id: string;
  permission_key: string;
  effect: PermissionEffect;
}

interface PermissionsContextType {
  permissions: Set<PermissionKey>;
  loading: boolean;
  has: (key: PermissionKey) => boolean;
  hasAny: (...keys: PermissionKey[]) => boolean;
  hasAll: (...keys: PermissionKey[]) => boolean;
  refresh: () => Promise<void>;
  loadCatalog: () => Promise<PermissionCatalogItem[]>;
  loadMatrix: () => Promise<Array<{ role: Role; permission_key: string }>>;
  saveRolePermissions: (role: Role, keys: PermissionKey[]) => Promise<void>;
  /** Load user-level overrides (grant/revoke) for a specific user */
  loadUserOverrides: (userId: string) => Promise<UserOverrideRow[]>;
  /** Load a user's effective permission keys (role + overrides) */
  loadEffectivePermissions: (userId: string) => Promise<Set<string>>;
  /** Replace all overrides for a user */
  saveUserOverrides: (userId: string, overrides: Array<{ key: string; effect: PermissionEffect }>) => Promise<void>;
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
    if (user.role === 'super_admin') {
      setPermissions(new Set(['*']));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Effective permissions = role_permissions + user_permissions grants - revokes
      const { data, error } = await supabase.rpc('get_effective_permissions', { _user_id: user.id });
      if (error) throw error;
      const keys = (data ?? []).map((r: any) => (typeof r === 'string' ? r : r.get_effective_permissions ?? r.key));
      setPermissions(new Set(keys.filter(Boolean)));
    } catch (e) {
      console.error('[PermissionsContext] load failed:', e);
      setPermissions(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

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
      const { error: delErr } = await supabase.from('role_permissions').delete().eq('role', role);
      if (delErr) throw delErr;
      if (keys.length > 0) {
        const rows = keys.map((k) => ({ role, permission_key: k }));
        const { error: insErr } = await supabase.from('role_permissions').insert(rows);
        if (insErr) throw insErr;
      }
      if (user?.role === role) await load();
    },
    [load, user]
  );

  const loadUserOverrides = useCallback(async (userId: string): Promise<UserOverrideRow[]> => {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('user_id, permission_key, effect')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []) as UserOverrideRow[];
  }, []);

  const loadEffectivePermissions = useCallback(async (userId: string): Promise<Set<string>> => {
    const { data, error } = await supabase.rpc('get_effective_permissions', { _user_id: userId });
    if (error) throw error;
    const keys = (data ?? []).map((r: any) => (typeof r === 'string' ? r : r.get_effective_permissions ?? r.key));
    return new Set(keys.filter(Boolean));
  }, []);

  const saveUserOverrides = useCallback(
    async (userId: string, overrides: Array<{ key: string; effect: PermissionEffect }>) => {
      const { error: delErr } = await supabase.from('user_permissions').delete().eq('user_id', userId);
      if (delErr) throw delErr;
      if (overrides.length > 0) {
        const rows = overrides.map((o) => ({
          user_id: userId,
          permission_key: o.key,
          effect: o.effect,
        }));
        const { error: insErr } = await supabase.from('user_permissions').insert(rows);
        if (insErr) throw insErr;
      }
      if (user?.id === userId) await load();
    },
    [load, user]
  );

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        loading,
        has,
        hasAny,
        hasAll,
        refresh: load,
        loadCatalog,
        loadMatrix,
        saveRolePermissions,
        loadUserOverrides,
        loadEffectivePermissions,
        saveUserOverrides,
      }}
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

export const usePermission = (key: PermissionKey) => {
  const { has } = usePermissions();
  return has(key);
};
