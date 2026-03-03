import { ColorScheme, ThemeModeConfig, EnvironmentEffects, EnvironmentThemes } from '../types';

export const DEFAULT_DARK: ColorScheme = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  card: '#1e293b',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  textInverted: '#0f172a',
  border: 'transparent',
  borderSubtle: '#1e293b',
  accent: '#c9a655',
  accentHover: '#d4b366',
  accentForeground: '#0f172a',
  accentMuted: '#c9a65520',
  success: '#22c55e',
  successBg: '#22c55e15',
  warning: '#eab308',
  warningBg: '#eab30815',
  error: '#ef4444',
  errorBg: '#ef444415',
  inputBg: '#0f172a',
  inputBorder: '#334155',
  inputFocus: '#c9a655',
  buttonPrimaryBg: '#c9a655',
  buttonPrimaryText: '#0f172a',
  badgeBg: '#334155',
  tooltipBg: '#f8fafc',
  tooltipText: '#0f172a',
  overlay: '#00000080',
  shadow: '#00000040',
  glassTint: '#ffffff10',
  headerBg: '#1e293b',
  scrollbarThumb: '#c9a655',
  scrollbarTrack: 'transparent',
  ring: '#c9a65580',
  gradientStart: '#c9a655',
  gradientMid: '#e8d48b',
  gradientEnd: '#a8873a',
  hoverBg: '#334155',
  hoverBorder: '#c9a65540',
  hoverScale: '1.02',
  hoverShadow: '#c9a65525',
};

export const DEFAULT_THEME_MODE: ThemeModeConfig = {
  mode: 'single',
  defaultTheme: 'dark',
};

/** Merge partial/legacy scheme with defaults */
export function mergeScheme(partial: Partial<ColorScheme> | undefined, defaults: ColorScheme): ColorScheme {
  if (!partial) return { ...defaults };
  return { ...defaults, ...partial };
}

/* ─── Environment Effects Defaults ─── */

const DEFAULT_GLOBAL_EFFECTS: EnvironmentEffects = {
  pageBg: '#0f172a',
  blob1Color: '#c9a655',
  blob2Color: '#e8d48b',
  blob3Color: '#a8873a',
  blobOpacity: '0.20',
  blobSize: '18',
  blobBlur: '64',
  grainOpacity: '0.20',
  grainBlendMode: 'multiply',
  grainContrast: '150',
  glassOpacity: '0.40',
  glassBlur: '24',
  glassBorderOpacity: '0.10',
};

export const DEFAULT_ENVIRONMENT_THEMES: EnvironmentThemes = {
  global: { ...DEFAULT_GLOBAL_EFFECTS },
  auth: {
    ...DEFAULT_GLOBAL_EFFECTS,
    blob1Color: '#c9a655',
    blob2Color: '#c9a655',
    blob3Color: '#c9a655',
    blobOpacity: '0.15',
    blobSize: '24',
    blobBlur: '100',
    grainOpacity: '0.10',
  },
  client: {
    ...DEFAULT_GLOBAL_EFFECTS,
    blob1Color: '#c9a655',
    blob2Color: '#e8d48b',
    blob3Color: '#a8873a',
    blobOpacity: '0.20',
    blobSize: '18',
    blobBlur: '64',
  },
  manager: {
    ...DEFAULT_GLOBAL_EFFECTS,
    blob1Color: '#c9a655',
    blob2Color: '#d4b366',
    blob3Color: '#b8953e',
    blobOpacity: '0.15',
    blobSize: '20',
    blobBlur: '80',
  },
  admin: {
    ...DEFAULT_GLOBAL_EFFECTS,
    blob1Color: '#c9a655',
    blob2Color: '#e8d48b',
    blob3Color: '#a8873a',
    blobOpacity: '0.18',
    blobSize: '18',
    blobBlur: '64',
  },
};

export function mergeEnvironmentEffects(
  partial: Partial<EnvironmentEffects> | undefined,
  defaults: EnvironmentEffects
): EnvironmentEffects {
  if (!partial) return { ...defaults };
  return { ...defaults, ...partial };
}
