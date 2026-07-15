import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBrand } from '../../contexts/BrandContext';
import { LogOut, Globe, Star, LayoutGrid } from 'lucide-react';
import { getUserLevel } from '../../types';
import { mockDb, GamificationLevel } from '../../lib/mockDb';
import { useEnvironment } from '../../App';
import { ENVIRONMENTS } from '../../lib/environments';
import { colorMix } from '../../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { config } = useBrand();
  const { active, eligible, switchEnvironment } = useEnvironment();
  const [levels, setLevels] = useState<GamificationLevel[]>([]);

  useEffect(() => {
    mockDb.getGamificationLevels().then(setLevels).catch(() => {});
  }, []);

  // Determine current level color for non-admin users
  const getLevelColor = (): string | null => {
    if (!user || user.role === 'super_admin' || user.role === 'manager' || levels.length === 0) return null;
    const points = user.points || 0;
    const sorted = [...levels].sort((a, b) => b.minPoints - a.minPoints);
    const currentLevel = sorted.find(l => points >= l.minPoints);
    return currentLevel?.color || null;
  };

  const levelColor = getLevelColor();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 relative">
      <header className="sticky top-0 z-40 w-full px-2 sm:px-4 pt-2 sm:pt-4 pointer-events-none">
        <div className="container mx-auto">
            <div
              className="rounded-2xl p-2 pl-3 sm:p-3 sm:pl-5 flex justify-between items-center pointer-events-auto transition-all duration-500 relative overflow-hidden"
              style={{
                background: levelColor
                  ? `linear-gradient(135deg, ${levelColor}12 0%, ${colorMix('var(--color-header-bg)', 80, 'rgba(15,23,42,0.8)')} 50%, ${levelColor}08 100%)`
                  : `linear-gradient(135deg, ${colorMix('var(--color-glass-tint)', 25, 'rgba(30,41,59,0.25)')} 0%, ${colorMix('var(--color-header-bg)', 80, 'rgba(15,23,42,0.8)')} 50%, ${colorMix('var(--color-glass-tint)', 15, 'rgba(30,41,59,0.15)')} 100%)`,
                backdropFilter: `blur(var(--env-glass-blur, 20px)) saturate(180%)`,
                WebkitBackdropFilter: `blur(var(--env-glass-blur, 20px)) saturate(180%)`,
                border: levelColor
                  ? `1px solid ${levelColor}25`
                  : `1px solid ${colorMix('var(--color-glass-tint)', 20, 'rgba(255,255,255,0.1)')}`,
                boxShadow: levelColor
                  ? `0 0 20px ${levelColor}08, inset 0 0 30px ${levelColor}05`
                  : `0 8px 32px var(--color-shadow, rgba(0,0,0,0.3)), inset 0 1px 0 ${colorMix('var(--color-glass-tint)', 30, 'rgba(255,255,255,0.12)')}, inset 0 -1px 0 ${colorMix('var(--color-glass-tint)', 10, 'rgba(255,255,255,0.04)')}`,
              }}
            >
            <div className="flex items-center space-x-4 group cursor-default">
                <div className="relative">
                    <div className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                    {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="relative h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                    <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)' }}>
                        {config.appName.substring(0, 2).toUpperCase()}
                    </div>
                    )}
                </div>
                <h1 className="text-xl font-bold hidden sm:block tracking-tight transition-colors duration-300" style={{ color: 'var(--color-text-main)' }}>{config.appName}</h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
                <div data-tour="language-switcher" className="flex items-center gap-1 sm:gap-2 rounded-full px-1 py-1 sm:px-1.5 sm:py-1.5 transition-colors group" style={{ backgroundColor: colorMix('var(--color-bg)', 50, 'rgba(15,23,42,0.5)'), border: `1px solid ${colorMix('var(--color-border)', 50, 'rgba(255,255,255,0.1)')}` }}>
                    <div className="p-1 sm:p-1.5 rounded-full shadow-sm transition-colors" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                        <Globe size={12} className="sm:hidden" />
                        <Globe size={14} className="hidden sm:block" />
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="border-none text-[10px] sm:text-xs focus:ring-0 cursor-pointer font-bold outline-none uppercase pr-1 sm:pr-2 transition-colors"
                        style={{ color: 'var(--color-text-main)', backgroundColor: 'var(--color-surface)' }}
                    >
                        <option value="pt-br">PT</option>
                        <option value="en-us">EN</option>
                        <option value="es-es">ES</option>
                    </select>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 pl-1 sm:pl-2">
                    <div className="flex items-center gap-2 sm:gap-3 rounded-full p-1 pr-2 sm:pr-4 transition-all duration-300 cursor-default group" style={{ backgroundColor: colorMix('var(--color-bg)', 50, 'rgba(15,23,42,0.5)'), border: `1px solid ${colorMix('var(--color-border)', 50, 'rgba(255,255,255,0.1)')}` }}>
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-md transition-all" style={{ background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)', color: 'var(--color-accent-fg)', boxShadow: `0 0 0 2px ${colorMix('var(--color-text-main)', 20, 'rgba(248,250,252,0.2)')}` }}>
                            {user?.name.charAt(0)}
                        </div>
                        <div className="hidden md:block leading-none">
                            <p className="text-xs font-bold transition-colors" style={{ color: 'var(--color-text-main)' }}>{user?.name.split(' ')[0]}</p>
                        {user?.role !== 'super_admin' && user?.role !== 'manager' ? (
                              <p className="text-[9px] uppercase tracking-wide font-semibold mt-0.5 flex items-center gap-1" style={{ color: levelColor || 'var(--color-accent)' }}>
                                <Star size={8} style={{ fill: levelColor || 'var(--color-warning)', color: levelColor || 'var(--color-warning)' }} />
                                {getUserLevel(user?.points || 0)} · {user?.points || 0} XP
                              </p>
                            ) : (
                              <p className="text-[9px] uppercase tracking-wide font-semibold mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t(`role.${user?.role}`)}</p>
                            )}
                        </div>
                    </div>

                    {eligible.length > 1 && (
                      <button
                        onClick={switchEnvironment}
                        className="group relative hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: colorMix('var(--color-accent)', 12, 'rgba(201,166,85,0.12)'),
                          color: 'var(--color-accent)',
                          border: `1px solid ${colorMix('var(--color-accent)', 25, 'rgba(201,166,85,0.25)')}`,
                        }}
                        title={`Ambiente atual: ${active ? ENVIRONMENTS[active].label : ''} — clique para trocar`}
                      >
                        <LayoutGrid size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          {active ? ENVIRONMENTS[active].label.replace(/^(Painel |Ambiente )/i, '') : ''}
                        </span>
                      </button>
                    )}
                    {eligible.length > 1 && (
                      <button
                        onClick={switchEnvironment}
                        className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full transition-all"
                        style={{
                          backgroundColor: colorMix('var(--color-accent)', 12, 'rgba(201,166,85,0.12)'),
                          color: 'var(--color-accent)',
                          border: `1px solid ${colorMix('var(--color-accent)', 25, 'rgba(201,166,85,0.25)')}`,
                        }}
                        title="Trocar ambiente"
                      >
                        <LayoutGrid size={14} />
                      </button>
                    )}

                    <button
                        onClick={logout}
                        className="group relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:text-white hover:shadow-lg"
                        style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-error)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-error-bg)'; e.currentTarget.style.color = 'var(--color-error)'; }}
                        title={t('common.logout')}
                    >
                        <LogOut size={16} className="sm:hidden transition-transform duration-300 group-hover:translate-x-0.5" />
                        <LogOut size={18} className="hidden sm:block transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
            </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-3 sm:p-4 md:p-6 mt-2 sm:mt-4 animate-fade-in relative z-10" style={{ color: 'var(--color-text-main)' }}>
        {children}
      </main>
    </div>
  );
};
