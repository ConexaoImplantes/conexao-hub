import React, { createContext, useContext, useEffect, useState } from 'react';
import { SystemConfig, ColorScheme } from '../types';
import { mockDb } from '../lib/mockDb';
import { DEFAULT_LIGHT, DEFAULT_DARK, DEFAULT_THEME_MODE } from '../lib/themeDefaults';
import { useTheme } from './ThemeContext';
interface BrandContextType {
  config: SystemConfig;
  updateConfig: (newConfig: SystemConfig) => Promise<void>;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const defaults: SystemConfig = {
  appName: 'Hub Conexão',
  themeLight: DEFAULT_LIGHT,
  themeDark: DEFAULT_DARK,
  themeMode: DEFAULT_THEME_MODE,
};

function buildCssVars(scheme: ColorScheme): string {
  return Object.entries({
    '--color-bg': scheme.background,
    '--color-surface': scheme.surface,
    '--color-surface-hover': scheme.surfaceHover,
    '--color-card': scheme.card,
    '--color-text-main': scheme.textMain,
    '--color-text-muted': scheme.textMuted,
    '--color-text-inverted': scheme.textInverted,
    '--color-border': scheme.border,
    '--color-border-subtle': scheme.borderSubtle,
    '--color-accent': scheme.accent,
    '--color-accent-hover': scheme.accentHover,
    '--color-accent-fg': scheme.accentForeground,
    '--color-accent-muted': scheme.accentMuted,
    '--color-success': scheme.success,
    '--color-success-bg': scheme.successBg,
    '--color-warning': scheme.warning,
    '--color-warning-bg': scheme.warningBg,
    '--color-error': scheme.error,
    '--color-error-bg': scheme.errorBg,
    '--color-input-bg': scheme.inputBg,
    '--color-input-border': scheme.inputBorder,
    '--color-input-focus': scheme.inputFocus,
    '--color-btn-primary-bg': scheme.buttonPrimaryBg,
    '--color-btn-primary-text': scheme.buttonPrimaryText,
    '--color-badge-bg': scheme.badgeBg,
    '--color-tooltip-bg': scheme.tooltipBg,
    '--color-tooltip-text': scheme.tooltipText,
    '--color-overlay': scheme.overlay,
    '--color-shadow': scheme.shadow,
    '--color-glass-tint': scheme.glassTint,
    '--color-header-bg': scheme.headerBg,
    '--color-scrollbar-thumb': scheme.scrollbarThumb,
    '--color-scrollbar-track': scheme.scrollbarTrack,
    '--color-ring': scheme.ring,
  }).map(([k, v]) => `${k}: ${v};`).join('\n        ');
}

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { applyThemeMode } = useTheme();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockDb.getSystemConfig()
      .then(data => setConfig(data))
      .catch(err => {
        console.error("BrandContext Init Error:", err);
        setConfig(defaults);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!config) return;

    let styleTag = document.getElementById('theme-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-styles';
      document.head.appendChild(styleTag);
    }

    const css = `
      :root {
        ${buildCssVars(config.themeLight)}
      }
      .dark {
        ${buildCssVars(config.themeDark)}
      }
    `;

    styleTag.innerHTML = css;
    document.title = config.appName;

    // Apply theme mode
    if (config.themeMode) {
      applyThemeMode(config.themeMode.mode, config.themeMode.defaultTheme);
    }
  }, [config, applyThemeMode]);

  const updateConfig = async (newConfig: SystemConfig) => {
    try {
      await mockDb.updateSystemConfig(newConfig);
      setConfig(newConfig);
    } catch (e) {
      console.error("Failed to update config", e);
      throw e;
    }
  };

  return (
    <BrandContext.Provider value={{ config: config || defaults, updateConfig, isLoading }}>
      {!isLoading && config ? children : (
        <div className="h-screen w-full flex flex-col gap-4 items-center justify-center bg-gray-50 text-gray-500 font-medium animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
          <span>Carregando Sistema...</span>
        </div>
      )}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within a BrandProvider');
  return context;
};
