import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBrand } from '../../contexts/BrandContext';
import { Moon, Sun, LogOut, Globe, Star } from 'lucide-react';
import { getUserLevel } from '../../types';
import { mockDb, GamificationLevel } from '../../lib/mockDb';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { config } = useBrand();
  const [levels, setLevels] = useState<GamificationLevel[]>([]);

  useEffect(() => {
    mockDb.getGamificationLevels().then(setLevels).catch(() => {});
  }, []);

  // Determine current level color for non-admin users
  const getLevelColor = (): string | null => {
    if (!user || user.role === 'super_admin' || levels.length === 0) return null;
    const points = user.points || 0;
    // Find the highest level the user qualifies for
    const sorted = [...levels].sort((a, b) => b.minPoints - a.minPoints);
    const currentLevel = sorted.find(l => points >= l.minPoints);
    return currentLevel?.color || null;
  };

  const levelColor = getLevelColor();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 relative">
      <header className="sticky top-0 z-40 w-full px-4 pt-4 pointer-events-none">
        <div className="container mx-auto">
            <div
              className="liquid-glass rounded-2xl p-3 pl-5 flex justify-between items-center pointer-events-auto transition-all duration-500 relative overflow-hidden"
              style={levelColor ? {
                border: `1px solid ${levelColor}30`,
                boxShadow: `0 0 15px ${levelColor}10, 0 0 30px ${levelColor}05`,
              } : {}}
            >
              {/* Gradient border glow effect */}
              {levelColor && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                  background: `linear-gradient(135deg, ${levelColor}15 0%, transparent 40%, transparent 60%, ${levelColor}10 100%)`,
                }} />
              )}
            <div className="flex items-center space-x-4 group cursor-default">
                <div className="relative">
                    <div className="absolute inset-0 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                    {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="relative h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                    <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #c9a655 0%, #e8d48b 40%, #a8873a 70%, #c9a655 100%)' }}>
                        {config.appName.substring(0, 2).toUpperCase()}
                    </div>
                    )}
                </div>
                <h1 className="text-xl font-bold hidden sm:block tracking-tight transition-colors duration-300" style={{ color: 'var(--color-text-main)' }}>{config.appName}</h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 rounded-full px-1.5 py-1.5 transition-colors group" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)', border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)' }}>
                    <div className="p-1.5 rounded-full shadow-sm transition-colors" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                        <Globe size={14} />
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer font-bold outline-none uppercase pr-2 transition-colors"
                        style={{ color: 'var(--color-text-main)' }}
                    >
                        <option value="pt-br">PT</option>
                        <option value="en-us">EN</option>
                        <option value="es-es">ES</option>
                    </select>
                </div>

                <button
                onClick={toggleTheme}
                className="relative overflow-hidden w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)', border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)', color: 'var(--color-text-muted)' }}
                >
                    <div className="relative z-10 transition-transform duration-500 group-hover:rotate-180">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                </button>

                <div className="flex items-center gap-3 pl-2">
                    <div className="flex items-center gap-3 rounded-full p-1 pr-4 transition-all duration-300 cursor-default group" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)', border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white/20 transition-all" style={{ background: 'linear-gradient(135deg, #c9a655 0%, #e8d48b 40%, #a8873a 70%, #c9a655 100%)' }}>
                            {user?.name.charAt(0)}
                        </div>
                        <div className="hidden md:block leading-none">
                            <p className="text-xs font-bold transition-colors" style={{ color: 'var(--color-text-main)' }}>{user?.name.split(' ')[0]}</p>
                            {user?.role !== 'super_admin' ? (
                              <p className="text-[9px] uppercase tracking-wide font-semibold mt-0.5 flex items-center gap-1" style={{ color: levelColor || 'var(--color-accent)' }}>
                                <Star size={8} style={levelColor ? { fill: levelColor, color: levelColor } : {}} className={!levelColor ? 'fill-yellow-400 text-yellow-400' : ''} />
                                {getUserLevel(user?.points || 0)} · {user?.points || 0} XP
                              </p>
                            ) : (
                              <p className="text-[9px] uppercase tracking-wide font-semibold mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t(`role.${user?.role}`)}</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                        title={t('common.logout')}
                    >
                        <LogOut size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
            </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 mt-4 animate-fade-in relative z-10" style={{ color: 'var(--color-text-main)' }}>
        {children}
      </main>
    </div>
  );
};
