import { useEffect } from 'react';

interface UseDairyKeyboardShortcutsProps {
  isActive: boolean;
  onNavigateToMilkCollection: () => void;
  onNavigateToBill: () => void;
  onNavigateToData: () => void;
  onNavigateToSell: () => void;
  onNavigateToCash: () => void;
}

export function useDairyKeyboardShortcuts({
  isActive,
  onNavigateToMilkCollection,
  onNavigateToBill,
  onNavigateToData,
  onNavigateToSell,
  onNavigateToCash,
}: UseDairyKeyboardShortcutsProps) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Ctrl/Cmd shortcuts
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) {
        return;
      }

      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault();
          onNavigateToMilkCollection();
          break;
        case 'b':
          e.preventDefault();
          onNavigateToBill();
          break;
        case 'd':
          e.preventDefault();
          onNavigateToData();
          break;
        case 's':
          e.preventDefault();
          onNavigateToSell();
          break;
        case 'c':
          e.preventDefault();
          onNavigateToCash();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onNavigateToMilkCollection, onNavigateToBill, onNavigateToData, onNavigateToSell, onNavigateToCash]);
}
