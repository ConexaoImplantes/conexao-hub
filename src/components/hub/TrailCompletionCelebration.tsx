import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { Trophy, Star, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TrailCompletionCelebrationProps {
  isOpen: boolean;
  trailName: string;
  bonusXp: number;
  onClose: () => void;
}

export const TrailCompletionCelebration: React.FC<TrailCompletionCelebrationProps> = ({
  isOpen,
  trailName,
  bonusXp,
  onClose,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const { t } = useLanguage();

  const fireConfetti = useCallback(() => {
    const cs = getComputedStyle(document.documentElement);
    const gs = cs.getPropertyValue('--color-gradient-start').trim() || '#c9a655';
    const gm = cs.getPropertyValue('--color-gradient-mid').trim() || '#e8d48b';
    const ge = cs.getPropertyValue('--color-gradient-end').trim() || '#a8873a';
    const gold = [gs, gm, ge, '#d4af37', '#ffd700'];

    // Initial big burst from center
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5, x: 0.5 },
      colors: gold,
      startVelocity: 45,
      gravity: 0.8,
      ticks: 300,
      shapes: ['circle', 'square'],
      zIndex: 99999,
    });

    // Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: gold,
        startVelocity: 50,
        ticks: 250,
        zIndex: 99999,
      });
    }, 200);

    // Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: gold,
        startVelocity: 50,
        ticks: 250,
        zIndex: 99999,
      });
    }, 400);

    // Top shower
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 160,
        origin: { y: 0, x: 0.5 },
        colors: gold,
        startVelocity: 30,
        gravity: 1.2,
        ticks: 300,
        zIndex: 99999,
      });
    }, 600);

    // Final sparkle burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 360,
        origin: { y: 0.4, x: 0.5 },
        colors: gold,
        startVelocity: 25,
        gravity: 0.6,
        ticks: 200,
        scalar: 0.8,
        zIndex: 99999,
      });
    }, 900);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti immediately
      fireConfetti();
      // Show modal after confetti has started (1.2s delay)
      const timer = setTimeout(() => setShowModal(true), 1200);
      return () => { clearTimeout(timer); setShowModal(false); };
    } else {
      setShowModal(false);
    }
  }, [isOpen, fireConfetti]);

  if (!isOpen || !showModal) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      style={{ zIndex: 10001 }}
      onClick={onClose}
    >
      <div
        className="relative rounded-3xl w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.98) 100%)',
          border: '1px solid rgba(201,166,85,0.3)',
          boxShadow: '0 0 80px rgba(201,166,85,0.15), 0 0 40px rgba(201,166,85,0.1)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full transition-all hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X size={18} />
        </button>

        {/* Glow ring behind trophy */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, #e8d48b, transparent)' }} />

        <div className="relative z-10 p-8 pt-10 flex flex-col items-center text-center">
          {/* Trophy icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-scale-in"
            style={{
              background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)',
              boxShadow: '0 8px 30px rgba(201,166,85,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
              animationDelay: '0.2s',
              animationFillMode: 'backwards',
            }}
          >
            <Trophy size={40} className="text-white drop-shadow-lg" />
          </div>

          {/* Title */}
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('trail.celebration.title')}
          </h2>

          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {t('trail.celebration.congrats')}
          </p>

          <p className="text-lg font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>
            "{trailName}"
          </p>

          {/* XP bonus badge */}
          {bonusXp > 0 && (
            <div
              className="liquid-glass-gold flex items-center gap-2 px-5 py-3 rounded-2xl mb-6"
            >
              <Star size={18} style={{ fill: 'var(--color-warning)', color: 'var(--color-warning)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--color-accent)' }}>
                +{bonusXp} {t('trail.celebration.bonus')}
              </span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(201,166,85,0.3)',
            }}
          >
            {t('trail.celebration.continue')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
