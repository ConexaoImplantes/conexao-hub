import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const SkeletonCard: React.FC = () => (
  <div
    className="relative rounded-2xl overflow-hidden border border-white/10 p-6 flex flex-col gap-4"
    style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 40%, transparent)' }}
  >
    {/* Type icon + badge */}
    <div className="flex justify-between items-start">
      <Skeleton className="w-14 h-14 rounded-2xl" />
      <Skeleton className="w-16 h-6 rounded-lg" />
    </div>

    {/* Title */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />
    </div>

    {/* Footer */}
    <div className="mt-auto pt-4 border-t border-white/5">
      <Skeleton className="h-3 w-16 rounded mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-14 rounded-lg" />
      </div>
    </div>
  </div>
);

export const SkeletonCardGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
