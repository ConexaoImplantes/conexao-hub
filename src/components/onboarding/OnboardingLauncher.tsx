import React from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from './OnboardingContext';
import { colorMix } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { getOnboardingUI } from './tours';

export const OnboardingLauncher: React.FC = () => {
  const { restart, isActive } = useOnboarding();
  const [hover, setHover] = React.useState(false);
  const { language } = useLanguage();
  const ui = getOnboardingUI(language);

  // Stays mounted during the tour so the final "replay the tour" step can
  // actually point at it — it just stops being clickable meanwhile.
  return createPortal(
    <button
      type="button"
      data-tour="onboarding-launcher"
      onClick={isActive ? undefined : restart}

      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label={ui.launcherTooltip}
      className="rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        right: 'calc(env(safe-area-inset-right, 0px) + 16px)',
        zIndex: 900,
        width: 42,
        height: 42,
        backgroundColor: colorMix('var(--color-accent)', 20, 'rgba(201,166,85,0.2)'),
        color: 'var(--color-accent)',
        border: `1px solid ${colorMix('var(--color-accent)', 30, 'rgba(201,166,85,0.3)')}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: hover ? 1 : 0.35,
        boxShadow: hover
          ? `0 6px 16px ${colorMix('var(--color-accent)', 35, 'rgba(201,166,85,0.35)')}`
          : 'none',
        transform: hover ? 'scale(1.08)' : 'none',
      }}
    >
      <HelpCircle size={16} />
      {hover && (
        <span
          className="absolute right-full mr-2 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-medium pointer-events-none"
          style={{
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)',
          }}
        >
          {ui.launcherTooltip}
        </span>
      )}
    </button>,
    document.body
  );
};
