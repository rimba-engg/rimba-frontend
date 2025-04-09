'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { CitationTooltip } from '@/app/components/CitationTooltip';
import { CitationList } from '@/app/components/CitationList';
import { CitationPreviewCard } from '@/app/components/CitationPreviewCard';
import { MessageContent } from '@/app/components/MessageContent';

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

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: 'Hello! I\'m your regulatory compliance assistant. How can I help you today?',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'user',
    content: 'What are the key requirements for LCFS reporting?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '3',
    type: 'bot',
    content: 'For LCFS reporting, the key requirements include:\n\n1. Quarterly reports must be submitted within 45 days of the end of each quarter\n2. Annual verification reports are due by August 31\n3. You need to track and report:\n   - Fuel pathways and volumes\n   - Carbon intensity values\n   - Transaction types\n   - Business partner information\n\nWould you like more specific information about any of these requirements?',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: '4',
    type: 'user',
    content: 'What happens if we miss a reporting deadline?',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: '5',
    type: 'bot',
    content: 'Missing LCFS reporting deadlines can have serious consequences:\n\n1. Immediate non-compliance status\n2. Potential financial penalties up to $1000 per day\n3. Possible suspension of LCFS credits trading privileges\n4. Required corrective action plan submission\n\nIt\'s crucial to maintain timely reporting. Would you like to know about deadline extension requests or remediation steps?',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  }
];

const suggestedQuestions = [
  'What are the RFS compliance requirements for 2024?',
  'How do we handle verification statement submissions?',
  'What documentation is needed for pathway applications?',
  'Explain the credit generation process',
  'What are the recordkeeping requirements?'
];

export default function RegsQAPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      // Call the API using the api client
      const response = await api.post<APIResponse>('/regsqa/v2/assistant/', {
        user_input: input.trim()
      });

      if (response.status === 'success' && response.data) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: response.data.text,
          timestamp: new Date(),
          citations: response.data.citation
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        // Handle error response
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('API error:', error);
      
      // Add error message
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I could not connect to the service. Please try again later.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
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
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
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
            <div className="text-sm font-medium mb-2">Suggested Questions:</div>
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