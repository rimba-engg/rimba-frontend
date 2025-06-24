export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    feedback?: MessageFeedback[];
    thinking?: string;
    isThinking?: boolean;
  }
  
  export interface MessageFeedback {
    id: string;
    selectedText: string;
    feedbackText: string;
    type: 'positive' | 'negative' | 'suggestion';
    timestamp: Date;
  }
  
  export interface Thread {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
  }