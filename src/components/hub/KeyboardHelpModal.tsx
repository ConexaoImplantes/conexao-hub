import React from 'react';
import { createPortal } from 'react-dom';
import { X, Keyboard } from 'lucide-react';
import { useShortcuts } from '../../contexts/ShortcutContext';

export const KeyboardHelpModal: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen, shortcuts } = useShortcuts();

  if (!isHelpOpen) return null;

  const formatKey = (shortcut: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean }) => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts;
  };

  const allShortcuts = [
    { key: '?', description: 'Abrir/fechar este painel de atalhos' },
    ...Array.from(shortcuts.values()),
  ];

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{ zIndex: 9999 }}
      onClick={() => setIsHelpOpen(false)}
    >
      <div
        className="rounded-2xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="icon-box-sm">
              <Keyboard size={16} />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--color-text-main)' }}>Atalhos de Teclado</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Navegue mais rápido com o teclado</p>
            </div>
          </div>
          <button onClick={() => setIsHelpOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {allShortcuts.map((s, i) => {
            const keys = 'ctrl' in s || 'shift' in s || 'alt' in s ? formatKey(s as any) : [s.key === '?' ? '?' : s.key.toUpperCase()];
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-main)' }}>{s.description}</span>
                <div className="flex items-center gap-1">
                  {keys.map((k, ki) => (
                    <React.Fragment key={ki}>
                      <kbd
                        className="px-2 py-1 rounded-md text-xs font-bold font-mono shadow-sm"
                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
                      >
                        {k}
                      </kbd>
                      {ki < keys.length - 1 && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Pressione <kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>?</kbd> para fechar
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
