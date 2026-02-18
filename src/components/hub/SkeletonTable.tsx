import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 4 }) => (
  <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
    {/* Header */}
    <div
      className="grid gap-4 px-4 py-3"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-24 rounded" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="grid gap-4 px-4 py-4 border-t"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          borderColor: 'var(--color-border)',
          backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'color-mix(in srgb, var(--color-surface) 30%, transparent)',
        }}
      >
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton key={colIdx} className={`h-4 rounded ${colIdx === 0 ? 'w-32' : 'w-20'}`} />
        ))}
      </div>
    ))}
  </div>
);
