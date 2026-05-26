import React, { useEffect } from 'react';

/**
 * Dark-mode-only enforcer. The platform has NO light theme.
 * Kept as a thin provider so existing imports keep working.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  return <>{children}</>;
};
