
import React, { useState } from 'react';
import { Message } from '../types/chat';
import { User, Bot, ThumbsUp, ThumbsDown, MessageSquareText, MessageSquareReply } from 'lucide-react';

interface MessageComponentProps {
  message: Message;
  onTextSelection: (text: string) => void;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({ message, onTextSelection }) => {
  const [selectedText, setSelectedText] = useState('');
  const [showFeedbackIcon, setShowFeedbackIcon] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });

  const handleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      setShowFeedbackIcon(true);
      
      // Get selection position for icon placement
      const rect = selection?.getRangeAt(0).getBoundingClientRect();
      if (rect) {
        setSelectionPosition({
          x: rect.right,
          y: rect.top
        });
      }
    } else {
      setShowFeedbackIcon(false);
      setSelectedText('');
    }
  };

  const handleFeedbackClick = () => {
    onTextSelection(selectedText);
    setShowFeedbackIcon(false);
    setSelectedText('');
    
    // Clear selection
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} relative`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`p-3 rounded-lg select-text ${
            isUser
              ? 'bg-green-700 text-white ml-auto'
              : 'bg-gray-100 text-gray-900'
          }`}
          onMouseUp={handleMouseUp}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <ThumbsUp size={14} className="text-gray-400 hover:text-green-600" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <ThumbsDown size={14} className="text-gray-400 hover:text-red-600" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <MessageSquareText size={14} className="text-gray-400 hover:text-blue-600" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-white" />
        </div>
      )}

      {/* Feedback Icon */}
      {showFeedbackIcon && !isUser && (
        <div 
          className="fixed z-50 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 cursor-pointer transition-colors"
          style={{
            left: `${selectionPosition.x + 5}px`,
            top: `${selectionPosition.y - 5}px`,
          }}
          onClick={handleFeedbackClick}
        >
          <MessageSquareReply size={16} className="text-blue-600" />
        </div>
      )}
    </div>
  );
};