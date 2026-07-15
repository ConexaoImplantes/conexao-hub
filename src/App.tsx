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
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { useBrand } from "./contexts/BrandContext";
import { ShortcutProvider } from "./contexts/ShortcutContext";
import { Layout } from "./components/hub/Layout";
import { GlobalEffects } from "./components/hub/GlobalEffects";
import { KeyboardHelpModal } from "./components/hub/KeyboardHelpModal";
import { AuthPage } from "./pages/AuthPage";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { RegistrationProgress } from "./components/hub/RegistrationProgress";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const AppContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setActiveEnvironment } = useBrand();

  // Set active environment based on user role
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveEnvironment('auth');
      return;
    }
    if (user.role === 'super_admin') setActiveEnvironment('admin');
    else if (user.role === 'manager') setActiveEnvironment('manager');
    else setActiveEnvironment('client');
  }, [isAuthenticated, user, setActiveEnvironment]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  // Show progress screen for pending/rejected users (unless admin)
  if (user.status === 'pending' || user.status === 'rejected') {
    return <RegistrationProgress />;
  }

  const isAdmin = user.role === 'super_admin';
  const isManager = user.role === 'manager';

  return (
    <ShortcutProvider>
      <Layout>
        <GlobalEffects />
        <KeyboardHelpModal />
        {isAdmin ? <Admin /> : isManager ? <ManagerDashboard /> : <Dashboard />}
      </Layout>
    </ShortcutProvider>
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

