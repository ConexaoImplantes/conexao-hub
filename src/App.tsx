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
import { GlobalEffects } from "./components/hub/GlobalEffects";
import { KeyboardHelpModal } from "./components/hub/KeyboardHelpModal";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { RegistrationProgress } from "./components/hub/RegistrationProgress";
import { EnvironmentSelector } from "./pages/EnvironmentSelector";
import {
  EnvironmentId,
  getEligibleEnvironments,
  getStoredEnvironment,
  setStoredEnvironment,
} from "./lib/environments";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

interface EnvContextValue {
  active: EnvironmentId | null;
  eligible: EnvironmentId[];
  switchEnvironment: () => void;
  setActive: (env: EnvironmentId) => void;
}
const EnvContext = React.createContext<EnvContextValue | undefined>(undefined);
export const useEnvironment = () => {
  const ctx = React.useContext(EnvContext);
  if (!ctx) throw new Error("useEnvironment must be used within AppContent");
  return ctx;
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

  const envValue: EnvContextValue = { active, eligible, switchEnvironment, setActive: selectEnv };

  return (
    <EnvContext.Provider value={envValue}>
      <ShortcutProvider>
        <Layout>
          <GlobalEffects />
          <KeyboardHelpModal />
          {active === "admin" || active === "manager" ? <Admin /> : <Dashboard />}
        </Layout>
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
