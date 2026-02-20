import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { supabase } from '../lib/supabaseClient';
import { mockDb } from '../lib/mockDb';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginMock: (role: Role) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isDbMissing: boolean;
  addUserPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbMissing, setIsDbMissing] = useState(false);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
        console.warn("Auth timeout reached - forcing UI unlock");
        setIsLoading(false);
    }, 3000);

    const initAuth = async () => {
        await checkDbConnection();

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            await fetchProfile(session.user.id);
        } else {
            setIsLoading(false);
        }

        clearTimeout(safetyTimeout);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        if (!user || !user.id.startsWith('mock-')) {
            setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkDbConnection = async () => {
    const { error } = await supabase.from('system_config').select('id').limit(1);
    if (error && error.code === '42P01') {
        setIsDbMissing(true);
        setIsLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await mockDb.getProfileById(userId);
      if (profile) {
        setUser(profile);
      } else {
        console.warn("Perfil não encontrado para usuário logado. O trigger pode estar em execução, tentando novamente...");
        // Wait briefly for the trigger to complete profile creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryProfile = await mockDb.getProfileById(userId);
        if (retryProfile) {
          setUser(retryProfile);
        } else {
          console.error("Perfil não encontrado após retry.");
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      if (error.code === '42P01') {
          setIsDbMissing(true);
          setIsLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    mockDb.disableMockMode();
  };

  const loginMock = async (role: Role) => {
      setIsLoading(true);
      mockDb.enableMockMode();

      const mockId = role === 'super_admin' ? 'mock-admin' :
                     role === 'client' ? 'mock-client' :
                     role === 'distributor' ? 'mock-distrib' : 'mock-consult';

      const profile = await mockDb.getProfileById(mockId);
      if (profile) {
          setUser(profile);
      }
      setIsLoading(false);
  };

  const ensureProfile = async (userId: string, data: any) => {
      const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          cro: data.cro || null,
          status: 'pending' as const,
          preferences: { theme: 'light', language: 'pt-br' }
      }, { onConflict: 'id' });

      if (profileError) {
          console.error("Erro ao salvar perfil manual:", profileError);
          if (profileError.code === '42P01') {
              setIsDbMissing(true);
              setIsLoading(false);
              throw new Error("MISSING_DB_SETUP");
          }
      }
  };

  const register = async (data: any) => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || 'temp-password-change-me',
          options: {
            data: {
              name: data.name,
              role: data.role,
              whatsapp: data.whatsapp,
              cro: data.cro
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
            await ensureProfile(authData.user.id, data);
        }

    } catch (error: any) {
        if (error.code === '42P01' || error.message?.includes('Database error')) {
             setIsDbMissing(true);
             setIsLoading(false);
             throw new Error("MISSING_DB_SETUP");
        }
        throw error;
    }

    alert("Cadastro realizado! Verifique seu e-mail para confirmar a conta (se configurado) ou aguarde aprovação.");
  };

  const logout = async () => {
    if (user && user.id.startsWith('mock-')) {
        setUser(null);
        mockDb.disableMockMode();
    } else {
        await supabase.auth.signOut();
        setUser(null);
    }
  };
  const addUserPoints = (points: number) => {
    setUser(prev => prev ? { ...prev, points: (prev.points || 0) + points } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginMock, register, logout, isLoading, isDbMissing, addUserPoints }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
