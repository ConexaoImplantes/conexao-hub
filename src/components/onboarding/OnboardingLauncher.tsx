import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { colorMix } from '../../lib/utils';

export const OnboardingLauncher: React.FC = () => {
  const { restart, isActive } = useOnboarding();
  const [hover, setHover] = React.useState(false);

  if (isActive) return null;

  return (
    <button
      type="button"
      data-tour="onboarding-launcher"
      onClick={restart}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Refazer tour de onboarding"
      className="fixed z-[900] rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        bottom: 24,
        right: 24,
        width: 52,
        height: 52,
        backgroundColor: 'var(--color-accent)',
        color: 'var(--color-btn-primary-text)',
        boxShadow: hover
          ? `0 12px 28px ${colorMix('var(--color-accent)', 55, 'rgba(201,166,85,0.55)')}`
          : `0 8px 20px ${colorMix('var(--color-accent)', 40, 'rgba(201,166,85,0.4)')}`,
        transform: hover ? 'translateY(-2px) scale(1.05)' : 'none',
      }}
    >
      <HelpCircle size={22} />
      {hover && (
        <span
          className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)',
          }}
        >
          Refazer tour
        </span>
      )}
    </button>
  );
};
