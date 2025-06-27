import React, { useState, useRef, useEffect } from 'react';
import { Thread, Message } from '../types/chat';
import { MessageComponent } from './MessageComponent';
import { MessageInput } from './MessageInput';
import { ThinkingMessage } from './ThinkingMessage';
import { BackendLangGraphState } from '../hooks/useBackendLangGraph';

interface BackendChatInterfaceProps {
  thread: Thread;
  onAddMessage: (threadId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  langGraph: BackendLangGraphState & {
    streamChat: (threadId: string | null, messages: Message[], assistantId?: string) => AsyncGenerator<{ threadId: string; event: any }, void, unknown>;
    sendMessage: (threadId: string | null, messages: Message[], assistantId?: string) => Promise<{ threadId: string; message: Message }>;
  };
}

export const BackendChatInterface: React.FC<BackendChatInterfaceProps> = ({ 
  thread, 
  onAddMessage, 
  langGraph 
}) => {
  const [selectedFeedbackText, setSelectedFeedbackText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentThinking, setCurrentThinking] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [lastProcessedResponse, setLastProcessedResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread.messages, isAiThinking, isTyping, typingMessage]);

  const processBackendStream = async (messages: Message[]) => {
    if (!langGraph.isInitialized) {
      throw new Error('Backend LangGraph not available');
    }

    setIsAiThinking(true);
    setCurrentThinking('Connecting to AI...');
    setIsTyping(false);
    setTypingMessage('');

    let fullResponse = ''; // Reset to empty for new conversation
    let responseThreadId = thread.langGraphThreadId || null;

    try {
      const streamGenerator = langGraph.streamChat(responseThreadId, messages);
      
      for await (const { threadId, event } of streamGenerator) {
        console.log('Backend stream event:', event);
        
        // Update thread ID if it was created
        if (!responseThreadId) {
          responseThreadId = threadId;
        }
        
        // Handle different event types from backend
        if (event.event === 'thread_created') {
          setCurrentThinking('Thread created, processing...');
          responseThreadId = event.data.thread_id;
        } else if (event.event === 'chunk') {
          // Handle streaming chunks
          const chunkData = event.data;
          console.log('Processing chunk:', chunkData);
          
          if (chunkData.event === 'metadata') {
            setCurrentThinking('AI is thinking...');
          } else if (chunkData.event === 'values') {
            // Handle LangGraph values event
            const data = chunkData.data;
            console.log('Values data:', data);
            
            // Check if this is the final response
            if (data.final_response && data.execution_complete) {
              // We have the final response - simulate streaming if it's new
              console.log('Found final response:', data.final_response);
              
              if (lastProcessedResponse !== data.final_response) {
                // This is a new response
                fullResponse = data.final_response;
                setLastProcessedResponse(data.final_response);
                
                if (!isTyping) {
                  setIsAiThinking(false);
                  setIsTyping(true);
                }
                
                setTypingMessage(fullResponse);
              }
            } else if (data.messages && data.messages.length > 0) {
              // Check if there's a new AI message
              const lastMessage = data.messages[data.messages.length - 1];
              console.log('Last message:', lastMessage);
              if (lastMessage && lastMessage.type === 'ai' && lastMessage.content) {
                console.log('Found AI message:', lastMessage.content);
                
                if (lastProcessedResponse !== lastMessage.content) {
                  // This is a new response
                  fullResponse = lastMessage.content;
                  setLastProcessedResponse(lastMessage.content);
                  
                  if (!isTyping) {
                    setIsAiThinking(false);
                    setIsTyping(true);
                  }
                  
                  setTypingMessage(fullResponse);
                }
              }
            }
          }
        } else if (event.event === 'complete') {
          setCurrentThinking('Processing complete');
          break;
        } else if (event.event === 'error') {
          throw new Error(event.data.error || 'Stream error');
        }
      }

      // Complete the response
      setIsTyping(false);
      setTypingMessage('');
      
      if (fullResponse.trim()) {
        onAddMessage(thread.id, {
          content: fullResponse,
          role: 'assistant'
        });
      } else {
        console.warn('No streaming response captured');
        onAddMessage(thread.id, {
          content: 'I processed your request but did not receive a response. Please try again.',
          role: 'assistant'
        });
      }
    } catch (error) {
      console.error('Backend streaming error:', error);
      setIsAiThinking(false);
      setIsTyping(false);
      
      onAddMessage(thread.id, {
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        role: 'assistant'
      });
    } finally {
      setIsAiThinking(false);
      setIsTyping(false);
      setCurrentThinking('');
    }
  };

  const handleSendMessage = async (content: string) => {
    // Clear any previous typing state immediately
    setIsTyping(false);
    setTypingMessage('');
    setIsAiThinking(false);
    setCurrentThinking('');
    setLastProcessedResponse(''); // Reset to ensure fresh processing

    // Add user message
    onAddMessage(thread.id, {
      content,
      role: 'user'
    });

    // Create updated messages array
    const updatedMessages = [
      ...thread.messages,
      {
        id: 'temp-user-msg',
        content,
        role: 'user' as const,
        timestamp: new Date()
      }
    ];

    // Use backend LangGraph if available
    if (langGraph.isInitialized) {
      await processBackendStream(updatedMessages);
    } else {
      // Fallback when backend is not available
      setIsAiThinking(true);
      setCurrentThinking('Backend service not available...');
      
      setTimeout(() => {
        setIsAiThinking(false);
        onAddMessage(thread.id, {
          content: `I'm currently offline. The backend LangGraph service is not available. Your message was: "${content}"`,
          role: 'assistant'
        });
        setCurrentThinking('');
      }, 2000);
    }
  };

  const handleTextSelection = (text: string) => {
    setSelectedFeedbackText(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((message) => (
          <MessageComponent 
            key={message.id} 
            message={message} 
            onTextSelection={handleTextSelection}
          />
        ))}
        {isAiThinking && (
          <ThinkingMessage thinking={currentThinking} isActive={true} />
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-gray-100 rounded-lg p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  AI
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {typingMessage}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}; 