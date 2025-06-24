
import React, { useState, useRef, useEffect } from 'react';
import { Thread, Message } from '../types/chat';
import { MessageComponent } from './MessageComponent';
import { MessageInput } from './MessageInput';
import { ThinkingMessage } from './ThinkingMessage';

interface ChatInterfaceProps {
  thread: Thread;
  onAddMessage: (threadId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ thread, onAddMessage }) => {
  const [selectedFeedbackText, setSelectedFeedbackText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentThinking, setCurrentThinking] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread.messages, isAiThinking, isTyping, typingMessage]);

  const simulateThinking = () => {
    const thinkingSteps = [
      "Let me understand your question...",
      "Analyzing the context and requirements...",
      "Considering different approaches...",
      "Formulating a comprehensive response...",
      "Finalizing my answer..."
    ];

    let stepIndex = 0;
    setIsAiThinking(true);
    setCurrentThinking(thinkingSteps[0]);

    const thinkingInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < thinkingSteps.length) {
        setCurrentThinking(prev => prev + '\n\n' + thinkingSteps[stepIndex]);
      } else {
        clearInterval(thinkingInterval);
      }
    }, 300);

    return () => clearInterval(thinkingInterval);
  };

  const simulateTyping = (fullMessage: string, thinking: string) => {
    setIsTyping(true);
    setTypingMessage('');
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullMessage.length) {
        setTypingMessage(fullMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTypingMessage('');
        
        // Add the complete message
        onAddMessage(thread.id, {
          content: fullMessage,
          role: 'assistant',
          thinking: thinking
        });
      }
    }, 30); // Adjust speed here (lower = faster)

    return () => clearInterval(typingInterval);
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    onAddMessage(thread.id, {
      content,
      role: 'user'
    });

    // Start thinking simulation
    const cleanup = simulateThinking();

    // Simulate AI response after thinking
    setTimeout(() => {
      cleanup();
      setIsAiThinking(false);
      
      const responses = [
        "I understand your question. Let me help you with that.",
        "That's an interesting point. Here's what I think about it...",
        "Based on your query, I can provide you with the following information:",
        "Great question! Let me break this down for you:",
        "I'd be happy to help you with that. Here's my response:"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)] + 
        ` This is a simulated response to: "${content}". In a real implementation, this would be connected to an AI service like OpenAI's GPT API.`;

      // Start typing effect
      simulateTyping(randomResponse, currentThinking);
      setCurrentThinking('');
    }, 2000);
  };

  const handleTextSelection = (text: string) => {
    setSelectedFeedbackText(`Regarding: "${text}"\n\n`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-semibold text-gray-900">{thread.title}</h1>
        <p className="text-sm text-gray-500">{thread.messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Start a conversation</h2>
              <p className="text-gray-500">Type a message below to begin chatting.</p>
            </div>
          </div>
        ) : (
          thread.messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {message.role === 'assistant' && message.thinking && (
                <ThinkingMessage thinking={message.thinking} isActive={false} />
              )}
              <MessageComponent
                message={message}
                onTextSelection={handleTextSelection}
              />
            </div>
          ))
        )}
        
        {/* Active thinking display */}
        {isAiThinking && (
          <ThinkingMessage thinking={currentThinking} isActive={true} />
        )}
        
        {/* Typing effect display */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <div className="text-white text-xs">AI</div>
            </div>
            <div className="max-w-[70%]">
              <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
                <div className="whitespace-pre-wrap break-words">
                  {typingMessage}
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        prefillText={selectedFeedbackText}
        onTextUsed={() => setSelectedFeedbackText('')}
      />
    </div>
  );
};