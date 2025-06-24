import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronRight } from 'lucide-react';

interface ThinkingMessageProps {
  thinking: string;
  isActive: boolean;
}

export const ThinkingMessage: React.FC<ThinkingMessageProps> = ({ thinking, isActive }) => {
  const [isExpanded, setIsExpanded] = useState(isActive);

  if (!thinking && !isActive) return null;

  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-white" />
      </div>
      
      <div className="max-w-[70%]">
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-3 flex items-center gap-2 text-left hover:bg-gray-100 transition-colors rounded-lg"
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-500" />
            ) : (
              <ChevronRight size={16} className="text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {isActive ? 'Thinking...' : 'View thinking process'}
            </span>
            {isActive && (
              <div className="ml-auto">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </button>
          
          {isExpanded && (
            <div className="px-3 pb-3">
              <div className="text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-200 pt-2">
                {isActive ? (thinking || 'Processing your request...') : thinking}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};