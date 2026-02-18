import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useShortcuts } from '../contexts/ShortcutContext';
import { mockDb } from '../lib/mockDb';
import { Material, Language, MaterialType, UserProgress, getUserLevel, getNextLevelThreshold } from '../types';
import { MaterialCard } from '../components/hub/MaterialCard';
import { CollectionCard } from '../components/hub/CollectionCard';
import { ViewerModal } from '../components/hub/ViewerModal';
import { SkeletonCardGrid } from '../components/hub/SkeletonCard';
import { usePagination } from '../hooks/usePagination';
import {
  Search, Grid, FileText, Image as ImageIcon, Video, Filter, ChevronRight, ChevronLeft,
  Layers, Sparkles, BookOpen, Tag, Star
} from 'lucide-react';
import { Collection } from '../types';
import { Progress } from '../components/ui/progress';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { registerShortcut, unregisterShortcut } = useShortcuts();
  const searchRef = useRef<HTMLInputElement>(null);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [collectionItemMap, setCollectionItemMap] = useState<Record<string, string[]>>({});
  const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MaterialType | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string>('');
  const [activeView, setActiveView] = useState<'materials' | 'collections'>('materials');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([
        mockDb.getMaterials(user.role),
        mockDb.getCollections(user.role),
        mockDb.getUserProgress(user.id),
      ]).then(([mats, cols, progress]) => {
        setMaterials(mats);
        setCollections(cols);
        setUserProgress(progress);
        // Fetch items for each collection
        Promise.all(cols.map(c => mockDb.getCollectionItems(c.id).then(items => ({ id: c.id, materialIds: items.map(i => i.materialId) }))))
          .then(results => {
            const map: Record<string, string[]> = {};
            results.forEach(r => { map[r.id] = r.materialIds; });
            setCollectionItemMap(map);
          });
      }).finally(() => setIsLoading(false));
    }
  }, [user]);

  // Register keyboard shortcut for search
  useEffect(() => {
    registerShortcut('search', {
      key: 'f',
      ctrl: true,
      description: 'Focar na busca',
      action: () => searchRef.current?.focus(),
    });
    registerShortcut('escape', {
      key: 'Escape',
      description: 'Fechar modal / limpar busca',
      action: () => {
        if (viewingMaterial) setViewingMaterial(null);
        else { setSearchTerm(''); setFilterType('all'); setFilterTag(''); }
      },
    });
    return () => {
      unregisterShortcut('search');
      unregisterShortcut('escape');
    };
  }, [registerShortcut, unregisterShortcut, viewingMaterial]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      if (!mat.allowedRoles.includes(user?.role as any)) return false;
      if (user?.allowedTypes && user.allowedTypes.length > 0) {
        if (!user.allowedTypes.includes(mat.type)) return false;
      }
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;
      const matchesTag = !filterTag || mat.tags.includes(filterTag);
      return matchesSearch && matchesType && matchesTag;
    });
  }, [materials, searchTerm, filterType, filterTag, language, user]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    materials.forEach(m => m.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [materials]);

  const pagination = usePagination({
    totalItems: filteredMaterials.length,
    itemsPerPage: 12,
    resetDeps: [searchTerm, filterType, filterTag],
  });

  const paginatedMaterials = filteredMaterials.slice(pagination.startIndex, pagination.endIndex);

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
      video: base.filter(m => m.type === 'video').length,
    };
  }, [materials, user]);

  const handleViewMaterial = async (mat: Material, lang: Language) => {
    if (user) {
      mockDb.logAccess(mat.id, user.id, lang);
      // Mark as started / award XP on first view
      const existing = userProgress.find(p => p.materialId === mat.id);
      if (!existing) {
        await mockDb.upsertProgress(user.id, mat.id, 'started');
        if (mat.points > 0) await mockDb.addPoints(user.id, Math.floor(mat.points * 0.3));
        setUserProgress(prev => [...prev, { id: '', userId: user.id, materialId: mat.id, status: 'started', createdAt: new Date().toISOString() }]);
      }
    }
    setViewingMaterial({ mat, lang });
  };

  const userLevel = getUserLevel(user?.points || 0);
  const nextThreshold = getNextLevelThreshold(user?.points || 0);
  const levelProgress = nextThreshold > 0 ? Math.min(100, Math.round(((user?.points || 0) / nextThreshold) * 100)) : 100;

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
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-300 ${active ? 'bg-white/20 text-white backdrop-blur-sm' : 'border'}`} style={!active ? { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' } : {}}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">
      {/* Sidebar */}
      <aside className="w-full md:w-72 shrink-0 z-30">
        <div className="sticky top-28 space-y-4 animate-slide-up">
          {/* Gamification card */}
          {user && (
            <div className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 40%, transparent)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Nível {userLevel}</span>
                <span className="ml-auto text-xs font-bold" style={{ color: 'var(--color-accent)' }}>{user.points} XP</span>
              </div>
              <Progress value={levelProgress} className="h-1.5" />
              <p className="text-[10px] mt-1.5 text-right" style={{ color: 'var(--color-text-muted)' }}>
                Próximo: {nextThreshold} XP
              </p>
            </div>
          )}

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/10" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 40%, transparent)' }}>
            <button
              onClick={() => setActiveView('materials')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all"
              style={activeView === 'materials' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-muted)' }}
            >
              <Grid size={14} /> Materiais
            </button>
            <button
              onClick={() => setActiveView('collections')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all"
              style={activeView === 'collections' ? { backgroundColor: 'var(--color-accent)', color: 'white' } : { color: 'var(--color-text-muted)' }}
            >
              <BookOpen size={14} /> Trilhas
            </button>
          </div>

          {/* Material filters (only in materials view) */}
          {activeView === 'materials' && (
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

              {/* Tag filter */}
              {allTags.length > 0 && (
                <div className="hidden md:block mt-2 pt-4 px-2 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <Tag size={10} /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                        className="px-2 py-0.5 rounded-full text-xs font-bold transition-all"
                        style={filterTag === tag
                          ? { backgroundColor: 'var(--color-accent)', color: 'white' }
                          : { backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }
                        }
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="hidden md:block mt-4 pt-4 px-2 border-t border-white/5">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 group transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/40">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 mb-2">
                      <Sparkles size={16} className="animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wide">Dica Pro</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      Use <span className="font-mono bg-white/10 px-1 rounded text-[10px]" style={{ color: 'var(--color-text-main)' }}>Ctrl+F</span> para focar na busca rapidamente.
                      Pressione <span className="font-mono bg-white/10 px-1 rounded text-[10px]" style={{ color: 'var(--color-text-main)' }}>?</span> para ver todos os atalhos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 z-0">
        {/* Header */}
        <div className="mb-10 relative group rounded-[2rem] overflow-hidden animate-fade-in">
          <div className="absolute inset-0 opacity-60 dark:opacity-40 transition-opacity duration-500 group-hover:opacity-80" style={{ background: `linear-gradient(to right, color-mix(in srgb, var(--color-accent) 10%, transparent), rgba(168,85,247,0.1), transparent)` }}></div>
          <div className="absolute -right-20 -bottom-40 w-96 h-96 rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}></div>
          <div className="relative z-10 p-8 md:p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 backdrop-blur-sm">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 drop-shadow-sm" style={{ color: 'var(--color-text-main)' }}>
                {activeView === 'collections' ? 'Trilhas de Aprendizagem' : t('dashboard.title')}
              </h2>
              <p className="text-base max-w-lg leading-relaxed font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {activeView === 'collections'
                  ? 'Complete trilhas, acumule XP e avance de nível.'
                  : 'Explore, visualize e baixe todos os materiais disponíveis para o seu perfil.'}
              </p>
            </div>

            {activeView === 'materials' && (
              <div className="relative w-full xl:w-96 group/search">
                <div className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-focus-within/search:opacity-50 transition-opacity duration-500" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}></div>
                <div className="relative backdrop-blur-xl border border-white/10 rounded-2xl flex items-center shadow-inner transition-all duration-300 group-focus-within/search:shadow-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 60%, transparent)' }}>
                  <div className="pl-5 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                    <Search size={22} />
                  </div>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder={t('search.placeholder')}
                    className="w-full bg-transparent border-none py-4 px-4 placeholder-gray-400 focus:ring-0 text-sm font-medium outline-none"
                    style={{ color: 'var(--color-text-main)' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collections view */}
        {activeView === 'collections' && (
          isLoading ? (
            <SkeletonCardGrid count={6} />
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-[2rem] text-center px-4 border border-white/5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 20%, transparent)' }}>
              <BookOpen size={48} className="mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Nenhuma trilha disponível</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>As trilhas de aprendizagem serão exibidas aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {collections.map((col, i) => (
                <div key={col.id} className="animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
                  <CollectionCard
                    collection={col}
                    userProgress={userProgress}
                    materialIds={collectionItemMap[col.id] || []}
                    onClick={() => setActiveView('materials')}
                  />
                </div>
              ))}
            </div>
          )
        )}

        {/* Materials view */}
        {activeView === 'materials' && (
          <>
            {isLoading ? (
              <SkeletonCardGrid count={12} />
            ) : filteredMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 backdrop-blur-sm border border-white/5 rounded-[2rem] animate-fade-in text-center px-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 20%, transparent)' }}>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                  <Filter size={32} className="opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Nenhum resultado encontrado</h3>
                <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>{t('no.materials')}</p>
                {(searchTerm || filterType !== 'all' || filterTag) && (
                  <button onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterTag(''); }} className="mt-8 px-8 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95 text-white" style={{ backgroundColor: 'var(--color-text-main)' }}>
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                  {paginatedMaterials.map((mat, index) => (
                    <div key={mat.id} className="animate-slide-up" style={{ animationDelay: `${index * 70}ms` }}>
                      <MaterialCard
                        material={mat}
                        onView={handleViewMaterial}
                        progress={userProgress.find(p => p.materialId === mat.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <button
                      onClick={pagination.prevPage}
                      disabled={!pagination.hasPrev}
                      className="p-2 rounded-lg transition-all disabled:opacity-30"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {pagination.pageNumbers.map(page => (
                      <button
                        key={page}
                        onClick={() => pagination.setPage(page)}
                        className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
                        style={page === pagination.currentPage
                          ? { backgroundColor: 'var(--color-accent)', color: 'white' }
                          : { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }
                        }
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={pagination.nextPage}
                      disabled={!pagination.hasNext}
                      className="p-2 rounded-lg transition-all disabled:opacity-30"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {viewingMaterial && (
        <ViewerModal material={viewingMaterial.mat} language={viewingMaterial.lang} onClose={() => setViewingMaterial(null)} />
      )}
    </div>
  );
};
