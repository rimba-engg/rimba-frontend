'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api, BASE_URL } from '@/lib/api';
import { CitationPreviewCard } from '@/app/(auth)/regsqa/components/CitationPreviewCard';
import { MessageContent } from '@/app/(auth)/regsqa/components/MessageContent';

interface Citation {
  id: number;
  url: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  citations?: string[]; // Add citations array to store citation URLs
}

interface APIResponse {
  status: string;
  data: {
    text: string;
    citation: string[];
  };
  message: string;
}

interface StreamingAPIResponse {
  content?: string;
  citation?: string;
  citations_summary?: string[];
  done?: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: 'Hello! I\'m your regulatory compliance assistant. How can I help you today?',
    timestamp: new Date(),
  }
];

const suggestedQuestions = [

  "What federal agencies do we need to register with for our RNG production facilities?",
  "How do we register our RNG production facilities with the Environmental Protection Agency (EPA)?",
  "What are the requirements for obtaining Renewable Identification Numbers (RINs) for our RNG production?",
  "How do we register with the EPA's Central Data Exchange (CDX) for RIN generation?",
  "What are the current Renewable Fuel Standard (RFS) requirements that apply to our RNG production?",
  "Are there any state-specific regulations we need to comply with for our RNG projects in different states?",
];

export default function RegsQAPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [streamedContent, setStreamedContent] = useState('');
  const [streamedCitations, setStreamedCitations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setStreamedContent('');
    setStreamedCitations([]);

    // Add temporary bot message for streaming content
    const tempBotMessageId = (Date.now() + 1).toString();
    const tempBotMessage: Message = {
      id: tempBotMessageId,
      type: 'bot',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, tempBotMessage]);

    try {
      // Use streaming API endpoint
      const response = await fetch(`${BASE_URL}/regsqa/v2/assistant/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          'X-Customer-Id': localStorage.getItem('customer_id') || '',
          'X-Id-Token': localStorage.getItem('id_token') || ''
        },
        body: JSON.stringify({
          user_input: input.trim(),
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Check if response is streaming (text/event-stream)
      const contentType = response.headers.get('content-type') || '';
      const isStreamingResponse = contentType.includes('text/event-stream');
      
      if (isStreamingResponse) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported');
        }

        let accumulatedContent = '';
        let accumulatedCitations: string[] = [];

        // Process the stream
        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            
            // Process each line (each SSE event)
            const lines = chunk.split('\n\n');
            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const data = JSON.parse(line.substring(5).trim()) as StreamingAPIResponse;
                  
                  if (data.content) {
                    accumulatedContent += data.content;
                    
                    // Update the message in state with the latest content
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === tempBotMessageId 
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                    );
                  }
                  
                  if (data.citation) {
                    if (!accumulatedCitations.includes(data.citation)) {
                      accumulatedCitations.push(data.citation);
                      
                      // Update citations in the streamed message
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === tempBotMessageId 
                            ? { ...msg, citations: [...accumulatedCitations] }
                            : msg
                        )
                      );
                    }
                  }
                  
                  if (data.citations_summary) {
                    // Merge any new citations from the summary that weren't already included
                    const newCitations = data.citations_summary.filter(
                      url => !accumulatedCitations.includes(url)
                    );
                    
                    if (newCitations.length > 0) {
                      accumulatedCitations = [...accumulatedCitations, ...newCitations];
                      
                      // Update citations in the streamed message
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === tempBotMessageId 
                            ? { ...msg, citations: accumulatedCitations }
                            : msg
                        )
                      );
                    }
                  }
                  
                  if (data.done) {
                    break;
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        };

        await processStream();
        
        // Final message update is already done through the streaming process
      } else {
        // Fallback to non-streaming response
        const data = await response.json() as APIResponse;
        
        if (data.status === 'success' && data.data) {
          // Update the temporary bot message with the complete response
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempBotMessageId
                ? {
                    ...msg,
                    content: data.data.text,
                    citations: data.data.citation
                  }
                : msg
            )
          );
        } else {
          // Handle error response
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempBotMessageId
                ? {
                    ...msg,
                    content: 'Sorry, I encountered an error processing your request. Please try again.'
                  }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('API error:', error);
      
      // Replace the streaming message with an error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempBotMessageId 
            ? {
                ...msg,
                content: 'Sorry, I could not connect to the service. Please try again later.'
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  // Replace the dummy getBotResponse with a function to show citations
  const handleShowCitation = (url: string) => {
    const newCitation: Citation = {
      id: Date.now(),
      url
    };
    setActiveCitations(prev => [...prev, newCitation]);
  };

  const handleCloseCitation = (id: number) => {
    setActiveCitations(prev => prev.filter(citation => citation.id !== id));
  };

  // Function to render message content with citation markers
  const renderMessageContent = (message: Message, handleShowCitation: (url: string) => void) => {
    return (
      <MessageContent 
        content={message.content}
        citations={message.citations}
        onCitationClick={handleShowCitation}
      />
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 max-w-[80%]',
                message.type === 'user' ? 'ml-auto' : ''
              )}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg p-4',
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.type === 'bot' 
                  ? renderMessageContent(message, handleShowCitation) 
                  : <div className="whitespace-pre-wrap">{message.content}</div>
                }
                <div
                  className={cn(
                    'text-xs mt-2',
                    message.type === 'user'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-4 min-w-[100px]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="h-2 w-2 bg-green-500 rounded-full  animate-ping" style={{animationDelay: '0.1s'}} />
                    <span className="h-2 w-2 bg-green-500 rounded-full  animate-ping" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Citation viewer */}
        {activeCitations.length > 0 && (
          <div className="border-t p-4 bg-muted/20">
            <div className="text-sm font-medium mb-2">References:</div>
            <div className="space-y-2">
              {activeCitations.map((citation) => (
                <div key={citation.id} className="flex items-start gap-2 bg-background p-3 rounded-md">
                  <CitationPreviewCard 
                    url={citation.url} 
                    className="flex-1 shadow-none border-none cursor-default"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCloseCitation(citation.id)}
                    className="h-6 w-6 p-0 self-start mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t bg-background">
          <div className="mb-4">
            {/* <div className="text-sm font-medium mb-2">Suggested Questions:</div> */}
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question here..."
              className="flex-1"
            />
            <Button onClick={handleSend} className="bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}