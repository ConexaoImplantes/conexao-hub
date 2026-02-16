import React from 'react';
import { Material, Language } from '../../types';
import { FileText, Image as ImageIcon, Video, Eye, Lock, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface MaterialCardProps {
  material: Material;
  onView: (material: Material, lang: Language) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onView }) => {
  const { t, language } = useLanguage();

  const getIcon = () => {
    switch (material.type) {
      case 'pdf': return <FileText size={28} className="text-red-500 drop-shadow-lg" />;
      case 'image': return <ImageIcon size={28} className="text-blue-500 drop-shadow-lg" />;
      case 'video': return <Video size={28} className="text-purple-500 drop-shadow-lg" />;
    }
  };

  const getLabel = () => {
     switch (material.type) {
      case 'pdf': return t('material.type.pdf');
      case 'image': return t('material.type.image');
      case 'video': return t('material.type.video');
    }
  }

  const getGradient = () => {
      switch (material.type) {
        case 'pdf': return 'from-red-500/20 to-orange-500/5';
        case 'image': return 'from-blue-500/20 to-cyan-500/5';
        case 'video': return 'from-purple-500/20 to-pink-500/5';
        default: return 'from-blue-500/20 to-transparent';
      }
  }

  const getBorderColor = () => {
     switch (material.type) {
        case 'pdf': return 'group-hover:border-red-500/50 group-hover:shadow-red-500/20';
        case 'image': return 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/20';
        case 'video': return 'group-hover:border-purple-500/50 group-hover:shadow-purple-500/20';
        default: return 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/20';
     }
  }

  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];

  return (
    <div className={`group relative backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${getBorderColor()}`} style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 40%, transparent)' }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden transition-opacity duration-700">
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 animate-shimmer" style={{ left: '-150%' }} />
      </div>

      <div className="p-6 relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-3.5 rounded-2xl shadow-sm border border-white/10 group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)' }}>
                {getIcon()}
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-white/5 rounded-lg backdrop-blur-sm group-hover:bg-[var(--color-surface)] transition-colors" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 50%, transparent)', color: 'var(--color-text-muted)' }}>
            {getLabel()}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight transition-all duration-300 min-h-[3rem]" style={{ color: 'var(--color-text-main)' }} title={displayTitle}>
          {displayTitle}
        </h3>

        <div className="mt-auto pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-3">
             <p className="text-[10px] uppercase tracking-wider font-bold opacity-70" style={{ color: 'var(--color-text-muted)' }}>Versões</p>
             <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" style={{ color: 'var(--color-accent)' }}>
                <ChevronRight size={16} />
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {languages.map(lang => {
              const hasAsset = !!material.assets[lang];
              return (
                <button
                  key={lang}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasAsset) onView(material, lang);
                  }}
                  disabled={!hasAsset}
                  className={`
                    relative overflow-hidden px-3 py-1.5 text-xs rounded-lg transition-all duration-300 flex items-center gap-1.5 font-bold group/btn
                    ${hasAsset
                      ? 'border border-transparent hover:border-[var(--color-accent)]/30 hover:shadow-lg'
                      : 'opacity-30 cursor-not-allowed border border-transparent'}
                  `}
                  style={{
                    backgroundColor: hasAsset ? 'var(--color-bg)' : 'color-mix(in srgb, var(--color-bg) 30%, transparent)',
                    color: hasAsset ? 'var(--color-text-main)' : 'var(--color-text-muted)'
                  }}
                >
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
