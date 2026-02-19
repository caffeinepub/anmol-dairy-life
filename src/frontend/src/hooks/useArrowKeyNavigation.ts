import { useState, useEffect, useCallback } from 'react';

interface UseArrowKeyNavigationProps {
  itemCount: number;
  onSelect: (index: number) => void;
  isEnabled?: boolean;
}

export function useArrowKeyNavigation({
  itemCount,
  onSelect,
  isEnabled = true,
}: UseArrowKeyNavigationProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isEnabled || itemCount === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % itemCount);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(focusedIndex);
          break;
      }
    },
    [isEnabled, itemCount, focusedIndex, onSelect]
  );

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, handleKeyDown]);

  // Reset focused index when item count changes
  useEffect(() => {
    if (focusedIndex >= itemCount) {
      setFocusedIndex(0);
    }
  }, [itemCount, focusedIndex]);

  return { focusedIndex, setFocusedIndex };
}
