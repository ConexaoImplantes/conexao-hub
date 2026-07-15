import React from 'react';
import { EnvironmentId } from '../../lib/environments';
import { useAuth } from '../../contexts/AuthContext';
import { useEnvironment } from '../../App';
import { TOURS } from './tours';
import { WelcomeModal } from './WelcomeModal';
import { OnboardingTour } from './OnboardingTour';

type Phase = 'idle' | 'welcome' | 'tour';

interface OnboardingContextValue {
  /** Manually reopen the welcome modal + tour for the active environment. */
  restart: () => void;
  /** True while any onboarding UI (modal or tour) is visible. */
  isActive: boolean;
}

const OnboardingContext = React.createContext<OnboardingContextValue | undefined>(undefined);

export const useOnboarding = () => {
  const ctx = React.useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
};

// v2 key — old "seen" flags from earlier versions are intentionally ignored so
// the auto-open behavior always reflects the current rule (only the checkbox suppresses it).
const seenKey = (userId: string, env: EnvironmentId) => `hub:onboarding:dismissed:v2:${userId}:${env}`;

const wasSeen = (userId: string, env: EnvironmentId): boolean => {
  try {
    return localStorage.getItem(seenKey(userId, env)) === '1';
  } catch {
    return false;
  }
};

const markSeen = (userId: string, env: EnvironmentId) => {
  try {
    localStorage.setItem(seenKey(userId, env), '1');
  } catch {
    /* ignore */
  }
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { active } = useEnvironment();
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [envForFlow, setEnvForFlow] = React.useState<EnvironmentId | null>(null);
  // Track which envs already auto-opened in THIS page session — reload resets it.
  const autoOpenedRef = React.useRef<Set<string>>(new Set());

  // Auto-open the welcome modal the first time the user lands on an environment
  // AFTER each page reload — as long as they haven't ticked "não mostrar novamente".
  React.useEffect(() => {
    if (!user || !active) return;
    if (phase !== 'idle') return;
    const key = `${user.id}:${active}`;
    if (autoOpenedRef.current.has(key)) return;
    if (!wasSeen(user.id, active)) {
      autoOpenedRef.current.add(key);
      setEnvForFlow(active);
      setPhase('welcome');
    }
  }, [user, active, phase]);

  // Reset when user or environment changes so the next visit reevaluates.
  React.useEffect(() => {
    setPhase('idle');
    setEnvForFlow(null);
  }, [user?.id, active]);

  const restart = React.useCallback(() => {
    if (!active) return;
    setEnvForFlow(active);
    setPhase('welcome');
  }, [active]);

  const handleWelcomeClose = React.useCallback(
    (dontShowAgain: boolean, startTour: boolean) => {
      if (user && envForFlow && dontShowAgain) markSeen(user.id, envForFlow);
      if (startTour) {
        setPhase('tour');
      } else {
        setPhase('idle');
      }
    },
    [user, envForFlow]
  );

  const handleTourClose = React.useCallback(() => {
    // Do NOT auto-mark as seen. The preference is controlled exclusively by the
    // "não mostrar novamente" checkbox in the welcome modal.
    setPhase('idle');
  }, []);

  const value: OnboardingContextValue = {
    restart,
    isActive: phase !== 'idle',
  };

  const tour = envForFlow ? TOURS[envForFlow] : null;

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {phase === 'welcome' && tour && envForFlow && (
        <WelcomeModal envId={envForFlow} userRole={user?.role} tour={tour} onClose={handleWelcomeClose} />
      )}
      {phase === 'tour' && tour && (
        <OnboardingTour steps={tour.steps} onClose={handleTourClose} />
      )}
    </OnboardingContext.Provider>
  );
};
