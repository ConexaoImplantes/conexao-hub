import React from 'react';
import { EnvironmentId } from '../../lib/environments';
import { useAuth } from '../../contexts/AuthContext';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { getTour } from './tours';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../types';
import { WelcomeModal } from './WelcomeModal';
import { OnboardingTour } from './OnboardingTour';
import { LanguageChoiceModal } from './LanguageChoiceModal';

import { OnboardingContext, OnboardingContextValue, useOnboarding } from './OnboardingContext';

export { useOnboarding };

type Phase = 'idle' | 'language' | 'welcome' | 'tour';

// v2 key — old "seen" flags from earlier versions are intentionally ignored so
// the auto-open behavior always reflects the current rule (only the checkbox suppresses it).
const seenKey = (userId: string, env: EnvironmentId) => `hub:onboarding:dismissed:v2:${userId}:${env}`;

// Tracks whether the user has already picked a language for the client env
// via the pre-onboarding language selector. Independent from the tour "seen" flag
// so users who dismissed the tour still get asked once.
const langChosenKey = (userId: string) => `hub:onboarding:lang-chosen:v1:${userId}:client`;

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

const wasLangChosen = (userId: string): boolean => {
  try {
    return localStorage.getItem(langChosenKey(userId)) === '1';
  } catch {
    return false;
  }
};

const markLangChosen = (userId: string) => {
  try {
    localStorage.setItem(langChosenKey(userId), '1');
  } catch {
    /* ignore */
  }
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { active } = useEnvironment();
  const { language, setLanguage } = useLanguage();
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [envForFlow, setEnvForFlow] = React.useState<EnvironmentId | null>(null);
  // Track which envs already auto-opened in THIS page session — reload resets it.
  const autoOpenedRef = React.useRef<Set<string>>(new Set());

  // Auto-open logic. For the CLIENT environment, the very first time (per user)
  // we show a language chooser first so the tour is loaded in the picked idiom.
  // Once chosen, subsequent visits behave like other envs and rely on the
  // "don't show again" checkbox.
  React.useEffect(() => {
    if (!user || !active) return;
    if (phase !== 'idle') return;
    const key = `${user.id}:${active}`;
    if (autoOpenedRef.current.has(key)) return;

    if (active === 'client' && !wasLangChosen(user.id)) {
      autoOpenedRef.current.add(key);
      setEnvForFlow(active);
      setPhase('language');
      return;
    }

    if (!wasSeen(user.id, active)) {
      autoOpenedRef.current.add(key);
      setEnvForFlow(active);
      setPhase('welcome');
    }
  }, [user, active, phase]);

  // When user or environment changes, close any open flow and clear the
  // auto-opened tracker so the new environment can auto-open on its own.
  const prevKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const key = user && active ? `${user.id}:${active}` : null;
    if (prevKeyRef.current !== null && prevKeyRef.current !== key) {
      setPhase('idle');
      setEnvForFlow(null);
      autoOpenedRef.current.clear();
    }
    prevKeyRef.current = key;
  }, [user?.id, active]);

  const restart = React.useCallback(() => {
    if (!active) return;
    setEnvForFlow(active);
    // Manual restart uses the current language directly — no re-prompt.
    setPhase('welcome');
  }, [active]);

  const handleLanguagePicked = React.useCallback(
    (lang: Language) => {
      if (user) markLangChosen(user.id);
      // Applying the language BEFORE moving to the welcome/tour phase guarantees
      // that getTour() picks up the new value on the next render.
      if (lang !== language) setLanguage(lang);
      setPhase('welcome');
    },
    [user, language, setLanguage]
  );

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

  const tour = envForFlow ? getTour(envForFlow, language) : null;

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {phase === 'language' && envForFlow === 'client' && (
        <LanguageChoiceModal currentLanguage={language} onSelect={handleLanguagePicked} />
      )}
      {phase === 'welcome' && tour && envForFlow && (
        <WelcomeModal envId={envForFlow} userRole={user?.role} tour={tour} onClose={handleWelcomeClose} />
      )}
      {phase === 'tour' && tour && (
        <OnboardingTour steps={tour.steps} onClose={handleTourClose} />
      )}
    </OnboardingContext.Provider>
  );
};
