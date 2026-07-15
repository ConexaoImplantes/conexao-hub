import React from 'react';
import { Material, Language, UserProgress } from '../../types';
import { FileText, Image as ImageIcon, Video, ChevronRight, CheckCircle, PlayCircle, Star, Tag, Headphones, Globe } from 'lucide-react';
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

  const handleOpen = () => {
    if (material.assets[language]) {
      onView(material, language);
      return;
    }
    // fallback to any available language
    const fallback = (['pt-br', 'en-us', 'es-es'] as Language[]).find(l => !!material.assets[l]);
    if (fallback) onView(material, fallback);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="group relative backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col text-left w-full cursor-pointer"
      style={{
        backgroundColor: colorMix('var(--color-surface)', 40, 'rgba(30,41,59,0.4)'),
        border: `1px solid ${colorMix('var(--color-border)', 20, 'rgba(255,255,255,0.08)')}`,
        minHeight: '260px',
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

        <div className="mt-auto pt-4 flex items-center justify-end transition-colors" style={{ borderTop: `1px solid ${colorMix('var(--color-border)', 15, 'rgba(255,255,255,0.06)')}` }}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-transform duration-500 group-hover:translate-x-1" style={{ color: 'var(--color-accent)' }}>
            {t('view')}
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </button>
  );
};
