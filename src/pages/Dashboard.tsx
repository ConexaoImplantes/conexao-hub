import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDb } from '../lib/mockDb';
import { Material, Language, MaterialType } from '../types';
import { MaterialCard } from '../components/hub/MaterialCard';
import { ViewerModal } from '../components/hub/ViewerModal';
import { Search, Grid, FileText, Image as ImageIcon, Video, Filter, ChevronRight, Layers, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MaterialType | 'all'>('all');

  useEffect(() => {
    if (user) {
      mockDb.getMaterials(user.role).then(setMaterials);
    }
  }, [user]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      if (!mat.allowedRoles.includes(user?.role as any)) return false;
      if (user?.allowedTypes && user.allowedTypes.length > 0) {
        if (!user.allowedTypes.includes(mat.type)) return false;
      }
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, filterType, language, user]);

  const counts = useMemo(() => {
      const base = materials.filter(mat => {
          if (!mat.allowedRoles.includes(user?.role as any)) return false;
          if (user?.allowedTypes && user.allowedTypes.length > 0 && !user.allowedTypes.includes(mat.type)) return false;
          return true;
      });
      return {
          all: base.length,
          pdf: base.filter(m => m.type === 'pdf').length,
          image: base.filter(m => m.type === 'image').length,
          video: base.filter(m => m.type === 'video').length
      };
  }, [materials, user]);

  const handleViewMaterial = (mat: Material, lang: Language) => {
      if(user) mockDb.logAccess(mat.id, user.id, lang);
      setViewingMaterial({ mat, lang });
  };

  const MenuCategory = ({ type, icon: Icon, label, count, active }: { type: MaterialType | 'all', icon: any, label: string, count: number, active: boolean }) => (
    <button
      onClick={() => setFilterType(type)}
      className={`group relative w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between transition-all duration-500 ease-out overflow-hidden
        ${active ? 'text-white shadow-lg translate-x-2' : 'bg-transparent hover:opacity-80'}
      `}
      style={active ? { background: `linear-gradient(to right, var(--color-accent), color-mix(in srgb, var(--color-accent) 80%, transparent))`, boxShadow: `0 10px 25px -5px color-mix(in srgb, var(--color-accent) 30%, transparent)` } : { color: 'var(--color-text-muted)' }}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-white/20 text-white' : 'border'}`} style={!active ? { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' } : {}}>
          <Icon size={18} />
        </div>
        <span className={`text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-300
          ${active ? 'bg-white/20 text-white backdrop-blur-sm' : 'border'}
      `} style={!active ? { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' } : {}}>
          {count}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">
      <aside className="w-full md:w-72 shrink-0 z-30">
        <div className="sticky top-28 space-y-6 animate-slide-up">
           <div className="md:hidden flex items-center gap-2 px-1 mb-2" style={{ color: 'var(--color-text-muted)' }}>
              <Filter size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{t('filter.title')}</span>
           </div>

           <div className="backdrop-blur-xl border border-white/10 p-3 rounded-3xl flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 no-scrollbar shadow-xl shadow-black/5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 30%, transparent)' }}>
              <div className="hidden md:flex items-center justify-between px-4 py-3 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                      <Layers size={14} style={{ color: 'var(--color-accent)' }} /> Biblioteca
                  </h3>
              </div>

              <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="all" icon={Grid} label={t('filter.all')} count={counts.all} active={filterType === 'all'} /></div>
              <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="pdf" icon={FileText} label={t('filter.pdf')} count={counts.pdf} active={filterType === 'pdf'} /></div>
              <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="image" icon={ImageIcon} label={t('filter.image')} count={counts.image} active={filterType === 'image'} /></div>
              <div className="min-w-[160px] md:min-w-0 flex-1"><MenuCategory type="video" icon={Video} label={t('filter.video')} count={counts.video} active={filterType === 'video'} /></div>

              <div className="hidden md:block mt-4 pt-4 px-2 border-t border-white/5">
                  <div className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(10, 30, 61, 0.15), rgba(201, 166, 85, 0.08))', border: '1px solid rgba(201, 166, 85, 0.15)' }}>
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-colors duration-500" style={{ backgroundColor: 'rgba(201, 166, 85, 0.1)' }}></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2" style={{ color: '#c9a655' }}>
                              <Sparkles size={16} className="animate-pulse" />
                              <span className="text-xs font-bold uppercase tracking-wide">Dica Pro</span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                             Use <span className="font-mono bg-white/10 px-1 rounded text-[10px]" style={{ color: 'var(--color-text-main)' }}>Ctrl+F</span> para focar na busca rapidamente.
                          </p>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 z-0">
        <div className="mb-10 relative group rounded-[2rem] overflow-hidden animate-fade-in">
            <div className="absolute inset-0 opacity-60 dark:opacity-40 transition-opacity duration-500 group-hover:opacity-80" style={{ background: 'linear-gradient(to right, rgba(10, 30, 61, 0.15), rgba(201, 166, 85, 0.08), transparent)' }}></div>
            <div className="absolute -right-20 -bottom-40 w-96 h-96 rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}></div>

            <div className="relative z-10 p-8 md:p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 backdrop-blur-sm">
                <div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 drop-shadow-sm" style={{ color: 'var(--color-text-main)' }}>{t('dashboard.title')}</h2>
                    <p className="text-base max-w-lg leading-relaxed font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Explore, visualize e baixe todos os materiais disponíveis para o seu perfil.
                    </p>
                </div>

                <div className="relative w-full xl:w-96 group/search">
                    <div className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-focus-within/search:opacity-50 transition-opacity duration-500" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}></div>
                    <div className="relative backdrop-blur-xl border border-white/10 rounded-2xl flex items-center shadow-inner transition-all duration-300 group-focus-within/search:shadow-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 60%, transparent)' }}>
                        <div className="pl-5 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            className="w-full bg-transparent border-none py-4 px-4 placeholder-gray-400 focus:ring-0 text-sm font-medium outline-none"
                            style={{ color: 'var(--color-text-main)' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 backdrop-blur-sm border border-white/5 rounded-[2rem] animate-fade-in text-center px-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 20%, transparent)' }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/5 ring-4" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
              <Filter size={32} className="opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Nenhum resultado encontrado</h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>{t('no.materials')}</p>

            {(searchTerm || filterType !== 'all') && (
              <button onClick={() => { setSearchTerm(''); setFilterType('all'); }} className="mt-8 px-8 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95 text-white" style={{ backgroundColor: 'var(--color-text-main)' }}>
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {filteredMaterials.map((mat, index) => (
              <div key={mat.id} className="animate-slide-up" style={{ animationDelay: `${index * 70}ms` }}>
                <MaterialCard material={mat} onView={handleViewMaterial} />
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingMaterial && (
        <ViewerModal material={viewingMaterial.mat} language={viewingMaterial.lang} onClose={() => setViewingMaterial(null)} />
      )}
    </div>
  );
};
