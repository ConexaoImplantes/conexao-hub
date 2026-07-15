import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Language } from '../../types';
import { colorMix } from '../../lib/utils';

interface Props {
  currentLanguage: Language;
  onSelect: (lang: Language) => void;
}

interface Option {
  id: Language;
  flag: string;
  label: string;
  hint: string;
}

// Static labels — this screen appears BEFORE the user has necessarily
// chosen a language, so we show all three in their own native form.
const OPTIONS: Option[] = [
  { id: 'pt-br', flag: '🇧🇷', label: 'Português', hint: 'Continuar em português' },
  { id: 'en-us', flag: '🇺🇸', label: 'English',   hint: 'Continue in English' },
  { id: 'es-es', flag: '🇪🇸', label: 'Español',   hint: 'Continuar en español' },
];

const TITLE: Record<Language, string> = {
  'pt-br': 'Escolha o idioma',
  'en-us': 'Choose your language',
  'es-es': 'Elige tu idioma',
};

const SUBTITLE: Record<Language, string> = {
  'pt-br': 'Vamos carregar seu ambiente e o tour de boas-vindas no idioma selecionado.',
  'en-us': "We'll load your environment and the welcome tour in the selected language.",
  'es-es': 'Cargaremos tu entorno y el tour de bienvenida en el idioma seleccionado.',
};

export const LanguageChoiceModal: React.FC<Props> = ({ currentLanguage, onSelect }) => {
  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8 liquid-glass animate-slide-up text-center"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 50%, var(--color-gradient-end) 100%)',
            color: 'var(--color-accent-fg)',
          }}
        >
          <Globe size={26} />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>
          {TITLE[currentLanguage] || TITLE['pt-br']}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {SUBTITLE[currentLanguage] || SUBTITLE['pt-br']}
        </p>

        <div className="flex flex-col gap-2">
          {OPTIONS.map((opt) => {
            const isCurrent = opt.id === currentLanguage;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.id)}
                className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: isCurrent
                    ? colorMix('var(--color-accent)', 12, 'rgba(201,166,85,0.12)')
                    : 'transparent',
                  border: `1px solid ${
                    isCurrent
                      ? colorMix('var(--color-accent)', 40, 'rgba(201,166,85,0.4)')
                      : 'var(--color-border)'
                  }`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.backgroundColor = colorMix(
                    'var(--color-accent)',
                    10,
                    'rgba(201,166,85,0.1)'
                  );
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isCurrent
                    ? colorMix('var(--color-accent)', 40, 'rgba(201,166,85,0.4)')
                    : 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = isCurrent
                    ? colorMix('var(--color-accent)', 12, 'rgba(201,166,85,0.12)')
                    : 'transparent';
                }}
              >
                <span className="text-2xl leading-none" aria-hidden>{opt.flag}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold" style={{ color: 'var(--color-text-main)' }}>
                    {opt.label}
                  </span>
                  <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {opt.hint}
                  </span>
                </span>
                {isCurrent && (
                  <span
                    className="inline-flex items-center justify-center rounded-full"
                    style={{
                      width: 22,
                      height: 22,
                      backgroundColor: colorMix('var(--color-accent)', 20, 'rgba(201,166,85,0.2)'),
                      color: 'var(--color-accent)',
                    }}
                  >
                    <Check size={12} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
