import React, { useRef } from 'react';
import { useTextSelection } from '../../hooks/useTextSelection';
import { SelectionActionButton } from './selection-action-button';

interface SelectableContentProps {
  children: React.ReactNode;
  messageId?: string;
  className?: string;
}

export function SelectableContent({ children, messageId, className }: SelectableContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selection, isSelecting, handleMouseUp, clearSelection } = useTextSelection();

  const handleMouseUpEvent = () => {
    handleMouseUp(containerRef.current || undefined);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      data-text-selectable
      onMouseUp={handleMouseUpEvent}
      style={{
        userSelect: 'text',
        position: 'relative',
      }}
    >
      {children}
      
      {isSelecting && selection && (
        <SelectionActionButton
          selectedText={selection.text}
          position={selection}
          messageId={messageId}
          onAction={clearSelection}
        />
      )}
    </div>
  );
} 