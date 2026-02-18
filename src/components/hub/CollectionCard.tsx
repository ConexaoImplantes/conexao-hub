import React from 'react';
import { Collection, Language, UserProgress } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Progress } from '../ui/progress';
import { BookOpen, Trophy, ChevronRight, Star } from 'lucide-react';

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
  const { language } = useLanguage();

  const displayTitle = collection.title[language] || collection.title['pt-br'] || Object.values(collection.title)[0] || 'Sem título';
  const displayDesc = collection.description?.[language] || collection.description?.['pt-br'] || '';

  const totalItems = materialIds.length;
  const completedItems = userProgress.filter(p => p.status === 'completed' && materialIds.includes(p.materialId)).length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isCompleted = totalItems > 0 && completedItems === totalItems;

  return (
    <div
      onClick={() => onClick(collection)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 40%, transparent)' }}
    >
      {/* Cover */}
      <div className="relative h-40 overflow-hidden">
        {collection.coverImage ? (
          <img src={collection.coverImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 20%, transparent), color-mix(in srgb, var(--color-accent) 5%, transparent))' }}>
            <BookOpen size={48} style={{ color: 'var(--color-accent)', opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Points badge */}
        {collection.points > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            {collection.points} XP
          </div>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm" style={{ backgroundColor: 'rgba(34,197,94,0.8)' }}>
            <Trophy size={10} />
            Concluída
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-base leading-tight line-clamp-2">{displayTitle}</h3>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {displayDesc && (
          <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{displayDesc}</p>
        )}

        {/* Progress */}
        {totalItems > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              <span>{completedItems} de {totalItems} materiais</span>
              <span style={{ color: isCompleted ? 'var(--color-success, #22c55e)' : 'var(--color-accent)' }}>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {totalItems} material{totalItems !== 1 ? 'is' : ''}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'var(--color-accent)' }}>
            Ver trilha <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
