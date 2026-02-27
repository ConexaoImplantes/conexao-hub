import React from 'react';

export const GlobalEffects: React.FC = () => {
  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 -left-4 rounded-full mix-blend-multiply filter animate-blob"
          style={{
            width: 'var(--env-blob-size)',
            height: 'var(--env-blob-size)',
            backgroundColor: 'var(--env-blob1-color)',
            opacity: 'var(--env-blob-opacity)',
            filter: `blur(var(--env-blob-blur))`,
          }}
        />
        <div
          className="absolute top-0 -right-4 rounded-full mix-blend-multiply filter animate-blob animation-delay-2000"
          style={{
            width: 'var(--env-blob-size)',
            height: 'var(--env-blob-size)',
            backgroundColor: 'var(--env-blob2-color)',
            opacity: 'var(--env-blob-opacity)',
            filter: `blur(var(--env-blob-blur))`,
          }}
        />
        <div
          className="absolute -bottom-8 left-20 rounded-full mix-blend-multiply filter animate-blob animation-delay-4000"
          style={{
            width: 'var(--env-blob-size)',
            height: 'var(--env-blob-size)',
            backgroundColor: 'var(--env-blob3-color)',
            opacity: 'var(--env-blob-opacity)',
            filter: `blur(var(--env-blob-blur))`,
          }}
        />
        <div
          className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
          style={{
            opacity: 'var(--env-grain-opacity)',
            mixBlendMode: 'var(--env-grain-blend)' as any,
            filter: `contrast(var(--env-grain-contrast))`,
          }}
        />
      </div>
    </>
  );
};
