import { useState, useEffect, useCallback } from 'react';

interface SelectionData {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelection = useCallback((container?: HTMLElement) => {
    const sel = window.getSelection();
    
    if (!sel || sel.rangeCount === 0) {
      setSelection(null);
      setIsSelecting(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const selectedText = sel.toString().trim();

    // Only proceed if there's actual text selected and it's within our container
    if (!selectedText || selectedText.length < 3) {
      setSelection(null);
      setIsSelecting(false);
      return;
    }

    // If container is specified, check if selection is within it
    if (container && !container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      setIsSelecting(false);
      return;
    }

    // Get the bounding rectangle of the selection
    const rect = range.getBoundingClientRect();
    
    setSelection({
      text: selectedText,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    });
    setIsSelecting(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setIsSelecting(false);
    // Clear the browser selection
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
    }
  }, []);

  const handleMouseUp = useCallback((container?: HTMLElement) => {
    // Small delay to ensure selection is complete
    setTimeout(() => handleSelection(container), 10);
  }, [handleSelection]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside any text selection area
      const target = e.target as HTMLElement;
      if (!target.closest('[data-text-selectable]') && !target.closest('[data-selection-action]')) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearSelection]);

  return {
    selection,
    isSelecting,
    handleMouseUp,
    clearSelection,
  };
} 