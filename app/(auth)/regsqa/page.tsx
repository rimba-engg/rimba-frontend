'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
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

    // Simulate API response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(input.trim()),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const getBotResponse = (question: string): string => {
    // Dummy responses based on keywords
    if (question.toLowerCase().includes('rfs')) {
      return 'For RFS compliance in 2024:\n\n1. RIN generation requirements have been updated\n2. New pathway verification protocols are in place\n3. Quarterly RIN activity reports must be submitted\n4. Annual compliance reports are due March 31\n\nWould you like specific details about any of these requirements?';
    }
    
    if (question.toLowerCase().includes('verification')) {
      return 'Verification statement submissions require:\n\n1. Third-party verifier accreditation\n2. Complete operational data records\n3. Site visit documentation\n4. Material balance calculations\n5. Final verification report\n\nThe verification must be completed by an approved verification body. Need more details about the verification process?';
    }
    
    if (question.toLowerCase().includes('pathway')) {
      return 'For pathway applications, you need:\n\n1. Detailed process flow diagrams\n2. Energy consumption data\n3. Mass balance calculations\n4. Transportation records\n5. Feedstock procurement documentation\n6. CI calculation spreadsheets\n\nWould you like a template for any of these documents?';
    }
    
    if (question.toLowerCase().includes('credit')) {
      return 'The credit generation process involves:\n\n1. Quarterly fuel pathway reporting\n2. Credit calculation based on CI reduction\n3. Verification of reported volumes\n4. Credit issuance by regulatory body\n\nCredits are typically issued within 45 days of report acceptance. Need more information about credit trading?';
    }
    
    if (question.toLowerCase().includes('record') || question.toLowerCase().includes('documentation')) {
      return 'Recordkeeping requirements include:\n\n1. Minimum 5-year retention period\n2. Electronic and physical copies\n3. Required documents:\n   - Production records\n   - Lab analysis reports\n   - Chain of custody documentation\n   - Transaction records\n   - Verification reports\n\nWould you like details about our document management system?';
    }

    return 'I understand you\'re asking about compliance requirements. Could you please provide more specific details about your question? For example:\n\n- Which regulation are you interested in?\n- What aspect of compliance do you need help with?\n- Are you looking for reporting deadlines or requirements?';
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
                <div className="whitespace-pre-wrap">{message.content}</div>
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