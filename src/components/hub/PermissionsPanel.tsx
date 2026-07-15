import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Save, RotateCcw, Search, ShieldCheck, Lock, Users } from 'lucide-react';
import { usePermissions, type PermissionCatalogItem } from '../../contexts/PermissionsContext';
import type { Role } from '../../types';
import { logAudit } from '../../lib/audit';
import { useAuth } from '../../contexts/AuthContext';
import { UserPermissionsPanel } from './UserPermissionsPanel';

export const PermissionsPanel: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'role' | 'user'>('role');

  // Defensive: only super_admin may configure permissions.
  if (user?.role !== 'super_admin') {
    return (
      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
        <Lock size={20} className="mx-auto mb-2" />
        <p className="text-sm">Somente o Super Admin pode configurar permissões.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setTab('role')}
          className="px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
          style={{
            color: tab === 'role' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderBottom: tab === 'role' ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
        >
          <ShieldCheck size={14} /> Por papel
        </button>
        <button
          onClick={() => setTab('user')}
          className="px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
          style={{
            color: tab === 'user' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderBottom: tab === 'user' ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
        >
          <Users size={14} /> Por usuário
        </button>
      </div>
      {tab === 'role' ? <RolePermissionsPanel /> : <UserPermissionsPanel />}
    </div>
  );
};

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'super_admin', label: 'Super Admin', description: 'Acesso total (não editável)' },
  { value: 'manager', label: 'Manager', description: 'Gerente com acesso amplo' },
  { value: 'consultant', label: 'Consultor', description: 'Consultor de vendas' },
  { value: 'distributor', label: 'Distribuidor', description: 'Distribuidor parceiro' },
  { value: 'client', label: 'Cliente', description: 'Usuário final' },
];

const MODULE_LABELS: Record<string, string> = {
  materials: 'Materiais',
  collections: 'Trilhas / Coleções',
  users: 'Usuários & Acessos',
  invites: 'Convites / Credenciais',
  gamification: 'Gamificação',
  settings: 'Configurações',
  analytics: 'Relatórios / Analytics',
};

const RolePermissionsPanel: React.FC = () => {
  const { user } = useAuth();
  const { loadCatalog, loadMatrix, saveRolePermissions } = usePermissions();
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [matrix, setMatrix] = useState<Record<Role, Set<string>>>({} as any);
  const [initialMatrix, setInitialMatrix] = useState<Record<Role, Set<string>>>({} as any);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Role | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [cat, mat] = await Promise.all([loadCatalog(), loadMatrix()]);
      setCatalog(cat);
      const grouped = ROLES.reduce((acc, r) => {
        acc[r.value] = new Set<string>();
        return acc;
      }, {} as Record<Role, Set<string>>);
      mat.forEach((row) => {
        if (!grouped[row.role]) grouped[row.role] = new Set();
        grouped[row.role].add(row.permission_key);
      });
      // Super admin always has all
      grouped.super_admin = new Set(cat.map((c) => c.key));
      setMatrix(grouped);
      setInitialMatrix(
        Object.fromEntries(
          Object.entries(grouped).map(([r, s]) => [r, new Set(s)])
        ) as Record<Role, Set<string>>
      );
    } catch (e: any) {
      toast.error('Erro ao carregar permissões: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredCatalog = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return catalog;
    return catalog.filter(
      (p) =>
        p.key.toLowerCase().includes(s) ||
        p.label.toLowerCase().includes(s) ||
        (p.description ?? '').toLowerCase().includes(s) ||
        (MODULE_LABELS[p.module] ?? p.module).toLowerCase().includes(s)
    );
  }, [catalog, search]);

  const groupedByModule = useMemo(() => {
    const map = new Map<string, PermissionCatalogItem[]>();
    filteredCatalog.forEach((p) => {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module)!.push(p);
    });
    return Array.from(map.entries());
  }, [filteredCatalog]);

  const toggle = (role: Role, key: string) => {
    if (role === 'super_admin') return;
    setMatrix((prev) => {
      const next = { ...prev };
      const set = new Set(next[role]);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      next[role] = set;
      return next;
    });
  };

  const isDirty = (role: Role) => {
    if (role === 'super_admin') return false;
    const cur = matrix[role] ?? new Set();
    const ini = initialMatrix[role] ?? new Set();
    if (cur.size !== ini.size) return true;
    for (const k of cur) if (!ini.has(k)) return true;
    return false;
  };

  const anyDirty = ROLES.some((r) => isDirty(r.value));

  const saveRole = async (role: Role) => {
    if (role === 'super_admin') return;
    setSaving(role);
    try {
      const keys = Array.from(matrix[role] ?? new Set<string>()) as string[];
      await saveRolePermissions(role, keys);
      setInitialMatrix((prev) => ({ ...prev, [role]: new Set(keys) }));
      toast.success(`Permissões do papel "${role}" salvas.`);
      if (user) {
        logAudit({
          module: 'permissions',
          action: 'update',
          entityType: 'role',
          entityId: role,
          entityLabel: `Permissões: ${role}`,
          details: { count: keys.length, keys },
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
      }
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  const saveAll = async () => {
    for (const r of ROLES) {
      if (isDirty(r.value)) await saveRole(r.value);
    }
  };

  const resetAll = () => {
    setMatrix(
      Object.fromEntries(
        Object.entries(initialMatrix).map(([r, s]) => [r, new Set(s)])
      ) as Record<Role, Set<string>>
    );
    toast.info('Alterações descartadas.');
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-box">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-main)' }}>
              Permissões por papel
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Defina exatamente o que cada papel pode ver e fazer. Super Admin sempre tem tudo.
              A exclusão de registros permanece exclusiva do Super Admin.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetAll}
            disabled={!anyDirty}
            className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-opacity disabled:opacity-40"
            style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}
          >
            <RotateCcw size={14} /> Descartar
          </button>
          <button
            onClick={saveAll}
            disabled={!anyDirty || saving !== null}
            className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 liquid-glass-gold disabled:opacity-40"
            style={{ color: 'var(--color-accent)' }}
          >
            <Save size={14} /> Salvar tudo
          </button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar permissão, módulo ou descrição…"
          className="w-full pl-9 pr-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)',
          }}
        />
      </div>

      <div
        className="rounded-lg overflow-x-auto"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th className="p-3 sticky left-0 z-10" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', minWidth: 260 }}>
                Permissão
              </th>
              {ROLES.map((r) => (
                <th
                  key={r.value}
                  className="p-3 text-center"
                  style={{ color: 'var(--color-text-muted)', minWidth: 110 }}
                  title={r.description}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{r.label}</span>
                    {r.value === 'super_admin' && <Lock size={12} style={{ color: 'var(--color-accent)' }} />}
                    {isDirty(r.value) && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
                      >
                        alterado
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedByModule.map(([moduleKey, perms]) => (
              <React.Fragment key={moduleKey}>
                <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                  <td
                    colSpan={ROLES.length + 1}
                    className="p-2 px-3 text-xs uppercase tracking-wider font-semibold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {MODULE_LABELS[moduleKey] ?? moduleKey}
                  </td>
                </tr>
                {perms.map((p) => (
                  <tr key={p.key} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="p-3 sticky left-0" style={{ backgroundColor: 'var(--color-surface)' }}>
                      <div style={{ color: 'var(--color-text-main)' }}>{p.label}</div>
                      <div className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                        {p.key}
                      </div>
                      {p.description && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    {ROLES.map((r) => {
                      const checked = matrix[r.value]?.has(p.key) ?? false;
                      const locked = r.value === 'super_admin';
                      return (
                        <td key={r.value} className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={locked}
                            onChange={() => toggle(r.value, p.key)}
                            className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                            style={{ accentColor: 'var(--color-accent)' }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {filteredCatalog.length === 0 && (
              <tr>
                <td colSpan={ROLES.length + 1} className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Nenhuma permissão encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {ROLES.filter((r) => r.value !== 'super_admin').map((r) => (
          <button
            key={r.value}
            onClick={() => saveRole(r.value)}
            disabled={!isDirty(r.value) || saving !== null}
            className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
          >
            <Save size={12} />
            {saving === r.value ? 'Salvando…' : `Salvar ${r.label}`}
          </button>
        ))}
      </div>
    </div>
  );
};
