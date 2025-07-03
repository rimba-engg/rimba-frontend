import React from 'react';
import { X, MessageSquareQuote } from 'lucide-react';
import { Button } from '../ui/button';
import { useReferencedText } from '../../providers/ReferencedText';

export function ReferencedTextDisplay() {
  const { referencedText, clearReferencedText } = useReferencedText();

  if (!referencedText) return null;

  const truncatedText = referencedText.text.length > 150 
    ? referencedText.text.substring(0, 150) + '...' 
    : referencedText.text;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 relative">
      <div className="flex items-start gap-2">
        <MessageSquareQuote className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-blue-600 font-medium mb-1">
            Replying to:
          </div>
          <div className="text-sm text-gray-700 italic leading-relaxed">
            "{truncatedText}"
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={clearReferencedText}
          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
} 