import { supabase } from './supabaseClient';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'share'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'export'
  | 'other';

export interface AuditLogInput {
  module: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string | number | null;
  entityLabel?: string;
  details?: Record<string, unknown>;
  user: { id: string; name: string; email?: string; role?: string };
}

/**
 * Fire-and-forget audit log write. Never throws — failures are only logged.
 * Skips mock accounts (ids starting with 'mock-').
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    if (!input.user?.id || input.user.id.startsWith('mock-')) return;
    const { error } = await supabase.from('audit_logs').insert({
      user_id: input.user.id,
      user_name: input.user.name,
      user_email: input.user.email ?? null,
      user_role: input.user.role ?? null,
      module: input.module,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId != null ? String(input.entityId) : null,
      entity_label: input.entityLabel ?? null,
      details: input.details ?? {},
    });
    if (error) console.warn('[audit] insert failed:', error.message);
  } catch (e) {
    console.warn('[audit] unexpected error:', e);
  }
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string | null;
  user_role: string | null;
  module: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export async function fetchAuditLogs(opts?: {
  limit?: number;
  module?: string;
  action?: string;
  userId?: string;
  since?: string;
}): Promise<AuditLogRow[]> {
  let q = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 200);
  if (opts?.module) q = q.eq('module', opts.module);
  if (opts?.action) q = q.eq('action', opts.action);
  if (opts?.userId) q = q.eq('user_id', opts.userId);
  if (opts?.since) q = q.gte('created_at', opts.since);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AuditLogRow[];
}
