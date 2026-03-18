import React, { useState } from 'react';
import { ColorScheme, SystemConfig, EnvironmentKey, EnvironmentEffects, EnvironmentThemes } from '../../types';
import { DEFAULT_DARK, DEFAULT_ENVIRONMENT_THEMES } from '../../lib/themeDefaults';
import { RotateCcw, Globe, LogIn, User, Briefcase, Shield } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { colorMix } from '../../lib/utils';

/* ─── Color Input ─── */
const ColorInput = ({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint: string }) => (
  <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--color-bg)' }}>
    <div className="relative h-8 w-8 shrink-0 rounded-md overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      <div className="absolute inset-0" style={{ backgroundColor: value || '#000000' }} />
      <input type="color" value={value?.startsWith('#') ? value.slice(0, 7) : '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-[11px] font-semibold block truncate" style={{ color: 'var(--color-text-main)' }}>{label}</span>
      <span className="text-[10px] block truncate" style={{ color: 'var(--color-text-muted)' }}>{hint}</span>
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-[90px] p-1.5 rounded text-[11px] font-mono uppercase text-center focus:ring-2 outline-none transition-colors shrink-0"
      style={{ color: 'var(--color-text-main)', backgroundColor: 'var(--color-input-bg)', borderColor: 'var(--color-input-border)', border: '1px solid' }}
    />
  </div>
);

/* ─── Slider Input ─── */
const SliderInput = ({ label, value, onChange, min, max, step, hint, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; hint: string; unit?: string }) => (
  <div className="py-2 px-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
    <div className="flex items-center justify-between mb-2">
      <div>
        <span className="text-[11px] font-semibold block" style={{ color: 'var(--color-text-main)' }}>{label}</span>
        <span className="text-[10px] block" style={{ color: 'var(--color-text-muted)' }}>{hint}</span>
      </div>
      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
        {value}{unit || ''}
      </span>
    </div>
    <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
  </div>
);

/* ─── CATEGORY DEFINITIONS ─── */
type CategoryKey = 'base' | 'text' | 'border' | 'brand' | 'feedback' | 'components' | 'header' | 'hover' | 'effects' | 'gradients';
interface TokenDef { key: keyof ColorScheme; label: string; hint: string }

const CATEGORIES: Record<CategoryKey, { title: string; tokens: TokenDef[] }> = {
  base: {
    title: '🏗️ Estrutura Base',
    tokens: [
      { key: 'background', label: 'Background', hint: 'Fundo geral da página' },
      { key: 'surface', label: 'Surface', hint: 'Cards, painéis e modais' },
      { key: 'card', label: 'Card', hint: 'Background de cards' },
    ],
  },
  text: {
    title: '✏️ Tipografia',
    tokens: [
      { key: 'textMain', label: 'Texto Principal', hint: 'Títulos e corpo' },
      { key: 'textMuted', label: 'Texto Secundário', hint: 'Legendas e hints' },
      { key: 'textInverted', label: 'Texto Invertido', hint: 'Texto sobre fundos coloridos' },
    ],
  },
  border: {
    title: '📐 Bordas',
    tokens: [
      { key: 'border', label: 'Borda Principal', hint: 'Divisores e contornos' },
      { key: 'borderSubtle', label: 'Borda Sutil', hint: 'Separadores mais leves' },
    ],
  },
  brand: {
    title: '🎨 Marca / Accent',
    tokens: [
      { key: 'accent', label: 'Accent', hint: 'Cor principal da marca' },
      { key: 'accentHover', label: 'Accent Hover', hint: 'Hover do accent' },
      { key: 'accentForeground', label: 'Accent Foreground', hint: 'Texto sobre accent' },
      { key: 'accentMuted', label: 'Accent Muted', hint: 'Background suave do accent' },
    ],
  },
  feedback: {
    title: '🚦 Feedback / Status',
    tokens: [
      { key: 'success', label: 'Sucesso', hint: 'Cor de sucesso' },
      { key: 'successBg', label: 'Sucesso BG', hint: 'Background de badge sucesso' },
      { key: 'warning', label: 'Alerta', hint: 'Cor de alerta' },
      { key: 'warningBg', label: 'Alerta BG', hint: 'Background de badge alerta' },
      { key: 'error', label: 'Erro', hint: 'Cor de erro' },
      { key: 'errorBg', label: 'Erro BG', hint: 'Background de badge erro' },
    ],
  },
  components: {
    title: '🧩 Componentes',
    tokens: [
      { key: 'inputBg', label: 'Input Background', hint: 'Fundo de campos' },
      { key: 'inputBorder', label: 'Input Borda', hint: 'Borda de campos' },
      { key: 'inputFocus', label: 'Input Focus', hint: 'Ring de foco' },
      { key: 'buttonPrimaryBg', label: 'Botão Primário BG', hint: 'Fundo do botão principal' },
      { key: 'buttonPrimaryText', label: 'Botão Primário Texto', hint: 'Texto do botão principal' },
      { key: 'badgeBg', label: 'Badge Background', hint: 'Fundo de badges' },
      { key: 'tooltipBg', label: 'Tooltip Background', hint: 'Fundo de tooltips' },
      { key: 'tooltipText', label: 'Tooltip Texto', hint: 'Texto de tooltips' },
    ],
  },
  header: {
    title: '🏛️ Cabeçalho',
    tokens: [
      { key: 'headerBg', label: 'Header Background', hint: 'Fundo do cabeçalho' },
      { key: 'glassTint', label: 'Glass Tint', hint: 'Tintura do efeito glass' },
      { key: 'ring', label: 'Focus Ring', hint: 'Anel de foco geral' },
    ],
  },
  hover: {
    title: '👆 Efeitos de Hover',
    tokens: [
      { key: 'surfaceHover', label: 'Surface Hover', hint: 'Hover de cards/items' },
      { key: 'hoverBg', label: 'Hover Background', hint: 'Background ao passar o mouse' },
      { key: 'hoverBorder', label: 'Hover Borda', hint: 'Cor da borda no hover' },
      { key: 'hoverShadow', label: 'Hover Sombra', hint: 'Cor da sombra no hover' },
    ],
  },
  effects: {
    title: '✨ Efeitos & UI',
    tokens: [
      { key: 'overlay', label: 'Overlay', hint: 'Fundo de modais/backdrops' },
      { key: 'shadow', label: 'Shadow', hint: 'Cor das sombras' },
      { key: 'scrollbarThumb', label: 'Scrollbar', hint: 'Cor da barra de rolagem' },
      { key: 'scrollbarTrack', label: 'Scrollbar Track', hint: 'Trilha da barra de rolagem' },
    ],
  },
  gradients: {
    title: '🌈 Gradientes',
    tokens: [
      { key: 'gradientStart', label: 'Gradiente Início', hint: 'Cor inicial do gradiente da marca' },
      { key: 'gradientMid', label: 'Gradiente Meio', hint: 'Cor intermediária do gradiente' },
      { key: 'gradientEnd', label: 'Gradiente Fim', hint: 'Cor final do gradiente' },
    ],
  },
};

const CATEGORY_ORDER: CategoryKey[] = ['base', 'text', 'border', 'brand', 'gradients', 'header', 'hover', 'feedback', 'components', 'effects'];

/* ─── Environment Tab Labels ─── */
const ENV_TABS: { key: EnvironmentKey; label: string; icon: React.ReactNode }[] = [
  { key: 'global', label: 'Global', icon: <Globe size={14} /> },
  { key: 'auth', label: 'Login', icon: <LogIn size={14} /> },
  { key: 'client', label: 'Cliente', icon: <User size={14} /> },
  { key: 'manager', label: 'Gestor', icon: <Briefcase size={14} /> },
  { key: 'admin', label: 'Admin', icon: <Shield size={14} /> },
];

const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light'];

/* ─── Environment Effects Editor ─── */
const EnvironmentEffectsEditor = ({
  effects,
  onChange,
  onReset,
  envKey,
}: {
  effects: EnvironmentEffects;
  onChange: (updated: EnvironmentEffects) => void;
  onReset: () => void;
  envKey: EnvironmentKey;
}) => {
  const update = (key: keyof EnvironmentEffects, value: string) => {
    onChange({ ...effects, [key]: value });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Configurações do ambiente
        </p>
        <button
          onClick={onReset}
          className="px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 hover:opacity-80"
          style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)' }}
        >
          <RotateCcw size={10} /> Resetar
        </button>
      </div>

      {/* Background */}
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h5 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
          🎨 Background da Página
        </h5>
        <ColorInput label="Cor de Fundo" value={effects.pageBg} onChange={(v) => update('pageBg', v)} hint="Background principal do ambiente" />
      </div>

      {/* Blobs */}
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h5 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
          🫧 Blobs Animados
        </h5>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <ColorInput label="Blob 1" value={effects.blob1Color} onChange={(v) => update('blob1Color', v)} hint="Cor do primeiro blob" />
          <ColorInput label="Blob 2" value={effects.blob2Color} onChange={(v) => update('blob2Color', v)} hint="Cor do segundo blob" />
          <ColorInput label="Blob 3" value={effects.blob3Color} onChange={(v) => update('blob3Color', v)} hint="Cor do terceiro blob" />
        </div>
        <div className="space-y-2">
          <SliderInput label="Opacidade" value={parseFloat(effects.blobOpacity)} onChange={(v) => update('blobOpacity', v.toFixed(2))} min={0} max={1} step={0.01} hint="Transparência dos blobs" />
          <SliderInput label="Tamanho" value={parseFloat(effects.blobSize)} onChange={(v) => update('blobSize', String(v))} min={4} max={60} step={1} hint="Tamanho em rem" unit="rem" />
          <SliderInput label="Blur" value={parseFloat(effects.blobBlur)} onChange={(v) => update('blobBlur', String(v))} min={0} max={200} step={1} hint="Desfoque em px" unit="px" />
        </div>

        {/* Mini preview */}
        <div className="mt-3 relative h-20 rounded-xl overflow-hidden" style={{ backgroundColor: effects.pageBg }}>
          <div className="absolute top-1 left-2 rounded-full animate-blob" style={{ width: '3rem', height: '3rem', backgroundColor: effects.blob1Color, opacity: effects.blobOpacity, filter: `blur(${Math.min(parseFloat(effects.blobBlur), 30)}px)` }} />
          <div className="absolute top-1 right-2 rounded-full animate-blob animation-delay-2000" style={{ width: '3rem', height: '3rem', backgroundColor: effects.blob2Color, opacity: effects.blobOpacity, filter: `blur(${Math.min(parseFloat(effects.blobBlur), 30)}px)` }} />
          <div className="absolute bottom-1 left-8 rounded-full animate-blob animation-delay-4000" style={{ width: '3rem', height: '3rem', backgroundColor: effects.blob3Color, opacity: effects.blobOpacity, filter: `blur(${Math.min(parseFloat(effects.blobBlur), 30)}px)` }} />
          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }}>Preview</div>
        </div>
      </div>

      {/* Grain */}
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h5 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
          🌫️ Grain / Ruído
        </h5>
        <div className="space-y-2">
          <SliderInput label="Opacidade" value={parseFloat(effects.grainOpacity)} onChange={(v) => update('grainOpacity', v.toFixed(2))} min={0} max={1} step={0.01} hint="Intensidade do ruído" />
          <div className="py-2 px-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--color-text-main)' }}>Blend Mode</span>
                <span className="text-[10px] block" style={{ color: 'var(--color-text-muted)' }}>Modo de mistura do ruído</span>
              </div>
            </div>
            <select
              value={effects.grainBlendMode}
              onChange={(e) => update('grainBlendMode', e.target.value)}
              className="w-full p-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-main)' }}
            >
              {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <SliderInput label="Contraste" value={parseFloat(effects.grainContrast)} onChange={(v) => update('grainContrast', String(Math.round(v)))} min={50} max={300} step={5} hint="Contraste do noise" unit="%" />
        </div>
      </div>

      {/* Glass */}
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h5 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
          🪟 Glassmorphism
        </h5>
        <div className="space-y-2">
          <SliderInput label="Opacidade" value={parseFloat(effects.glassOpacity)} onChange={(v) => update('glassOpacity', v.toFixed(2))} min={0} max={1} step={0.01} hint="Transparência do efeito glass" />
          <SliderInput label="Blur" value={parseFloat(effects.glassBlur)} onChange={(v) => update('glassBlur', String(v))} min={0} max={100} step={1} hint="Desfoque do glass em px" unit="px" />
          <SliderInput label="Borda" value={parseFloat(effects.glassBorderOpacity)} onChange={(v) => update('glassBorderOpacity', v.toFixed(2))} min={0} max={1} step={0.01} hint="Opacidade da borda glass" />
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
interface ThemeEditorPanelProps {
  localConfig: SystemConfig;
  setLocalConfig: (config: SystemConfig) => void;
}

export const ThemeEditorPanel: React.FC<ThemeEditorPanelProps> = ({ localConfig, setLocalConfig }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mainTab, setMainTab] = useState<'colors' | 'environments'>('colors');

  const currentScheme = localConfig.themeDark;
  const defaults = DEFAULT_DARK;
  const envThemes = localConfig.environmentThemes || DEFAULT_ENVIRONMENT_THEMES;

  const updateSchemeField = (key: keyof ColorScheme, value: string) => {
    setLocalConfig({
      ...localConfig,
      themeDark: { ...currentScheme, [key]: value },
    });
  };

  const updateEnvironmentEffects = (envKey: EnvironmentKey, effects: EnvironmentEffects) => {
    setLocalConfig({
      ...localConfig,
      environmentThemes: { ...envThemes, [envKey]: effects },
    });
  };

  const resetEnvironment = (envKey: EnvironmentKey) => {
    setLocalConfig({
      ...localConfig,
      environmentThemes: { ...envThemes, [envKey]: { ...DEFAULT_ENVIRONMENT_THEMES[envKey] } },
    });
  };

  const resetCategory = (category: CategoryKey) => {
    const tokens = CATEGORIES[category].tokens;
    const resetScheme = { ...currentScheme };
    tokens.forEach(t => {
      resetScheme[t.key] = defaults[t.key];
    });
    setLocalConfig({ ...localConfig, themeDark: resetScheme });
  };

  const resetAll = () => {
    setLocalConfig({
      ...localConfig,
      themeDark: { ...DEFAULT_DARK },
    });
  };

  const toggleCollapsed = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Main Tabs: Colors vs Environments ── */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg)' }}>
        <button
          onClick={() => setMainTab('colors')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mainTab === 'colors' ? 'shadow-md' : 'opacity-60'}`}
          style={{
            backgroundColor: mainTab === 'colors' ? 'var(--color-accent)' : 'transparent',
            color: mainTab === 'colors' ? 'var(--color-accent-fg)' : 'var(--color-text-muted)',
          }}
        >
          🎨 Cores do Tema
        </button>
        <button
          onClick={() => setMainTab('environments')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mainTab === 'environments' ? 'shadow-md' : 'opacity-60'}`}
          style={{
            backgroundColor: mainTab === 'environments' ? 'var(--color-accent)' : 'transparent',
            color: mainTab === 'environments' ? 'var(--color-accent-fg)' : 'var(--color-text-muted)',
          }}
        >
          🌍 Ambientes
        </button>
      </div>

      {/* ── Color Editor ── */}
      {mainTab === 'colors' && (
        <div className="p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-sm" style={{ color: 'var(--color-text-main)' }}>Personalização de Cores</h4>
            <button
              onClick={resetAll}
              className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)' }}
            >
              <RotateCcw size={14} /> Resetar Tudo
            </button>
          </div>

          {/* Token Editor - Two Columns */}
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
            {CATEGORY_ORDER.map((catKey) => {
              const cat = CATEGORIES[catKey];
              return (
                <div key={catKey}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCollapsed(catKey)}
                      className="flex-1 text-left text-xs font-bold uppercase tracking-wider py-2 flex items-center justify-between"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {cat.title}
                      <span className="text-[10px] font-normal">{collapsed[catKey] ? '▶' : '▼'}</span>
                    </button>
                    <button
                      onClick={() => resetCategory(catKey)}
                      className="p-1 rounded text-[10px] font-semibold hover:opacity-80"
                      style={{ color: 'var(--color-text-muted)' }}
                      title="Resetar categoria"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                  <div className="border-b mb-3" style={{ borderColor: 'var(--color-border)' }} />
                  {!collapsed[catKey] && (
                    <>
                      <div className="space-y-1 mb-4">
                        {cat.tokens.map((token) => (
                          <ColorInput
                            key={token.key}
                            label={token.label}
                            value={currentScheme[token.key] || defaults[token.key]}
                            onChange={(v) => updateSchemeField(token.key, v)}
                            hint={token.hint}
                          />
                        ))}
                      </div>
                      {catKey === 'gradients' && (
                        <div className="mb-4">
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Preview do Gradiente</p>
                          <div
                            className="h-10 rounded-xl shadow-inner"
                            style={{ background: `linear-gradient(135deg, ${currentScheme.gradientStart || defaults.gradientStart} 0%, ${currentScheme.gradientMid || defaults.gradientMid} 40%, ${currentScheme.gradientEnd || defaults.gradientEnd} 70%, ${currentScheme.gradientStart || defaults.gradientStart} 100%)` }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Environments Editor ── */}
      {mainTab === 'environments' && (
        <div className="p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="mb-4">
            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--color-text-main)' }}>Efeitos por Ambiente</h4>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Configure background, blobs, grain e glass individualmente para cada tela da plataforma.
            </p>
          </div>
          <Tabs defaultValue="global">
            <TabsList className="w-full flex mb-4 h-auto flex-wrap gap-1" style={{ backgroundColor: 'var(--color-bg)' }}>
              {ENV_TABS.map(tab => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:shadow-md"
                >
                  {tab.icon} {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {ENV_TABS.map(tab => (
              <TabsContent key={tab.key} value={tab.key}>
                <EnvironmentEffectsEditor
                  effects={envThemes[tab.key] || DEFAULT_ENVIRONMENT_THEMES[tab.key]}
                  onChange={(updated) => updateEnvironmentEffects(tab.key, updated)}
                  onReset={() => resetEnvironment(tab.key)}
                  envKey={tab.key}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};
