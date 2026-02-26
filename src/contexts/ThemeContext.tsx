import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  canToggle: boolean;
  applyThemeMode: (mode: 'single' | 'dual', defaultTheme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [canToggle, setCanToggle] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (!canToggle) return;
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, [canToggle]);

  const applyThemeMode = useCallback((mode: 'single' | 'dual', defaultTheme: 'light' | 'dark') => {
    if (mode === 'single') {
      setCanToggle(false);
      setTheme(defaultTheme);
    } else {
      setCanToggle(true);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, canToggle, applyThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
