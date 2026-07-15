import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BrandProvider } from "./contexts/BrandContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PermissionsProvider, usePermissions } from "./contexts/PermissionsContext";
import { useBrand } from "./contexts/BrandContext";
import { ShortcutProvider } from "./contexts/ShortcutContext";
import { Layout } from "./components/hub/Layout";
import { LanguagePersistence } from "./components/LanguagePersistence";
import { GlobalEffects } from "./components/hub/GlobalEffects";
import { KeyboardHelpModal } from "./components/hub/KeyboardHelpModal";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { RegistrationProgress } from "./components/hub/RegistrationProgress";
import { EnvironmentSelector } from "./pages/EnvironmentSelector";
import { OnboardingProvider } from "./components/onboarding/OnboardingProvider";
import { OnboardingLauncher } from "./components/onboarding/OnboardingLauncher";
import {
  EnvironmentId,
  getEligibleEnvironments,
  getStoredEnvironment,
  setStoredEnvironment,
} from "./lib/environments";
import { EnvContext, EnvContextValue, useEnvironment } from "./contexts/EnvironmentContext";

export { useEnvironment };

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const MaintenanceScreen: React.FC<{
  env: EnvironmentId;
  expectedReturn?: string;
  message?: string;
  canSwitch: boolean;
  onSwitch: () => void;
  isSuperAdmin: boolean;
  onBypass: () => void;
}> = ({ env, expectedReturn, message, canSwitch, onSwitch, isSuperAdmin, onBypass }) => {
  const envLabels: Record<EnvironmentId, string> = {
    admin: "Painel Administrativo",
    manager: "Painel do Gestor",
    client: "Ambiente do Usuário",
  };
  const formatted = expectedReturn
    ? new Date(expectedReturn).toLocaleString("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : null;
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}
    >
      <div
        className="max-w-md w-full rounded-2xl p-8 liquid-glass"
        style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto icon-box mb-4" style={{ width: 56, height: 56 }}>
          <span style={{ fontSize: 28 }}>🛠️</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Ambiente em manutenção</h1>
        <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
          O <strong>{envLabels[env]}</strong> está temporariamente indisponível.
        </p>
        {message && (
          <p className="text-sm mb-4" style={{ color: "var(--color-text-main)" }}>
            {message}
          </p>
        )}
        {formatted && (
          <div
            className="rounded-lg px-4 py-3 mb-4 text-sm"
            style={{
              backgroundColor: "var(--color-warning-bg)",
              color: "var(--color-warning)",
            }}
          >
            Retorno previsto: <strong>{formatted}</strong>
          </div>
        )}
        <div className="flex flex-col gap-2 mt-2">
          {canSwitch && (
            <button
              type="button"
              onClick={onSwitch}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: "var(--color-btn-primary-bg)",
                color: "var(--color-btn-primary-text)",
              }}
            >
              Escolher outro ambiente
            </button>
          )}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={onBypass}
              className="px-5 py-2 rounded-lg text-sm font-medium border"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
                backgroundColor: "transparent",
              }}
            >
              Acessar mesmo assim (Super Admin)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


const AppContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { permissions, loading: permsLoading } = usePermissions();
  const { setActiveEnvironment, config } = useBrand();

  const isSuperAdmin = user?.role === "super_admin";
  const maintenance = config.environmentMaintenance ?? {};

  const eligible = React.useMemo(
    () => (user ? getEligibleEnvironments(user.role, permissions) : []),
    [user, permissions]
  );

  const [active, setActive] = React.useState<EnvironmentId | null>(null);
  const [bypassedEnvs, setBypassedEnvs] = React.useState<Set<EnvironmentId>>(new Set());

  // Reset bypass whenever user, active env or maintenance config changes.
  React.useEffect(() => {
    setBypassedEnvs(new Set());
  }, [user?.id, config.environmentMaintenance]);

  // Initialize / reconcile active env when user or eligible list changes
  React.useEffect(() => {
    if (!user || eligible.length === 0) {
      setActive(null);
      return;
    }
    const stored = getStoredEnvironment(user.id);
    if (stored && eligible.includes(stored)) {
      setActive(stored);
    } else if (eligible.length === 1) {
      setActive(eligible[0]);
      setStoredEnvironment(user.id, eligible[0]);
    } else {
      setActive(null); // force selector
    }
  }, [user, eligible]);

  // Sync BrandContext environment tokens
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveEnvironment("auth");
      return;
    }
    if (active === "admin") setActiveEnvironment("admin");
    else if (active === "manager") setActiveEnvironment("manager");
    else if (active === "client") setActiveEnvironment("client");
    else setActiveEnvironment("client");
  }, [isAuthenticated, user, active, setActiveEnvironment]);

  const selectEnv = React.useCallback(
    (env: EnvironmentId) => {
      if (!user) return;
      setStoredEnvironment(user.id, env);
      setActive(env);
    },
    [user]
  );

  const switchEnvironment = React.useCallback(() => {
    if (!user) return;
    setStoredEnvironment(user.id, null);
    setActive(null);
  }, [user]);

  if (isLoading || (isAuthenticated && permsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  if (user.status === "pending" || user.status === "rejected") {
    return <RegistrationProgress />;
  }

  // No environments available (permissions revoked entirely)
  if (eligible.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}
      >
        <h2 className="text-xl font-bold mb-2">Nenhum ambiente disponível</h2>
        <p className="text-sm max-w-md" style={{ color: "var(--color-text-muted)" }}>
          Sua conta não possui permissões atribuídas. Entre em contato com um administrador.
        </p>
      </div>
    );
  }

  // Show selector when no active env chosen and multiple options
  if (!active) {
    return <EnvironmentSelector eligible={eligible} onSelect={selectEnv} />;
  }

  // Maintenance gate — applies to everyone, including Super Admin.
  // Super Admin can bypass with an explicit button for validation/testing.
  const activeMaintenance = active ? maintenance[active] : undefined;
  const isBypassed = active ? bypassedEnvs.has(active) : false;
  if (active && activeMaintenance?.enabled && !isBypassed) {
    return (
      <MaintenanceScreen
        env={active}
        expectedReturn={activeMaintenance.expectedReturn}
        message={activeMaintenance.message}
        canSwitch={eligible.length > 1}
        onSwitch={switchEnvironment}
        isSuperAdmin={!!isSuperAdmin}
        onBypass={() =>
          setBypassedEnvs((prev) => {
            const next = new Set(prev);
            next.add(active);
            return next;
          })
        }
      />
    );
  }

  const envValue: EnvContextValue = { active, eligible, switchEnvironment, setActive: selectEnv };

  return (
    <EnvContext.Provider value={envValue}>
      <ShortcutProvider>
        <OnboardingProvider>
          <Layout>
            <GlobalEffects />
            <KeyboardHelpModal />
            {active === "admin" || active === "manager" ? <Admin /> : <Dashboard />}
            <OnboardingLauncher />
          </Layout>
        </OnboardingProvider>
      </ShortcutProvider>
    </EnvContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <BrandProvider>
            <BrowserRouter>
              <AuthProvider>
                <PermissionsProvider>
                  <Toaster />
                  <Sonner />
                  <LanguagePersistence />
                  <AppContent />
                </PermissionsProvider>
              </AuthProvider>
            </BrowserRouter>
          </BrandProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
