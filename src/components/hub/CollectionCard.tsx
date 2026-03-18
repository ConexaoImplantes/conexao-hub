import React from 'react';
import { Collection, Language, UserProgress } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Progress } from '../ui/progress';
import { BookOpen, Trophy, ChevronRight, Star } from 'lucide-react';
import { colorMix } from '../../lib/utils';

interface CollectionCardProps {
  collection: Collection;
  userProgress?: UserProgress[];
  materialIds?: string[];
  onClick: (collection: Collection) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  userProgress = [],
  materialIds = [],
  onClick,
}) => {
  const { t, language } = useLanguage();

  const displayTitle = collection.title[language] || collection.title['pt-br'] || Object.values(collection.title)[0] || t('untitled');
  const displayDesc = collection.description?.[language] || collection.description?.['pt-br'] || '';

  const totalItems = materialIds.length;
  const completedItems = userProgress.filter(p => p.status === 'completed' && p.collectionId === collection.id && materialIds.includes(p.materialId)).length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isCompleted = totalItems > 0 && completedItems === totalItems;

  return (
    <div
      onClick={() => onClick(collection)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
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
      <div className="relative h-40 overflow-hidden">
        {collection.coverImage ? (
          <img src={collection.coverImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colorMix('var(--color-accent)', 20, 'rgba(201,166,85,0.2)')}, ${colorMix('var(--color-accent)', 5, 'rgba(201,166,85,0.05)')})` }}>
            <BookOpen size={48} style={{ color: 'var(--color-accent)', opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {collection.points > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Star size={10} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} /> {collection.points} XP
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm" style={{ backgroundColor: 'var(--color-success)' }}>
            <Trophy size={10} /> {t('collection.completed')}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-base leading-tight line-clamp-2">{displayTitle}</h3>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        {displayDesc ? <p className="text-sm line-clamp-2 h-[2.5rem]" style={{ color: 'var(--color-text-muted)' }}>{displayDesc}</p> : <div className="h-[2.5rem]" />}
        {totalItems > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              <span>{completedItems} {t('progress.of')} {totalItems} {t('progress.materials')}</span>
              <span style={{ color: isCompleted ? 'var(--color-success, #22c55e)' : 'var(--color-accent)' }}>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {totalItems} {totalItems !== 1 ? t('progress.materials') : t('progress.material')}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'var(--color-accent)' }}>
            {t('trail.view')} <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
