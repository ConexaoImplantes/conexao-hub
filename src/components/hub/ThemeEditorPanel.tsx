import React, { useState } from 'react';
import { ColorScheme, SystemConfig, ThemeModeConfig } from '../../types';
import { DEFAULT_LIGHT, DEFAULT_DARK } from '../../lib/themeDefaults';
import { Sun, Moon, Monitor, RotateCcw, Lock, Unlock, Eye } from 'lucide-react';
import { Switch } from '../ui/switch';

/* ─── Color Input ─── */
const ColorInput = ({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint: string }) => (
  <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--color-bg)' }}>
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

/* ─── Section ─── */
const Section = ({ title, children, collapsed, onToggle }: { title: string; children: React.ReactNode; collapsed?: boolean; onToggle?: () => void }) => (
  <div className="space-y-3 mb-4">
    <button
      onClick={onToggle}
      className="w-full text-left text-xs font-bold uppercase tracking-wider pb-2 border-b flex items-center justify-between"
      style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
    >
      {title}
      <span className="text-[10px] font-normal">{collapsed ? '▶' : '▼'}</span>
    </button>
    {!collapsed && <div className="grid grid-cols-2 gap-4">{children}</div>}
  </div>
);

/* ─── Live Preview ─── */
const LivePreview = ({ themeName, scheme }: { themeName: string; scheme: ColorScheme }) => (
  <div className="rounded-xl overflow-hidden shadow-lg relative transition-all duration-300" style={{ backgroundColor: scheme.background }}>
    <div className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-sm z-10" style={{ backgroundColor: scheme.overlay, color: scheme.textInverted || '#fff' }}>
      Preview {themeName}
    </div>
    <div className="p-3 flex items-center justify-between shadow-sm" style={{ backgroundColor: scheme.headerBg || scheme.surface }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: scheme.accent, color: scheme.accentForeground || '#fff' }}>A</div>
        <div className="h-2 w-16 rounded opacity-80" style={{ backgroundColor: scheme.textMain }}></div>
      </div>
      <div className="flex gap-1">
        <div className="w-5 h-5 rounded" style={{ backgroundColor: scheme.inputBg || scheme.surface, border: `1px solid ${scheme.inputBorder || scheme.border}` }}></div>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2 mb-2">
        <div className="h-4 px-2 rounded-full text-[10px] flex items-center font-bold" style={{ color: scheme.success, backgroundColor: scheme.successBg || scheme.success + '20' }}>Ativo</div>
        <div className="h-4 px-2 rounded-full text-[10px] flex items-center font-bold" style={{ color: scheme.warning, backgroundColor: scheme.warningBg || scheme.warning + '20' }}>Pendente</div>
        <div className="h-4 px-2 rounded-full text-[10px] flex items-center font-bold" style={{ color: scheme.error, backgroundColor: scheme.errorBg || scheme.error + '20' }}>Erro</div>
      </div>
      <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: scheme.card || scheme.surface }}>
        <div className="flex gap-3 mb-2">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: scheme.badgeBg || scheme.surfaceHover || scheme.surface }}></div>
          <div className="flex-1 space-y-1">
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: scheme.textMain, opacity: 0.8 }}></div>
            <div className="h-2 w-1/2 rounded" style={{ backgroundColor: scheme.textMuted, opacity: 0.5 }}></div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="h-6 px-3 rounded-lg text-[10px] flex items-center font-bold" style={{ backgroundColor: scheme.buttonPrimaryBg || scheme.accent, color: scheme.buttonPrimaryText || scheme.accentForeground || '#fff' }}>Botão</div>
          <div className="h-6 px-3 rounded-lg text-[10px] flex items-center font-bold border" style={{ borderColor: scheme.border, color: scheme.textMuted }}>Secundário</div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="p-2 rounded-lg text-[10px]" style={{ backgroundColor: scheme.tooltipBg, color: scheme.tooltipText }}>Tooltip</div>
        <div className="flex-1 h-8 rounded-lg border" style={{ backgroundColor: scheme.inputBg || scheme.background, borderColor: scheme.inputBorder || scheme.border }}>
          <div className="h-full w-1/3 rounded-lg" style={{ backgroundColor: scheme.accent, opacity: 0.3 }}></div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── CATEGORY DEFINITIONS ─── */
type CategoryKey = 'base' | 'text' | 'border' | 'brand' | 'feedback' | 'components' | 'effects' | 'gradients';
interface TokenDef { key: keyof ColorScheme; label: string; hint: string }

const CATEGORIES: Record<CategoryKey, { title: string; tokens: TokenDef[] }> = {
  base: {
    title: '🏗️ Estrutura Base',
    tokens: [
      { key: 'background', label: 'Background', hint: 'Fundo geral da página' },
      { key: 'surface', label: 'Surface', hint: 'Cards, painéis e modais' },
      { key: 'surfaceHover', label: 'Surface Hover', hint: 'Hover de cards/items' },
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
  effects: {
    title: '✨ Efeitos & UI',
    tokens: [
      { key: 'overlay', label: 'Overlay', hint: 'Fundo de modais/backdrops' },
      { key: 'shadow', label: 'Shadow', hint: 'Cor das sombras' },
      { key: 'glassTint', label: 'Glass Tint', hint: 'Tintura do efeito glass' },
      { key: 'headerBg', label: 'Header Background', hint: 'Fundo do cabeçalho' },
      { key: 'scrollbarThumb', label: 'Scrollbar', hint: 'Cor da barra de rolagem' },
      { key: 'scrollbarTrack', label: 'Scrollbar Track', hint: 'Trilha da barra de rolagem' },
      { key: 'ring', label: 'Focus Ring', hint: 'Anel de foco geral' },
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

const CATEGORY_ORDER: CategoryKey[] = ['base', 'text', 'border', 'brand', 'gradients', 'feedback', 'components', 'effects'];

/* ─── Main Component ─── */
interface ThemeEditorPanelProps {
  localConfig: SystemConfig;
  setLocalConfig: (config: SystemConfig) => void;
}

export const ThemeEditorPanel: React.FC<ThemeEditorPanelProps> = ({ localConfig, setLocalConfig }) => {
  const [editingMode, setEditingMode] = useState<'light' | 'dark'>('light');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const currentScheme = editingMode === 'light' ? localConfig.themeLight : localConfig.themeDark;
  const schemeKey = editingMode === 'light' ? 'themeLight' : 'themeDark';
  const defaults = editingMode === 'light' ? DEFAULT_LIGHT : DEFAULT_DARK;

  const themeMode = localConfig.themeMode || { mode: 'dual' as const, defaultTheme: 'dark' as const };

  const updateSchemeField = (key: keyof ColorScheme, value: string) => {
    setLocalConfig({
      ...localConfig,
      [schemeKey]: { ...currentScheme, [key]: value },
    });
  };

  const updateThemeMode = (newMode: Partial<ThemeModeConfig>) => {
    setLocalConfig({
      ...localConfig,
      themeMode: { ...themeMode, ...newMode },
    });
  };

  const resetCategory = (category: CategoryKey) => {
    const tokens = CATEGORIES[category].tokens;
    const resetScheme = { ...currentScheme };
    tokens.forEach(t => {
      resetScheme[t.key] = defaults[t.key];
    });
    setLocalConfig({ ...localConfig, [schemeKey]: resetScheme });
  };

  const resetAll = () => {
    setLocalConfig({
      ...localConfig,
      themeLight: { ...DEFAULT_LIGHT },
      themeDark: { ...DEFAULT_DARK },
    });
  };

  const toggleCollapsed = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Theme Mode Control ── */}
      <div className="p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-box"><Monitor size={20} /></div>
          <div>
            <h4 className="font-bold text-sm" style={{ color: 'var(--color-text-main)' }}>Controle de Modo</h4>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Configure como os usuários interagem com os temas</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Mode Toggle */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {themeMode.mode === 'dual' ? <Unlock size={16} style={{ color: 'var(--color-success)' }} /> : <Lock size={16} style={{ color: 'var(--color-warning)' }} />}
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-main)' }}>
                  {themeMode.mode === 'dual' ? 'Modo Dual' : 'Modo Único'}
                </span>
              </div>
              <Switch
                checked={themeMode.mode === 'dual'}
                onCheckedChange={(checked) => updateThemeMode({ mode: checked ? 'dual' : 'single' })}
              />
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {themeMode.mode === 'dual'
                ? 'Usuários podem alternar entre Light e Dark.'
                : 'Apenas um tema será usado. O toggle ficará oculto.'}
            </p>
          </div>

          {/* Default Theme */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-main)' }}>
              {themeMode.mode === 'single' ? 'Tema Forçado' : 'Tema Padrão'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => updateThemeMode({ defaultTheme: 'light' })}
                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-all ${themeMode.defaultTheme === 'light' ? 'scale-[1.02]' : 'opacity-60'}`}
                style={{
                  borderColor: themeMode.defaultTheme === 'light' ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: themeMode.defaultTheme === 'light' ? 'var(--color-accent-muted)' : 'transparent',
                  color: 'var(--color-text-main)',
                }}
              >
                <Sun size={16} className="text-orange-500" /> Light
              </button>
              <button
                onClick={() => updateThemeMode({ defaultTheme: 'dark' })}
                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 text-sm font-semibold transition-all ${themeMode.defaultTheme === 'dark' ? 'scale-[1.02]' : 'opacity-60'}`}
                style={{
                  borderColor: themeMode.defaultTheme === 'dark' ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: themeMode.defaultTheme === 'dark' ? 'var(--color-accent-muted)' : 'transparent',
                  color: 'var(--color-text-main)',
                }}
              >
                <Moon size={16} className="text-blue-400" /> Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Color Editor ── */}
      <div className="p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
        {/* Mode Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setEditingMode('light')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${editingMode === 'light' ? 'shadow-md scale-105' : 'opacity-60'}`}
              style={{
                backgroundColor: editingMode === 'light' ? 'var(--color-accent)' : 'var(--color-bg)',
                color: editingMode === 'light' ? 'var(--color-accent-fg)' : 'var(--color-text-muted)',
              }}
            >
              <Sun size={16} /> Light
            </button>
            <button
              onClick={() => setEditingMode('dark')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${editingMode === 'dark' ? 'shadow-md scale-105' : 'opacity-60'}`}
              style={{
                backgroundColor: editingMode === 'dark' ? 'var(--color-accent)' : 'var(--color-bg)',
                color: editingMode === 'dark' ? 'var(--color-accent-fg)' : 'var(--color-text-muted)',
              }}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
          <button
            onClick={resetAll}
            className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-bg)' }}
          >
            <RotateCcw size={14} /> Resetar Tudo
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Token Editor */}
          <div className="space-y-2">
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

          {/* Right: Live Preview */}
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Preview em Tempo Real
              </span>
            </div>
            <LivePreview themeName={editingMode === 'light' ? 'Light' : 'Dark'} scheme={currentScheme} />

            {/* Token Counter */}
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'var(--color-bg)' }}>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                {Object.keys(currentScheme).length} tokens configurados · {editingMode === 'light' ? '☀️ Light' : '🌙 Dark'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
