import React from 'react';
import { Material, Language, UserProgress } from '../../types';
import { FileText, Image as ImageIcon, Video, Eye, Lock, ChevronRight, CheckCircle, PlayCircle, Star, Tag, Headphones, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { colorMix } from '../../lib/utils';

interface MaterialCardProps {
  material: Material;
  onView: (material: Material, lang: Language) => void;
  progress?: UserProgress;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onView, progress }) => {
  const { t, language } = useLanguage();

  const getIcon = () => {
    switch (material.type) {
      case 'pdf': return <FileText size={24} />;
      case 'image': return <ImageIcon size={24} />;
      case 'video': return <Video size={24} />;
      case 'audio': return <Headphones size={24} />;
      case 'html': return <Globe size={24} />;
    }
  };

  const getLabel = () => {
     switch (material.type) {
      case 'pdf': return t('material.type.pdf');
      case 'image': return t('material.type.image');
      case 'video': return t('material.type.video');
      case 'audio': return t('material.type.audio');
      case 'html': return t('material.type.html');
    }
  }

  const getGradient = () => {
      switch (material.type) {
        case 'pdf': return 'from-amber-600/20 to-yellow-600/5';
        case 'image': return 'from-amber-500/20 to-yellow-500/5';
        case 'video': return 'from-amber-400/20 to-yellow-400/5';
        case 'audio': return 'from-amber-400/20 to-yellow-400/5';
        case 'html': return 'from-teal-500/20 to-cyan-500/5';
        default: return 'from-amber-500/20 to-transparent';
      }
  }


  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || t('untitled');
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];

  return (
    <div
      className="group relative backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
      style={{
        backgroundColor: colorMix('var(--color-surface)', 40, 'rgba(30,41,59,0.4)'),
        border: `1px solid ${colorMix('var(--color-border)', 20, 'rgba(255,255,255,0.08)')}`,
        minHeight: '320px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 30px var(--color-hover-shadow)`;
        e.currentTarget.style.borderColor = `var(--color-hover-border)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = colorMix('var(--color-border)', 20, 'rgba(255,255,255,0.08)');
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden transition-opacity duration-700">
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 animate-shimmer" style={{ left: '-150%' }} />
      </div>

      <div className="p-6 relative z-10 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="icon-box-lg relative group-hover:scale-110 transition-transform duration-500">
                {getIcon()}
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-white/5 rounded-lg backdrop-blur-sm group-hover:bg-[var(--color-surface)] transition-colors" style={{ backgroundColor: colorMix('var(--color-surface)', 50, 'rgba(30,41,59,0.5)'), color: 'var(--color-text-muted)' }}>
            {getLabel()}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight transition-all duration-300 h-[3.25rem]" style={{ color: 'var(--color-text-main)' }} title={displayTitle}>
          {displayTitle}
        </h3>

        {/* Fixed-height metadata zone */}
        <div className="min-h-[3.5rem] mb-1">

        {progress && (
          <div className="mb-2">
            {progress.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <CheckCircle size={10} /> {t('progress.completed')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: colorMix('var(--color-accent)', 15, 'rgba(201,166,85,0.15)'), color: 'var(--color-accent)' }}>
                <PlayCircle size={10} /> {t('progress.in.progress')}
              </span>
            )}
          </div>
        )}

        {material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {material.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: colorMix('var(--color-accent)', 8, 'rgba(201,166,85,0.08)'), color: 'var(--color-text-muted)' }}>
                <Tag size={8} /> {tag}
              </span>
            ))}
          </div>
        )}

        {material.points > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>
            <Star size={10} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} /> {material.points} XP
          </div>
        )}
        </div>

        <div className="mt-auto pt-4 transition-colors" style={{ borderTop: `1px solid ${colorMix('var(--color-border)', 15, 'rgba(255,255,255,0.06)')}` }}>
          <div className="flex items-center justify-between mb-3">
             <p className="text-[10px] uppercase tracking-wider font-bold opacity-70" style={{ color: 'var(--color-text-muted)' }}>{t('versions')}</p>
             <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" style={{ color: 'var(--color-accent)' }}>
                <ChevronRight size={16} />
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {languages.map(lang => {
              const hasAsset = !!material.assets[lang];
              return (
                <button key={lang} onClick={(e) => { e.stopPropagation(); if (hasAsset) onView(material, lang); }} disabled={!hasAsset}
                  className={`relative overflow-hidden px-3 py-1.5 text-xs rounded-lg transition-all duration-300 flex items-center gap-1.5 font-bold group/btn ${hasAsset ? 'border border-transparent hover:border-[var(--color-accent)]/30 hover:shadow-lg' : 'opacity-30 cursor-not-allowed border border-transparent'}`}
                  style={{ backgroundColor: hasAsset ? 'var(--color-bg)' : colorMix('var(--color-bg)', 30, 'rgba(15,23,42,0.3)'), color: hasAsset ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                  {hasAsset && <div className="absolute inset-0 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0" style={{ backgroundColor: 'var(--color-accent)' }}></div>}
                  <span className="relative z-10 flex items-center gap-1 group-hover/btn:text-white">
                      {lang.toUpperCase().split('-')[0]}
                      {hasAsset ? <Eye size={10} /> : <Lock size={10} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
