import React from 'react';
import { X, Sparkles, PlayCircle, Check } from 'lucide-react';
import { EnvironmentId } from '../../lib/environments';
import { Role } from '../../types';
import { EnvironmentTour, getOnboardingUI } from './tours';
import { colorMix } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  envId: EnvironmentId;
  userRole?: Role;
  tour: EnvironmentTour;
  onClose: (dontShowAgain: boolean, startTour: boolean) => void;
}

const badgeLabel = (
  envId: EnvironmentId,
  role: Role | undefined,
  ui: ReturnType<typeof getOnboardingUI>
): string => {
  if (envId === 'admin') return ui.badge.admin;
  if (envId === 'manager') return ui.badge.manager;
  // client environment — personalize by user role when possible.
  if (role === 'distributor') return ui.roleBadge.distributor;
  if (role === 'consultant') return ui.roleBadge.consultant;
  if (role === 'client') return ui.roleBadge.client;
  return ui.badge.client;
};

export const WelcomeModal: React.FC<Props> = ({ envId, userRole, tour, onClose }) => {
  const [dontShow, setDontShow] = React.useState(false);
  const { language } = useLanguage();
  const ui = getOnboardingUI(language);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(dontShow, false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dontShow, onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={() => onClose(dontShow, false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 sm:p-8 relative liquid-glass animate-slide-up"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onClose(dontShow, false)}
          className="absolute top-4 right-4 p-1 rounded-md"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={ui.close}
        >
          <X size={18} />
        </button>

        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4"
          style={{
            backgroundColor: colorMix('var(--color-accent)', 12, 'rgba(201,166,85,0.12)'),
            color: 'var(--color-accent)',
            border: `1px solid ${colorMix('var(--color-accent)', 25, 'rgba(201,166,85,0.25)')}`,
          }}
        >
          <Sparkles size={12} /> {badgeLabel(envId, userRole, ui)}
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>
          {tour.welcomeTitle}
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
          {tour.welcomeBody}
        </p>

        <ul className="space-y-2 mb-6">
          {tour.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-main)' }}>
              <span
                className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: colorMix('var(--color-accent)', 15, 'rgba(201,166,85,0.15)'),
                  color: 'var(--color-accent)',
                }}
              >
                <Check size={12} />
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            className="rounded"
            style={{ accentColor: 'var(--color-accent)' }}
          />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {ui.dontShowAgain}
          </span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={() => onClose(dontShow, false)}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent',
            }}
          >
            {ui.notNow}
          </button>
          <button
            type="button"
            onClick={() => onClose(dontShow, true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--color-btn-primary-bg)',
              color: 'var(--color-btn-primary-text)',
            }}
          >
            <PlayCircle size={16} /> {ui.startTour}
          </button>
        </div>
      </div>
    </div>
  );
};
