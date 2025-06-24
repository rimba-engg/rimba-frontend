import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  prefillText?: string;
  onTextUsed?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, prefillText = '', onTextUsed }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle prefilled text for feedback
  useEffect(() => {
    if (prefillText.startsWith('Regarding: "')) {
      const textMatch = prefillText.match(/Regarding: "(.*?)"/);
      if (textMatch) {
        setFeedbackText(textMatch[1]);
        setMessage('');
      }
    } else if (prefillText) {
      setMessage(prefillText);
      setFeedbackText('');
    }
    
    // Focus the textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(message.length, message.length);
      }
    }, 100);
  }, [prefillText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !feedbackText) || isLoading) return;

    let messageToSend = message.trim();
    if (feedbackText) {
      messageToSend = `Regarding: "${feedbackText}"\n\n${messageToSend}`;
    }

    setMessage('');
    setFeedbackText('');
    setIsLoading(true);

    // Call onTextUsed when prefilled text is used
    if (prefillText && onTextUsed) {
      onTextUsed();
    }

    try {
      await onSendMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearFeedback = () => {
    setFeedbackText('');
    if (onTextUsed) {
      onTextUsed();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {feedbackText && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg relative">
          <div className="text-sm text-blue-700 font-medium mb-1">Providing feedback on:</div>
          <div className="text-sm text-blue-800 italic">"{feedbackText}"</div>
          <button
            onClick={clearFeedback}
            className="absolute top-2 right-2 p-1 hover:bg-blue-100 rounded"
          >
            <X size={14} className="text-blue-600" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="min-h-[44px] max-h-32 resize-none pr-10"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
          >
            <Paperclip size={14} className="text-gray-400" />
          </Button>
        </div>
        
        <Button
          type="submit"
          disabled={(!message.trim() && !feedbackText) || isLoading}
          className="h-11 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </Button>
      </form>
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};