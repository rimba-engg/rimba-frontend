import React from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { Button } from '../ui/button';
import { useReferencedText } from '../../providers/ReferencedText';

interface SelectionActionButtonProps {
  selectedText: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  messageId?: string;
  onAction: () => void;
}

export function SelectionActionButton({ 
  selectedText, 
  position, 
  messageId,
  onAction 
}: SelectionActionButtonProps) {
  const { setReferencedText } = useReferencedText();

  const handleReplyToSelection = () => {
    setReferencedText({
      text: selectedText,
      messageId,
      timestamp: Date.now(),
    });
    onAction(); // This will clear the selection
    
    // Scroll to input area
    const inputElement = document.querySelector('textarea[placeholder="Type your message..."]') as HTMLTextAreaElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Position the button near the end of the selection
  const buttonStyle = {
    position: 'fixed' as const,
    left: Math.min(position.x + position.width + 8, window.innerWidth - 120),
    top: position.y + position.height / 2 - 20,
    zIndex: 1000,
  };

  return (
    <div
      style={buttonStyle}
      data-selection-action
      className="animate-in fade-in-0 zoom-in-95 duration-200"
    >
      <Button
        size="sm"
        onClick={handleReplyToSelection}
        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-0 gap-1.5"
      >
        <MessageSquareQuote className="h-3.5 w-3.5" />
        Reply
      </Button>
    </div>
  );
} 