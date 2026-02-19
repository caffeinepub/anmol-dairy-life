import { useEffect } from 'react';

interface UseGlobalKeyboardShortcutsProps {
  onNavigateToDairy: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToSettings: () => void;
  onShowHelp: () => void;
}

export function useGlobalKeyboardShortcuts({
  onNavigateToDairy,
  onNavigateToTransactions,
  onNavigateToSettings,
  onShowHelp,
}: UseGlobalKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Help dialog - '?' key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        onShowHelp();
        return;
      }

      // Global navigation shortcuts - Ctrl+1/2/3
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onNavigateToDairy();
            break;
          case '2':
            e.preventDefault();
            onNavigateToTransactions();
            break;
          case '3':
            e.preventDefault();
            onNavigateToSettings();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateToDairy, onNavigateToTransactions, onNavigateToSettings, onShowHelp]);
}
