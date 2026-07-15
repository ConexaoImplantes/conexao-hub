import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Search, FileClock, Download } from 'lucide-react';
import { fetchAuditLogs, type AuditLogRow } from '../../lib/audit';

const ACTION_LABEL: Record<string, string> = {
  create: 'Criou',
  update: 'Editou',
  delete: 'Excluiu',
  activate: 'Ativou',
  deactivate: 'Desativou',
  share: 'Compartilhou',
  approve: 'Aprovou',
  reject: 'Rejeitou',
  login: 'Entrou',
  logout: 'Saiu',
  export: 'Exportou',
  other: 'Ação',
};

const ACTION_COLOR: Record<string, string> = {
  create: '#10b981',
  update: '#3b82f6',
  delete: '#ef4444',
  activate: '#10b981',
  deactivate: '#f59e0b',
  share: '#8b5cf6',
  approve: '#10b981',
  reject: '#ef4444',
  export: '#8b5cf6',
};

const MODULE_LABEL: Record<string, string> = {
  materials: 'Materiais',
  collections: 'Trilhas',
  users: 'Usuários',
  invites: 'Convites',
  gamification: 'Gamificação',
  settings: 'Configurações',
  permissions: 'Permissões',
  analytics: 'Analytics',
};

export const AuditLogPanel: React.FC = () => {
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs({ limit: 500 });
      setRows(data);
    } catch (e: any) {
      toast.error('Erro ao carregar auditoria: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const modules = useMemo(() => Array.from(new Set(rows.map((r) => r.module))).sort(), [rows]);
  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (moduleFilter !== 'all' && r.module !== moduleFilter) return false;
      if (actionFilter !== 'all' && r.action !== actionFilter) return false;
      if (!s) return true;
      return (
        r.user_name.toLowerCase().includes(s) ||
        (r.user_email ?? '').toLowerCase().includes(s) ||
        (r.entity_label ?? '').toLowerCase().includes(s) ||
        (r.entity_id ?? '').toLowerCase().includes(s)
      );
    });
  }, [rows, search, moduleFilter, actionFilter]);

  const exportCsv = () => {
    const header = ['Data/Hora', 'Usuário', 'Email', 'Papel', 'Módulo', 'Ação', 'Entidade', 'ID'];
    const lines = [header.join(',')];
    filtered.forEach((r) => {
      const cells = [
        new Date(r.created_at).toISOString(),
        r.user_name,
        r.user_email ?? '',
        r.user_role ?? '',
        r.module,
        r.action,
        r.entity_label ?? '',
        r.entity_id ?? '',
      ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
      lines.push(cells.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-box"><FileClock size={18} /></div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-main)' }}>
              Registro de auditoria
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Todas as ações críticas realizadas na plataforma. Imutável.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}
          >
            <RefreshCw size={14} /> Atualizar
          </button>
          <button
            onClick={exportCsv}
            className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 liquid-glass-gold"
            style={{ color: 'var(--color-accent)' }}
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="relative md:col-span-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuário, email ou entidade…"
            className="w-full pl-9 pr-3 py-2 rounded-md text-sm"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 rounded-md text-sm"
          style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
        >
          <option value="all">Todos os módulos</option>
          {modules.map((m) => (
            <option key={m} value={m}>{MODULE_LABEL[m] ?? m}</option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-md text-sm"
          style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
        >
          <option value="all">Todas as ações</option>
          {actions.map((a) => (
            <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="rounded-lg overflow-x-auto" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="p-3" style={{ color: 'var(--color-text-muted)' }}>Data / Hora</th>
                <th className="p-3" style={{ color: 'var(--color-text-muted)' }}>Usuário</th>
                <th className="p-3" style={{ color: 'var(--color-text-muted)' }}>Módulo</th>
                <th className="p-3" style={{ color: 'var(--color-text-muted)' }}>Ação</th>
                <th className="p-3" style={{ color: 'var(--color-text-muted)' }}>Entidade</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td className="p-3 whitespace-nowrap tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(r.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3">
                    <div style={{ color: 'var(--color-text-main)' }}>{r.user_name}</div>
                    {r.user_email && (
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.user_email}</div>
                    )}
                    {r.user_role && (
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.user_role}</div>
                    )}
                  </td>
                  <td className="p-3" style={{ color: 'var(--color-text-main)' }}>
                    {MODULE_LABEL[r.module] ?? r.module}
                  </td>
                  <td className="p-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: (ACTION_COLOR[r.action] ?? '#6b7280') + '22',
                        color: ACTION_COLOR[r.action] ?? '#6b7280',
                      }}
                    >
                      {ACTION_LABEL[r.action] ?? r.action}
                    </span>
                  </td>
                  <td className="p-3">
                    <div style={{ color: 'var(--color-text-main)' }}>{r.entity_label ?? r.entity_type ?? '—'}</div>
                    {r.entity_id && (
                      <div className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{r.entity_id}</div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
