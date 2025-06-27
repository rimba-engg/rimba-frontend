
import React, { useState, useRef, useEffect } from 'react';
import { Thread, Message } from '../types/chat';
import { MessageComponent } from './MessageComponent';
import { MessageInput } from './MessageInput';
import { ThinkingMessage } from './ThinkingMessage';
import { LangGraphState } from '../hooks/useLangGraph';
import { LANGGRAPH_CONFIG } from '../config/langgraph-config';

interface ChatInterfaceProps {
  thread: Thread;
  onAddMessage: (threadId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  langGraph: LangGraphState & {
    streamChat: (threadId: string, messages: Message[]) => AsyncGenerator<any, void, unknown>;
    getThreadState?: (threadId: string) => Promise<any>;
    invokeAssistant?: (threadId: string, messages: Message[]) => Promise<any>;
  };
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ thread, onAddMessage, langGraph }) => {
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

  const processLangGraphStream = async (messages: Message[]) => {
    if (!langGraph.isInitialized || !thread.langGraphThreadId) {
      throw new Error('LangGraph not available');
    }

    setIsAiThinking(true);
    setCurrentThinking('Connecting to AI...');
    setIsTyping(false);
    setTypingMessage('');

    let fullResponse = '';
    let thinking = '';
    let isProcessingResponse = false;

    try {
      const stream = langGraph.streamChat(thread.langGraphThreadId, messages);
      
      for await (const chunk of stream) {
        console.log('LangGraph stream chunk:', chunk); // Debug log
        
        // Handle different types of streaming events
        if (chunk.event === LANGGRAPH_CONFIG.STREAM_EVENTS.CHAIN_START) {
          setCurrentThinking('AI is thinking...');
        } else if (chunk.event === LANGGRAPH_CONFIG.STREAM_EVENTS.CHAIN_STREAM) {
          // This contains the actual response chunks
          if (chunk.data && chunk.data.chunk) {
            if (!isProcessingResponse) {
              setIsAiThinking(false);
              setIsTyping(true);
              isProcessingResponse = true;
            }
            
            if (typeof chunk.data.chunk === 'string') {
              fullResponse += chunk.data.chunk;
              setTypingMessage(fullResponse);
            } else if (chunk.data.chunk.content) {
              fullResponse += chunk.data.chunk.content;
              setTypingMessage(fullResponse);
            }
          }
        } else if (chunk.event === LANGGRAPH_CONFIG.STREAM_EVENTS.CHAIN_END) {
          // Chain completed
          break;
        } else if (chunk.event === 'on_chat_model_stream') {
          // Handle chat model streaming (common LangGraph event)
          if (chunk.data && chunk.data.chunk) {
            if (!isProcessingResponse) {
              setIsAiThinking(false);
              setIsTyping(true);
              isProcessingResponse = true;
            }
            
            // Handle different chunk formats
            if (typeof chunk.data.chunk === 'string') {
              fullResponse += chunk.data.chunk;
              setTypingMessage(fullResponse);
            } else if (chunk.data.chunk.content) {
              fullResponse += chunk.data.chunk.content;
              setTypingMessage(fullResponse);
            }
          }
        } else if (chunk.event === 'on_chain_end' || chunk.event === 'on_graph_end') {
          // Handle end events - check if we have final state
          if (chunk.data && chunk.data.output && chunk.data.output.messages) {
            const lastMessage = chunk.data.output.messages[chunk.data.output.messages.length - 1];
            if (lastMessage && lastMessage.type === 'ai' && lastMessage.content) {
              fullResponse = lastMessage.content;
              setTypingMessage(fullResponse);
              isProcessingResponse = true;
            }
          }
          break;
        }
      }

      // Complete the response
      setIsTyping(false);
      setTypingMessage('');
      
      if (fullResponse) {
        onAddMessage(thread.id, {
          content: fullResponse,
          role: 'assistant',
          thinking: thinking || 'Processing...'
        });
      } else {
        // If no streaming response was captured, try to get the final thread state
        console.warn('No streaming response captured, trying to get final thread state...');
        try {
          if (langGraph.getThreadState) {
            const threadState = await langGraph.getThreadState(thread.langGraphThreadId);
            console.log('Thread state:', threadState);
            
            if (threadState.values && threadState.values.messages) {
              const lastMessage = threadState.values.messages[threadState.values.messages.length - 1];
              if (lastMessage && lastMessage.type === 'ai' && lastMessage.content) {
                onAddMessage(thread.id, {
                  content: lastMessage.content,
                  role: 'assistant',
                  thinking: 'Retrieved from final state'
                });
                return;
              }
            }
          }
        } catch (stateError) {
          console.error('Failed to get thread state:', stateError);
        }
        
        // Final fallback
        onAddMessage(thread.id, {
          content: 'I processed your request but encountered an issue with retrieving the response. The LangGraph server is working, but there may be a streaming compatibility issue.',
          role: 'assistant'
        });
      }
    } catch (error) {
      console.error('LangGraph streaming error:', error);
      setIsAiThinking(false);
      setIsTyping(false);
      
      // Fallback error message
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
    // Add user message
    onAddMessage(thread.id, {
      content,
      role: 'user'
    });

    // Create updated messages array for LangGraph
    const updatedMessages = [
      ...thread.messages,
      {
        id: 'temp-user-msg',
        content,
        role: 'user' as const,
        timestamp: new Date()
      }
    ];

    // Use LangGraph if available, otherwise fallback to simulation
    if (langGraph.isInitialized && thread.langGraphThreadId) {
      await processLangGraphStream(updatedMessages);
    } else {
      // Fallback simulation for when LangGraph is not available
      setIsAiThinking(true);
      setCurrentThinking('LangGraph not available. Using fallback response...');
      
      setTimeout(() => {
        setIsAiThinking(false);
        onAddMessage(thread.id, {
          content: `I'm currently running in offline mode. To get AI responses, please ensure your LangGraph server is running and connected. Your message was: "${content}"`,
          role: 'assistant'
        });
        setCurrentThinking('');
      }, 1000);
    }
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
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
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