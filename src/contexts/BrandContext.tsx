import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SystemConfig, ColorScheme, EnvironmentKey, EnvironmentEffects } from '../types';
import { mockDb } from '../lib/mockDb';
import { DEFAULT_DARK, DEFAULT_THEME_MODE, DEFAULT_ENVIRONMENT_THEMES } from '../lib/themeDefaults';

interface BrandContextType {
  config: SystemConfig;
  updateConfig: (newConfig: SystemConfig) => Promise<void>;
  isLoading: boolean;
  activeEnvironment: EnvironmentKey;
  setActiveEnvironment: (env: EnvironmentKey) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const defaults: SystemConfig = {
  appName: 'Hub Conexão',
  themeDark: DEFAULT_DARK,
  themeMode: DEFAULT_THEME_MODE,
  environmentThemes: DEFAULT_ENVIRONMENT_THEMES,
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
    '--color-gradient-start': scheme.gradientStart,
    '--color-gradient-mid': scheme.gradientMid,
    '--color-gradient-end': scheme.gradientEnd,
    '--color-hover-bg': scheme.hoverBg,
    '--color-hover-border': scheme.hoverBorder,
    '--color-hover-scale': scheme.hoverScale,
    '--color-hover-shadow': scheme.hoverShadow,
  }).map(([k, v]) => `${k}: ${v};`).join('\n        ');
}

function buildEnvCssVars(effects: EnvironmentEffects): string {
  return Object.entries({
    '--env-page-bg': effects.pageBg,
    '--env-blob1-color': effects.blob1Color,
    '--env-blob2-color': effects.blob2Color,
    '--env-blob3-color': effects.blob3Color,
    '--env-blob-opacity': effects.blobOpacity,
    '--env-blob-size': effects.blobSize + 'rem',
    '--env-blob-blur': effects.blobBlur + 'px',
    '--env-grain-opacity': effects.grainOpacity,
    '--env-grain-blend': effects.grainBlendMode,
    '--env-grain-contrast': effects.grainContrast,
    '--env-glass-opacity': effects.glassOpacity,
    '--env-glass-blur': effects.glassBlur + 'px',
    '--env-glass-border-opacity': effects.glassBorderOpacity,
  }).map(([k, v]) => `${k}: ${v};`).join('\n        ');
}

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentKey>('global');

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

    const envThemes = config.environmentThemes || DEFAULT_ENVIRONMENT_THEMES;
    const activeEffects = envThemes[activeEnvironment] || envThemes.global || DEFAULT_ENVIRONMENT_THEMES.global;

    const css = `
      :root {
        ${buildCssVars(config.themeDark)}
        ${buildEnvCssVars(activeEffects)}
      }
    `;

    styleTag.innerHTML = css;
    document.title = config.appName;
  }, [config, activeEnvironment]);

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
    <BrandContext.Provider value={{ config: config || defaults, updateConfig, isLoading, activeEnvironment, setActiveEnvironment }}>
      {!isLoading && config ? children : (
        <div className="h-screen w-full flex flex-col gap-4 items-center justify-center font-medium animate-pulse" style={{ backgroundColor: '#0f172a', color: '#94a3b8' }}>
          <div className="w-12 h-12 rounded-full border-4 border-t-[#c9a655] animate-spin" style={{ borderColor: '#1e293b', borderTopColor: '#c9a655' }}></div>
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
