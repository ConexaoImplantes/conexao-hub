import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useShortcuts } from '../contexts/ShortcutContext';
import { mockDb } from '../lib/mockDb';
import { Material, Language, MaterialType, UserProgress, Collection, getUserLevel, getNextLevelThreshold } from '../types';
import { MaterialCard } from '../components/hub/MaterialCard';
import { CollectionCard } from '../components/hub/CollectionCard';
import { ViewerModal } from '../components/hub/ViewerModal';
import { SkeletonCardGrid } from '../components/hub/SkeletonCard';
import { usePagination } from '../hooks/usePagination';
import {
  Search, Grid, FileText, Image as ImageIcon, Video, Filter, ChevronRight, ChevronLeft,
  Layers, Sparkles, BookOpen, Tag, Star, ArrowLeft, Trophy, CheckCircle, PlayCircle, Lock,
  Headphones, Globe, ChevronUp, ChevronDown
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { TrailCompletionCelebration } from '../components/hub/TrailCompletionCelebration';
import { colorMix } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { user, addUserPoints } = useAuth();
  const { t, language } = useLanguage();
  const { registerShortcut, unregisterShortcut } = useShortcuts();
  const searchRef = useRef<HTMLInputElement>(null);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [collectionItemMap, setCollectionItemMap] = useState<Record<string, string[]>>({});
  const [collectionMaterialsMap, setCollectionMaterialsMap] = useState<Record<string, Material[]>>({});
  const [viewingMaterial, setViewingMaterial] = useState<{ mat: Material, lang: Language, collectionId?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MaterialType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterTag, setFilterTag] = useState<string>('');
  const [activeView, setActiveView] = useState<'materials' | 'collections' | 'collection-detail'>('materials');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [celebration, setCelebration] = useState<{ trailName: string; bonusXp: number } | null>(null);

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
        // Fetch items + materials for each collection
        Promise.all(cols.map(c => mockDb.getCollectionItems(c.id).then(items => ({
          id: c.id,
          materialIds: items.map(i => i.materialId),
          mats: items.map(i => i.material).filter(Boolean) as Material[],
        }))))
          .then(results => {
            const idMap: Record<string, string[]> = {};
            const matMap: Record<string, Material[]> = {};
            results.forEach(r => { idMap[r.id] = r.materialIds; matMap[r.id] = r.mats; });
            setCollectionItemMap(idMap);
            setCollectionMaterialsMap(matMap);
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

  const hasFullAccess = user?.role === 'super_admin' || user?.role === 'manager';
  const filteredMaterials = useMemo(() => {
    return materials.filter(mat => {
      if (!hasFullAccess && !mat.allowedRoles.includes(user?.role as any)) return false;

      if (user?.allowedTypes && user.allowedTypes.length > 0) {
        if (!user.allowedTypes.includes(mat.type)) return false;
      }
      // Only show materials that have an asset for the user's current language
      if (!mat.assets[language]) return false;
      const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '';
      const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || mat.type === filterType;
      const matchesTag = !filterTag || mat.tags.includes(filterTag);
      return matchesSearch && matchesType && matchesTag;
    }).sort((a, b) => {
      const titleA = (a.title[language] || a.title['pt-br'] || '').toLowerCase();
      const titleB = (b.title[language] || b.title['pt-br'] || '').toLowerCase();
      return sortOrder === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
    });
  }, [materials, searchTerm, filterType, filterTag, sortOrder, language, user]);

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
      if (!hasFullAccess && !mat.allowedRoles.includes(user?.role as any)) return false;
      if (user?.allowedTypes && user.allowedTypes.length > 0 && !user.allowedTypes.includes(mat.type)) return false;
      if (!mat.assets[language]) return false;
      return true;
    });
    return {
      all: base.length,
      pdf: base.filter(m => m.type === 'pdf').length,
      image: base.filter(m => m.type === 'image').length,
      video: base.filter(m => m.type === 'video').length,
      audio: base.filter(m => m.type === 'audio').length,
      html: base.filter(m => m.type === 'html').length,
    };
  }, [materials, user, language]);

  // Language-scoped views for trails: only materials with an asset in the current language count
  const langCollectionItemMap = useMemo(() => {
    const out: Record<string, string[]> = {};
    Object.entries(collectionItemMap).forEach(([colId, ids]) => {
      out[colId] = ids.filter(mid => {
        const mat = (collectionMaterialsMap[colId] || []).find(m => m.id === mid);
        return mat ? !!mat.assets[language] : false;
      });
    });
    return out;
  }, [collectionItemMap, collectionMaterialsMap, language]);

  const langCollectionMaterialsMap = useMemo(() => {
    const out: Record<string, Material[]> = {};
    Object.entries(collectionMaterialsMap).forEach(([colId, mats]) => {
      out[colId] = mats.filter(m => !!m.assets[language]);
    });
    return out;
  }, [collectionMaterialsMap, language]);

  const visibleCollections = useMemo(
    () => collections.filter(c => (langCollectionMaterialsMap[c.id] || []).length > 0),
    [collections, langCollectionMaterialsMap]
  );

  const handleViewMaterial = (mat: Material, lang: Language) => {
    const currentCollectionId = activeView === 'collection-detail' ? selectedCollection?.id : undefined;
    // Abre o material IMEDIATAMENTE — o rastreamento roda em background para
    // que nenhuma chamada de rede atrase (ou impeça) a abertura no 1º clique.
    setViewingMaterial({ mat, lang, collectionId: currentCollectionId });

    if (!user) return;
    const existing = userProgress.find(p => p.materialId === mat.id && p.collectionId === currentCollectionId);
    if (existing) return;

    setUserProgress(prev => [...prev, { id: '', userId: user.id, materialId: mat.id, collectionId: currentCollectionId, status: 'started', createdAt: new Date().toISOString() }]);

    void (async () => {
      try {
        mockDb.logAccess(mat.id, user.id, lang, user.role);
        await mockDb.upsertProgress(user.id, mat.id, 'started', currentCollectionId);
        if (mat.points > 0) {
          const startXp = Math.floor(mat.points * 0.3);
          await mockDb.addPoints(user.id, startXp);
          addUserPoints(startXp);
        }
      } catch (e) {
        console.error('[progress] falha ao registrar início do material', e);
      }
    })();
  };


  const handleCloseViewer = () => {
    const current = viewingMaterial;
    // Fecha na hora; a conclusão/XP é persistida em background.
    setViewingMaterial(null);
    if (!current || !user) return;

    const mat = current.mat;
    const colId = current.collectionId;
    const existing = userProgress.find(p => p.materialId === mat.id && p.collectionId === colId);
    if (existing?.status === 'completed') return;

    setUserProgress(prev => {
      const filtered = prev.filter(p => !(p.materialId === mat.id && p.collectionId === colId));
      return [...filtered, { id: existing?.id || '', userId: user.id, materialId: mat.id, collectionId: colId, status: 'completed' as const, completedAt: new Date().toISOString(), createdAt: existing?.createdAt || new Date().toISOString() }];
    });

    if (colId && selectedCollection) {
      const materialIds = collectionItemMap[selectedCollection.id] || [];
      const updatedCompleted = userProgress.filter(p => p.status === 'completed' && p.collectionId === colId && materialIds.includes(p.materialId) && p.materialId !== mat.id).length + 1;
      if (updatedCompleted >= materialIds.length && materialIds.length > 0) {
        const trailTitle = selectedCollection.title[language] || selectedCollection.title['pt-br'] || 'Trilha';
        setCelebration({ trailName: trailTitle, bonusXp: selectedCollection.points });
      }
    }

    void (async () => {
      try {
        await mockDb.upsertProgress(user.id, mat.id, 'completed', colId);
        if (mat.points > 0) {
          const remainingXp = mat.points - Math.floor(mat.points * 0.3);
          await mockDb.addPoints(user.id, remainingXp);
          addUserPoints(remainingXp);
        }
        if (colId && selectedCollection) {
          const materialIds = collectionItemMap[selectedCollection.id] || [];
          const updatedCompleted = userProgress.filter(p => p.status === 'completed' && p.collectionId === colId && materialIds.includes(p.materialId) && p.materialId !== mat.id).length + 1;
          if (updatedCompleted >= materialIds.length && materialIds.length > 0 && selectedCollection.points > 0) {
            await mockDb.addPoints(user.id, selectedCollection.points);
            addUserPoints(selectedCollection.points);
          }
        }
      } catch (e) {
        console.error('[progress] falha ao registrar conclusão do material', e);
      }
    })();
  };


  const userLevel = getUserLevel(user?.points || 0);
  const nextThreshold = getNextLevelThreshold(user?.points || 0);
  const levelProgress = nextThreshold > 0 ? Math.min(100, Math.round(((user?.points || 0) / nextThreshold) * 100)) : 100;

  const MenuCategory = ({ type, icon: Icon, label, count, active }: { type: MaterialType | 'all', icon: any, label: string, count: number, active: boolean }) => (
    <button
      onClick={() => setFilterType(type)}
      className={`group relative w-full text-left px-2.5 py-2.5 md:px-4 md:py-3.5 rounded-xl md:rounded-2xl flex items-center justify-between transition-all duration-500 ease-out overflow-hidden
        ${active ? 'liquid-glass-gold md:translate-x-2' : 'bg-transparent hover:opacity-80'}
      `}
      style={!active ? { color: 'var(--color-text-muted)' } : {}}
    >
      <div className="flex items-center gap-2 md:gap-4 relative z-10">
        <div className={`icon-box transition-all duration-300 ${active ? '!bg-white/10 !border-transparent' : ''}`}>
          <Icon size={16} className="md:hidden" />
          <Icon size={18} className="hidden md:block" />
        </div>
        <span className={`text-xs md:text-sm tracking-wide whitespace-nowrap ${active ? 'font-bold' : 'font-medium'}`} style={active ? { color: 'var(--color-text-main)' } : {}}>{label}</span>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg transition-all duration-300 ${active ? 'bg-white/10 backdrop-blur-sm' : 'border'}`} style={active ? { color: 'var(--color-accent)' } : { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
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
            <div data-tour="user-level-card" className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: colorMix('var(--color-surface)', 40, 'rgba(30,41,59,0.4)') }}>
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{t('level')} {userLevel}</span>
                <span className="ml-auto text-xs font-bold" style={{ color: 'var(--color-accent)' }}>{user.points} XP</span>
              </div>
              <Progress value={levelProgress} className="h-1.5" />
              <p className="text-[10px] mt-1.5 text-right" style={{ color: 'var(--color-text-muted)' }}>
                {t('next')}: {nextThreshold} XP
              </p>
            </div>
          )}

          {/* View toggle */}
          <div data-tour="view-toggle" className="flex rounded-xl overflow-hidden border border-white/10" style={{ backgroundColor: colorMix('var(--color-surface)', 40, 'rgba(30,41,59,0.4)') }}>
            <button
              onClick={() => setActiveView('materials')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all rounded-lg ${activeView === 'materials' ? 'liquid-glass-gold' : ''}`}
              style={activeView === 'materials' ? { color: 'var(--color-accent)' } : { color: 'var(--color-text-muted)' }}
            >
              <Grid size={14} /> {t('tab.materials')}
            </button>
            <button
              onClick={() => setActiveView('collections')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all rounded-lg ${activeView === 'collections' ? 'liquid-glass-gold' : ''}`}
              style={activeView === 'collections' ? { color: 'var(--color-accent)' } : { color: 'var(--color-text-muted)' }}
            >
              <BookOpen size={14} /> {t('tab.collections')}
            </button>
          </div>

          {/* Material filters (only in materials view) */}
          {activeView === 'materials' && (
            <div data-tour="material-filters" className="backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-3xl flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 sm:gap-2 no-scrollbar shadow-xl shadow-black/5" style={{ backgroundColor: colorMix('var(--color-surface)', 30, 'rgba(30,41,59,0.3)') }}>
              <div className="hidden md:flex items-center justify-between px-4 py-3 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                  <Layers size={14} style={{ color: 'var(--color-accent)' }} /> {t('library')}
                </h3>
              </div>
              <div className="shrink-0 md:shrink md:min-w-0 md:flex-1"><MenuCategory type="all" icon={Grid} label={t('filter.all')} count={counts.all} active={filterType === 'all'} /></div>
              <div className="shrink-0 md:shrink md:min-w-0 md:flex-1"><MenuCategory type="pdf" icon={FileText} label={t('filter.pdf')} count={counts.pdf} active={filterType === 'pdf'} /></div>
              <div className="shrink-0 md:shrink md:min-w-0 md:flex-1"><MenuCategory type="image" icon={ImageIcon} label={t('filter.image')} count={counts.image} active={filterType === 'image'} /></div>
              <div className="shrink-0 md:shrink md:min-w-0 md:flex-1"><MenuCategory type="video" icon={Video} label={t('filter.video')} count={counts.video} active={filterType === 'video'} /></div>
              <div className="shrink-0 md:shrink md:min-w-0 md:flex-1"><MenuCategory type="audio" icon={Headphones} label={t('filter.audio')} count={counts.audio} active={filterType === 'audio'} /></div>
              <div className="shrink-0 md:shrink md:min-w-0 md:flex-1"><MenuCategory type="html" icon={Globe} label={t('filter.html')} count={counts.html} active={filterType === 'html'} /></div>

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
                        className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${filterTag === tag ? 'liquid-glass-gold' : ''}`}
                        style={filterTag === tag
                          ? { color: 'var(--color-accent)' }
                          : { backgroundColor: colorMix('var(--color-accent)', 10, 'rgba(201,166,85,0.1)'), color: 'var(--color-accent)' }
                        }
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="hidden md:block mt-4 pt-4 px-2 border-t border-white/5">
          <div className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-300 hover:shadow-lg" style={{ background: `linear-gradient(to br, ${colorMix('var(--color-warning)', 10, 'rgba(234,179,8,0.1)')}, ${colorMix('var(--color-warning)', 5, 'rgba(234,179,8,0.05)')})`, border: `1px solid ${colorMix('var(--color-warning)', 20, 'rgba(234,179,8,0.2)')}` }}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-colors duration-500" style={{ backgroundColor: colorMix('var(--color-warning)', 20, 'rgba(234,179,8,0.2)') }}></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-warning)' }}>
                      <Sparkles size={16} className="animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wide">{t('pro.tip')}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="font-mono bg-white/10 px-1 rounded text-[10px]" style={{ color: 'var(--color-text-main)' }}>Ctrl+F</span> {t('pro.tip.search')}{' '}
                      <span className="font-mono bg-white/10 px-1 rounded text-[10px]" style={{ color: 'var(--color-text-main)' }}>?</span> {t('pro.tip.shortcuts')}
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

        {/* ─── Collection Detail View ─── */}
        {activeView === 'collection-detail' && selectedCollection && (() => {
          const colMaterials = langCollectionMaterialsMap[selectedCollection.id] || [];
          const materialIds = langCollectionItemMap[selectedCollection.id] || [];
          const completedCount = userProgress.filter(p => p.status === 'completed' && p.collectionId === selectedCollection.id && materialIds.includes(p.materialId)).length;
          const progressPct = materialIds.length > 0 ? Math.round((completedCount / materialIds.length) * 100) : 0;
          const displayTitle = selectedCollection.title[language] || selectedCollection.title['pt-br'] || '';
          const displayDesc = selectedCollection.description?.[language] || selectedCollection.description?.['pt-br'] || '';

          return (
            <div className="animate-fade-in">
              <button
                onClick={() => { setActiveView('collections'); setSelectedCollection(null); }}
                className="mb-6 flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-70"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ArrowLeft size={16} /> {t('trail.back')}
              </button>

              <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden mb-6 sm:mb-10">
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colorMix('var(--color-accent)', 20, 'rgba(201,166,85,0.2)')}, ${colorMix('var(--color-accent)', 5, 'rgba(201,166,85,0.05)')})` }} />
                {selectedCollection.coverImage && (
                  <img src={selectedCollection.coverImage} alt={displayTitle} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                )}
                <div className="relative z-10 p-5 sm:p-8 md:p-10">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={20} style={{ color: 'var(--color-accent)' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{t('trail.learning')}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-main)' }}>{displayTitle}</h2>
                  {displayDesc && <p className="text-base mb-6 max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>{displayDesc}</p>}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="space-y-2 flex-1 min-w-[200px]">
                      <div className="flex justify-between text-sm font-medium">
                        <span style={{ color: 'var(--color-text-muted)' }}>{completedCount} {t('progress.of')} {materialIds.length} {t('progress.completed.items')}</span>
                        <span style={{ color: 'var(--color-accent)' }}>{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>
                    {selectedCollection.points > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: colorMix('var(--color-accent)', 15, 'rgba(201,166,85,0.15)'), color: 'var(--color-accent)' }}>
                        <Star size={16} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
                        {selectedCollection.points} {t('trail.xp.on.complete')}
                      </div>
                    )}
                    {progressPct === 100 && materialIds.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                        <Trophy size={16} /> {t('trail.completed')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {colMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] border border-white/5 text-center" style={{ backgroundColor: colorMix('var(--color-surface)', 20, 'rgba(30,41,59,0.2)') }}>
                  <BookOpen size={40} className="mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('trail.no.materials')}</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 pb-20">
                  {colMaterials.map((mat, idx) => {
                    const prog = userProgress.find(p => p.materialId === mat.id && p.collectionId === selectedCollection.id);
                    const availableLang: Language = mat.assets[language] ? language : (['pt-br', 'en-us', 'es-es'] as Language[]).find(l => mat.assets[l]?.url) || language;
                    const matTitle = mat.title[language] || mat.title['pt-br'] || t('untitled');
                    return (
                      <div key={mat.id} className="flex flex-row items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 transition-all hover:border-[var(--color-accent)]/30" style={{ backgroundColor: colorMix('var(--color-surface)', 50, 'rgba(30,41,59,0.5)') }}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-xs sm:text-sm"
                          style={prog?.status === 'completed'
                            ? { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }
                            : { backgroundColor: colorMix('var(--color-accent)', 10, 'rgba(201,166,85,0.1)'), color: 'var(--color-accent)' }
                          }>
                          {prog?.status === 'completed' ? <CheckCircle size={18} /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold truncate" style={{ color: 'var(--color-text-main)' }}>{matTitle}</p>
                          <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
                            <span className="text-[10px] sm:text-xs uppercase font-bold" style={{ color: 'var(--color-text-muted)' }}>{mat.type}</span>
                            {mat.points > 0 && (
                              <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                                <Star size={10} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />{mat.points} XP
                              </span>
                            )}
                            {prog?.status === 'completed' && <span className="text-[10px] sm:text-xs font-bold" style={{ color: 'var(--color-success)' }}>{t('progress.completed')}</span>}
                            {prog?.status === 'started' && (
                              <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
                                <PlayCircle size={10} /> {t('progress.in.progress')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleViewMaterial(mat, availableLang)}
                          className="liquid-glass-gold flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all hover:opacity-80 active:scale-95 whitespace-nowrap shrink-0"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {prog?.status === 'completed' ? t('progress.review') : prog?.status === 'started' ? t('progress.continue') : t('progress.start')}
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ─── Collections grid ─── */}
        {activeView === 'collections' && (
          <>
            <div className="mb-6 sm:mb-10 relative group rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden animate-fade-in">
              <div className="absolute inset-0 opacity-60" style={{ background: `linear-gradient(to right, ${colorMix('var(--color-accent)', 10, 'rgba(201,166,85,0.1)')}, ${colorMix('var(--color-gradient-mid)', 10, 'rgba(232,212,139,0.1)')}, transparent)` }} />
              <div className="relative z-10 p-5 sm:p-8 md:p-10">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ color: 'var(--color-text-main)' }}>{t('trails.title')}</h2>
                <p className="text-sm sm:text-base max-w-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('trails.desc')}</p>
              </div>
            </div>
            {isLoading ? (
              <SkeletonCardGrid count={6} />
            ) : visibleCollections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-[2rem] text-center px-4 border border-white/5" style={{ backgroundColor: colorMix('var(--color-surface)', 20, 'rgba(30,41,59,0.2)') }}>
                <BookOpen size={48} className="mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>{t('trail.no.available')}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('trail.no.available.desc')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {visibleCollections.map((col, i) => (
                  <div key={col.id} data-tour={i === 0 ? 'collection-card' : undefined} className="animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
                    <CollectionCard
                      collection={col}
                      userProgress={userProgress}
                      materialIds={langCollectionItemMap[col.id] || []}
                      onClick={(c) => { setSelectedCollection(c); setActiveView('collection-detail'); }}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Materials view ─── */}
        {activeView === 'materials' && (
          <>
            <div className="mb-6 sm:mb-10 relative group rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden animate-fade-in">
              <div className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-80" style={{ background: `linear-gradient(to right, ${colorMix('var(--color-accent)', 10, 'rgba(201,166,85,0.1)')}, ${colorMix('var(--color-gradient-mid)', 10, 'rgba(232,212,139,0.1)')}, transparent)` }} />
              <div className="absolute -right-20 -bottom-40 w-96 h-96 rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: colorMix('var(--color-accent)', 20, 'rgba(201,166,85,0.2)') }} />
              <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 sm:gap-8 backdrop-blur-sm">
                <div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 drop-shadow-sm" style={{ color: 'var(--color-text-main)' }}>{t('dashboard.title')}</h2>
                  <p className="text-sm sm:text-base max-w-lg leading-relaxed font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('dashboard.desc')}</p>
                </div>
                <div data-tour="search-input" className="relative w-full xl:w-96 group/search">
                   <div className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-focus-within/search:opacity-50 transition-opacity duration-500" style={{ backgroundColor: colorMix('var(--color-accent)', 20, 'rgba(201,166,85,0.2)') }} />
                  <div className="relative backdrop-blur-xl border border-white/10 rounded-2xl flex items-center shadow-inner transition-all duration-300 group-focus-within/search:shadow-lg" style={{ backgroundColor: colorMix('var(--color-surface)', 60, 'rgba(30,41,59,0.6)') }}>
                    <div className="pl-4 sm:pl-5" style={{ color: 'var(--color-text-muted)' }}><Search size={20} className="sm:hidden" /><Search size={22} className="hidden sm:block" /></div>
                    <input ref={searchRef} type="text" placeholder={t('search.placeholder')} className="w-full bg-transparent border-none py-3 sm:py-4 px-3 sm:px-4 focus:ring-0 text-sm font-medium outline-none" style={{ color: 'var(--color-text-main)' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2.5 sm:p-3 rounded-xl transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-bold whitespace-nowrap backdrop-blur-xl border border-white/10"
                  style={{ backgroundColor: colorMix('var(--color-surface)', 60, 'rgba(30,41,59,0.6)'), color: 'var(--color-accent)' }}
                  title={sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                >
                  {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
                </button>
              </div>
            </div>
            {isLoading ? (
              <SkeletonCardGrid count={12} />
            ) : filteredMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 backdrop-blur-sm border border-white/5 rounded-[2rem] animate-fade-in text-center px-4" style={{ backgroundColor: colorMix('var(--color-surface)', 20, 'rgba(30,41,59,0.2)') }}>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                  <Filter size={32} className="opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>{t('no.results')}</h3>
                <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>{t('no.materials')}</p>
                {(searchTerm || filterType !== 'all' || filterTag) && (
                  <button onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterTag(''); }} className="mt-8 px-8 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95" style={{ backgroundColor: colorMix('var(--color-bg)', 80, 'rgba(15,23,42,0.8)'), border: `1px solid ${colorMix('var(--color-accent)', 25, 'rgba(201,166,85,0.25)')}`, color: 'var(--color-accent)' }}>
                    {t('clear.filters')}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                  {paginatedMaterials.map((mat, index) => (
                    <div key={mat.id} data-tour={index === 0 ? 'material-card' : undefined} className="animate-slide-up" style={{ animationDelay: `${index * 70}ms` }}>
                      <MaterialCard material={mat} onView={handleViewMaterial} progress={userProgress.find(p => p.materialId === mat.id && !p.collectionId)} />
                    </div>

                  ))}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <button onClick={pagination.prevPage} disabled={!pagination.hasPrev} className="p-2 rounded-lg transition-all disabled:opacity-30" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}><ChevronLeft size={18} /></button>
                    {pagination.pageNumbers.map(page => (
                      <button key={page} onClick={() => pagination.setPage(page)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${page === pagination.currentPage ? 'liquid-glass-gold' : ''}`} style={page === pagination.currentPage ? { color: 'var(--color-accent)' } : { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>{page}</button>
                    ))}
                    <button onClick={pagination.nextPage} disabled={!pagination.hasNext} className="p-2 rounded-lg transition-all disabled:opacity-30" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}><ChevronRight size={18} /></button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {viewingMaterial && (
        <ViewerModal material={viewingMaterial.mat} language={viewingMaterial.lang} onClose={handleCloseViewer} />
      )}

      <TrailCompletionCelebration
        isOpen={!!celebration}
        trailName={celebration?.trailName || ''}
        bonusXp={celebration?.bonusXp || 0}
        onClose={() => setCelebration(null)}
      />
    </div>
  );
};
