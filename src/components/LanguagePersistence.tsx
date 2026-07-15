import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';

const isLanguage = (v: unknown): v is Language =>
  v === 'pt-br' || v === 'en-us' || v === 'es-es';

/**
 * Bridges the authenticated user's profile.preferences.language with the
 * in-memory LanguageContext:
 *   - On login (user id change) applies the DB language to the UI.
 *   - On language change (with a real user), writes it back to profiles.preferences.
 *
 * Mock/demo users (id starts with `mock-`) are only synced in memory since their
 * "profile" lives in mockDb and is not persisted.
 */
export const LanguagePersistence: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  // Track the last user id whose preferred language we already applied,
  // so we only overwrite the UI language on actual login transitions —
  // not every time the user object reference changes.
  const appliedForUserRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      appliedForUserRef.current = null;
      return;
    }
    if (appliedForUserRef.current === user.id) return;
    appliedForUserRef.current = user.id;

    const preferred = user.preferences?.language;
    if (isLanguage(preferred) && preferred !== language) {
      setLanguage(preferred);
    }
  }, [user, language, setLanguage]);

  // Persist language changes back to the profile for real users only.
  React.useEffect(() => {
    if (!user) return;
    if (user.id.startsWith('mock-')) return;
    if (user.preferences?.language === language) return;

    const nextPrefs = { ...(user.preferences ?? {}), language };
    supabase
      .from('profiles')
      .update({ preferences: nextPrefs })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) {
          console.warn('LanguagePersistence: failed to save language', error);
        }
      });
  }, [language, user]);

  return null;
};
