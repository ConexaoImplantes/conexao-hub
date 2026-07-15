import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Save, Search, User as UserIcon, RotateCcw, ShieldCheck, Trash2, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { usePermissions, type PermissionCatalogItem, type PermissionEffect } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { logAudit } from '../../lib/audit';
import type { Role } from '../../types';
import { MANAGER_UNLOCK_KEYS, CLIENT_PERMISSION_KEYS, type EnvironmentId } from '../../lib/environments';


type OverrideState = 'inherit' | 'grant' | 'revoke';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const MODULE_LABELS: Record<string, string> = {
  materials: 'Materiais',
  collections: 'Trilhas / Coleções',
  users: 'Usuários & Acessos',
  invites: 'Convites / Credenciais',
  gamification: 'Gamificação',
  settings: 'Configurações',
  analytics: 'Relatórios / Analytics',
  permissions: 'Permissões',
};

export const UserPermissionsPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { loadCatalog, loadUserOverrides, saveUserOverrides, loadMatrix } = usePermissions();

  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [roleMatrix, setRoleMatrix] = useState<Record<Role, Set<string>>>({} as any);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [envFilter, setEnvFilter] = useState<'all' | EnvironmentId>('all');
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [permSearch, setPermSearch] = useState('');
  const [overrides, setOverrides] = useState<Record<string, PermissionEffect>>({});
  const [initialOverrides, setInitialOverrides] = useState<Record<string, PermissionEffect>>({});
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cat, mat, usersRes] = await Promise.all([
          loadCatalog(),
          loadMatrix(),
          supabase
            .from('profiles')
            .select('id, name, email')
            .order('name', { ascending: true }),
        ]);
        if (usersRes.error) throw usersRes.error;

        const { data: roles, error: rolesErr } = await supabase
          .from('user_roles')
          .select('user_id, role');
        if (rolesErr) throw rolesErr;
        const rolesById = new Map<string, Role>();
        (roles ?? []).forEach((r: any) => rolesById.set(r.user_id, r.role));

        const merged: AppUser[] = (usersRes.data ?? []).map((p: any) => ({
          id: p.id,
          name: p.name || p.email,
          email: p.email,
          role: rolesById.get(p.id) ?? ('client' as Role),
        }));
        setUsers(merged);
        setCatalog(cat);

        const grouped: Record<Role, Set<string>> = {} as any;
        mat.forEach((row) => {
          if (!grouped[row.role]) grouped[row.role] = new Set();
          grouped[row.role].add(row.permission_key);
        });
        grouped['super_admin'] = new Set(cat.map((c) => c.key));
        setRoleMatrix(grouped);
      } catch (e: any) {
        toast.error('Erro ao carregar dados: ' + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadCatalog, loadMatrix]);

  const selectUser = async (u: AppUser) => {
    setSelected(u);
    setLoadingUser(true);
    try {
      const rows = await loadUserOverrides(u.id);
      const map: Record<string, PermissionEffect> = {};
      rows.forEach((r) => { map[r.permission_key] = r.effect; });
      setOverrides(map);
      setInitialOverrides({ ...map });
    } catch (e: any) {
      toast.error('Erro ao carregar overrides: ' + e.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const s = userSearch.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }, [users, userSearch]);

  const filteredCatalog = useMemo(() => {
    const s = permSearch.trim().toLowerCase();
    if (!s) return catalog;
    return catalog.filter(
      (p) =>
        p.key.toLowerCase().includes(s) ||
        p.label.toLowerCase().includes(s) ||
        (p.description ?? '').toLowerCase().includes(s) ||
        (MODULE_LABELS[p.module] ?? p.module).toLowerCase().includes(s)
    );
  }, [catalog, permSearch]);

  const groupedByModule = useMemo(() => {
    const map = new Map<string, PermissionCatalogItem[]>();
    filteredCatalog.forEach((p) => {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module)!.push(p);
    });
    return Array.from(map.entries());
  }, [filteredCatalog]);

  const roleHas = (key: string): boolean => {
    if (!selected) return false;
    if (selected.role === 'super_admin') return true;
    return roleMatrix[selected.role]?.has(key) ?? false;
  };

  const effectiveState = (key: string): OverrideState => {
    const o = overrides[key];
    if (o === 'grant') return 'grant';
    if (o === 'revoke') return 'revoke';
    return 'inherit';
  };

  const isEffective = (key: string): boolean => {
    if (!selected) return false;
    if (selected.role === 'super_admin') return true;
    const o = overrides[key];
    if (o === 'grant') return true;
    if (o === 'revoke') return false;
    return roleHas(key);
  };

  const setOverride = (key: string, state: OverrideState) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (state === 'inherit') delete next[key];
      else next[key] = state;
      return next;
    });
  };

  const isDirty = useMemo(() => {
    const a = Object.entries(overrides);
    const b = Object.entries(initialOverrides);
    if (a.length !== b.length) return true;
    const iMap = new Map(b);
    for (const [k, v] of a) if (iMap.get(k) !== v) return true;
    return false;
  }, [overrides, initialOverrides]);

  const grantedCount = Object.values(overrides).filter((v) => v === 'grant').length;
  const revokedCount = Object.values(overrides).filter((v) => v === 'revoke').length;
  const effectiveCount = catalog.filter((c) => isEffective(c.key)).length;

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = Object.entries(overrides).map(([key, effect]) => ({ key, effect }));
      await saveUserOverrides(selected.id, payload);
      setInitialOverrides({ ...overrides });
      toast.success(`Permissões de ${selected.name} salvas.`);
      if (currentUser) {
        logAudit({
          module: 'permissions',
          action: 'update',
          entityType: 'user_overrides',
          entityId: selected.id,
          entityLabel: `Overrides: ${selected.name}`,
          details: { grants: grantedCount, revokes: revokedCount, overrides: payload },
          user: { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role },
        });
      }
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setOverrides({ ...initialOverrides });
    toast.info('Alterações descartadas.');
  };

  const clearAll = async () => {
    if (!selected) return;
    setOverrides({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <div className="icon-box"><UserIcon size={18} /></div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-main)' }}>
            Permissões por usuário
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Escolha um usuário e personalize suas permissões. <strong>Conceder</strong> adiciona uma permissão além do papel; <strong>Revogar</strong> remove uma permissão que o papel concederia. Super Admin sempre tem acesso total.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* User picker */}
        <div
          className="rounded-lg p-3 space-y-2"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Buscar usuário…"
              className="w-full pl-9 pr-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-main)',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>
          <div className="max-h-[520px] overflow-y-auto space-y-1">
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUser(u)}
                className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor: selected?.id === u.id ? 'var(--color-bg)' : 'transparent',
                  color: 'var(--color-text-main)',
                  border: selected?.id === u.id ? '1px solid var(--color-accent)' : '1px solid transparent',
                }}
              >
                <div className="font-medium truncate">{u.name}</div>
                <div className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {u.email} · <span style={{ color: 'var(--color-accent)' }}>{u.role}</span>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center text-xs py-6" style={{ color: 'var(--color-text-muted)' }}>
                Nenhum usuário.
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div
          className="rounded-lg p-4 space-y-3"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {!selected ? (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <ShieldCheck size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Selecione um usuário para editar suas permissões.</p>
            </div>
          ) : loadingUser ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-main)' }}>
                    {selected.name} <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>({selected.email})</span>
                  </div>
                  <div className="text-xs mt-0.5 flex flex-wrap gap-2" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Papel: <strong style={{ color: 'var(--color-accent)' }}>{selected.role}</strong></span>
                    <span>· Efetivas: <strong style={{ color: 'var(--color-text-main)' }}>{effectiveCount}</strong>/{catalog.length}</span>
                    <span>· Concedidas: <strong style={{ color: '#22c55e' }}>{grantedCount}</strong></span>
                    <span>· Revogadas: <strong style={{ color: '#ef4444' }}>{revokedCount}</strong></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearAll}
                    disabled={Object.keys(overrides).length === 0}
                    className="px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 disabled:opacity-40"
                    style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}
                    title="Remover todos overrides deste usuário"
                  >
                    <Trash2 size={12} /> Limpar
                  </button>
                  <button
                    onClick={discard}
                    disabled={!isDirty}
                    className="px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 disabled:opacity-40"
                    style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}
                  >
                    <RotateCcw size={12} /> Descartar
                  </button>
                  <button
                    onClick={save}
                    disabled={!isDirty || saving}
                    className="px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 liquid-glass-gold disabled:opacity-40"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <Save size={12} /> {saving ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Buscar permissão…"
                  className="w-full pl-9 pr-3 py-2 rounded-md text-sm"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th className="p-2" style={{ color: 'var(--color-text-muted)' }}>Permissão</th>
                      <th className="p-2 text-center" style={{ color: 'var(--color-text-muted)', minWidth: 90 }}>Papel</th>
                      <th className="p-2 text-center" style={{ color: 'var(--color-text-muted)', minWidth: 260 }}>Override</th>
                      <th className="p-2 text-center" style={{ color: 'var(--color-text-muted)', minWidth: 90 }}>Efetivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByModule.map(([moduleKey, perms]) => (
                      <React.Fragment key={moduleKey}>
                        <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                          <td colSpan={4} className="p-2 px-3 text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-accent)' }}>
                            {MODULE_LABELS[moduleKey] ?? moduleKey}
                          </td>
                        </tr>
                        {perms.map((p) => {
                          const rh = roleHas(p.key);
                          const st = effectiveState(p.key);
                          const eff = isEffective(p.key);
                          return (
                            <tr key={p.key} style={{ borderTop: '1px solid var(--color-border)' }}>
                              <td className="p-2">
                                <div style={{ color: 'var(--color-text-main)' }}>{p.label}</div>
                                <div className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{p.key}</div>
                              </td>
                              <td className="p-2 text-center">
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{ backgroundColor: rh ? 'var(--color-accent)' : 'var(--color-border)' }}
                                  title={rh ? 'Papel concede' : 'Papel não concede'}
                                />
                              </td>
                              <td className="p-2 text-center">
                                <div className="inline-flex rounded-md overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                                  {(['inherit', 'grant', 'revoke'] as OverrideState[]).map((s) => {
                                    const active = st === s;
                                    const label = s === 'inherit' ? 'Herdar' : s === 'grant' ? 'Conceder' : 'Revogar';
                                    const color = s === 'grant' ? '#22c55e' : s === 'revoke' ? '#ef4444' : 'var(--color-text-muted)';
                                    return (
                                      <button
                                        key={s}
                                        onClick={() => setOverride(p.key, s)}
                                        disabled={selected.role === 'super_admin'}
                                        className="px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-40"
                                        style={{
                                          backgroundColor: active ? 'var(--color-bg)' : 'transparent',
                                          color: active ? color : 'var(--color-text-muted)',
                                          borderLeft: s !== 'inherit' ? '1px solid var(--color-border)' : 'none',
                                        }}
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <span
                                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: eff ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.10)',
                                    color: eff ? '#22c55e' : '#ef4444',
                                  }}
                                >
                                  {eff ? 'Sim' : 'Não'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
