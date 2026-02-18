import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';

export interface ShortcutDef {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface ShortcutContextType {
  registerShortcut: (id: string, shortcut: ShortcutDef) => void;
  unregisterShortcut: (id: string) => void;
  shortcuts: Map<string, ShortcutDef>;
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
}

const ShortcutContext = createContext<ShortcutContextType | null>(null);

export const ShortcutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shortcutsRef = useRef<Map<string, ShortcutDef>>(new Map());
  const [shortcuts, setShortcuts] = useState<Map<string, ShortcutDef>>(new Map());
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const registerShortcut = useCallback((id: string, shortcut: ShortcutDef) => {
    shortcutsRef.current.set(id, shortcut);
    setShortcuts(new Map(shortcutsRef.current));
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    shortcutsRef.current.delete(id);
    setShortcuts(new Map(shortcutsRef.current));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (e.target as HTMLElement).isContentEditable;

      // ? or Shift+? opens help (always)
      if ((e.key === '?' || (e.shiftKey && e.key === '?')) && !isEditing) {
        e.preventDefault();
        setIsHelpOpen(prev => !prev);
        return;
      }

      shortcutsRef.current.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (isEditing && !shortcut.ctrl) return;
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ShortcutContext.Provider value={{ registerShortcut, unregisterShortcut, shortcuts, isHelpOpen, setIsHelpOpen }}>
      {children}
    </ShortcutContext.Provider>
  );
};

export const useShortcuts = () => {
  const ctx = useContext(ShortcutContext);
  if (!ctx) throw new Error('useShortcuts must be used inside ShortcutProvider');
  return ctx;
};
