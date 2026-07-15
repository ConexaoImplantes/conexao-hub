import React from 'react';

export interface OnboardingContextValue {
  /** Manually reopen the welcome modal + tour for the active environment. */
  restart: () => void;
  /** True while any onboarding UI (modal or tour) is visible. */
  isActive: boolean;
}

export const OnboardingContext = React.createContext<OnboardingContextValue | undefined>(undefined);

export const useOnboarding = () => {
  const ctx = React.useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
};
