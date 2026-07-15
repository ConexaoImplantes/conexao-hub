import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wrench, Shield, Briefcase, User, Save, AlertTriangle } from "lucide-react";
import { useBrand } from "../../contexts/BrandContext";
import type {
  EnvironmentMaintenance,
  MaintenanceEnvironmentId,
  MaintenanceState,
  SystemConfig,
} from "../../types";
import { logAudit } from "../../lib/audit";

interface EnvMeta {
  id: MaintenanceEnvironmentId;
  label: string;
  description: string;
  Icon: typeof Shield;
}

const ENVS: EnvMeta[] = [
  {
    id: "admin",
    label: "Painel Administrativo",
    description: "Bloqueia acesso ao painel administrativo (Super Admin ignora este bloqueio).",
    Icon: Shield,
  },
  {
    id: "manager",
    label: "Painel do Gestor",
    description: "Bloqueia acesso ao ambiente do gestor.",
    Icon: Briefcase,
  },
  {
    id: "client",
    label: "Ambiente do Usuário",
    description: "Bloqueia a navegação de materiais/trilhas para o usuário final.",
    Icon: User,
  },
];

const emptyState: MaintenanceState = { enabled: false, expectedReturn: "", message: "" };

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export const MaintenancePanel: React.FC = () => {
  const { config, updateConfig } = useBrand();
  const [draft, setDraft] = useState<EnvironmentMaintenance>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(config.environmentMaintenance ?? {});
  }, [config.environmentMaintenance]);

  const getState = (id: MaintenanceEnvironmentId): MaintenanceState =>
    draft[id] ?? emptyState;

  const patch = (id: MaintenanceEnvironmentId, next: Partial<MaintenanceState>) => {
    setDraft((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyState), ...next },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleaned: EnvironmentMaintenance = {};
      (Object.keys(draft) as MaintenanceEnvironmentId[]).forEach((k) => {
        const s = draft[k]!;
        cleaned[k] = {
          enabled: !!s.enabled,
          expectedReturn: s.expectedReturn || undefined,
          message: s.message?.trim() || undefined,
        };
      });
      const nextConfig: SystemConfig = { ...config, environmentMaintenance: cleaned };
      await updateConfig(nextConfig);
      try {
        await logAudit("system_config.maintenance.update", "system_config", "1", {
          environmentMaintenance: cleaned,
        });
      } catch {
        /* noop */
      }
      toast.success("Manutenção atualizada com sucesso.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Falha ao salvar manutenção.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 liquid-glass"
        style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-start gap-4">
          <div className="icon-box">
            <Wrench size={22} style={{ color: "var(--color-accent)" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text-main)" }}>
              Manutenção por Ambiente
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              Exclusivo do Super Admin. Ative para bloquear o ambiente escolhido e informar a data/hora
              prevista de retorno. Super Admins nunca ficam bloqueados.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ENVS.map(({ id, label, description, Icon }) => {
          const state = getState(id);
          return (
            <div
              key={id}
              className="rounded-2xl p-5 liquid-glass"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: state.enabled ? "var(--color-warning)" : "var(--color-border)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box">
                    <Icon size={20} style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--color-text-main)" }}>
                      {label}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={state.enabled}
                  onClick={() => patch(id, { enabled: !state.enabled })}
                  className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
                  style={{
                    backgroundColor: state.enabled ? "var(--color-warning)" : "var(--color-border)",
                  }}
                >
                  <span
                    className="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5"
                    style={{
                      transform: state.enabled ? "translateX(22px)" : "translateX(2px)",
                    }}
                  />
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Retorno previsto
                  <input
                    type="datetime-local"
                    value={toLocalInput(state.expectedReturn)}
                    onChange={(e) => patch(id, { expectedReturn: fromLocalInput(e.target.value) })}
                    disabled={!state.enabled}
                    className="mt-1 w-full rounded-md px-3 py-2 text-sm disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-input-bg)",
                      borderColor: "var(--color-input-border)",
                      borderWidth: 1,
                      color: "var(--color-text-main)",
                    }}
                  />
                </label>
                <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Mensagem opcional
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={state.message ?? ""}
                    onChange={(e) => patch(id, { message: e.target.value })}
                    placeholder="Ex.: Estamos aprimorando este ambiente."
                    disabled={!state.enabled}
                    className="mt-1 w-full rounded-md px-3 py-2 text-sm disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--color-input-bg)",
                      borderColor: "var(--color-input-border)",
                      borderWidth: 1,
                      color: "var(--color-text-main)",
                    }}
                  />
                </label>

                {state.enabled && (
                  <div
                    className="flex items-start gap-2 rounded-md p-2 text-xs"
                    style={{
                      backgroundColor: "var(--color-warning-bg)",
                      color: "var(--color-warning)",
                    }}
                  >
                    <AlertTriangle size={14} className="mt-0.5" />
                    <span>
                      Este ambiente ficará indisponível para todos, exceto Super Admin.
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{
            backgroundColor: "var(--color-btn-primary-bg)",
            color: "var(--color-btn-primary-text)",
          }}
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar configuração"}
        </button>
      </div>
    </div>
  );
};

export default MaintenancePanel;
