import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReferencedTextData {
  text: string;
  messageId?: string;
  timestamp: number;
}

interface ReferencedTextContextType {
  referencedText: ReferencedTextData | null;
  setReferencedText: (data: ReferencedTextData | null) => void;
  clearReferencedText: () => void;
}

const ReferencedTextContext = createContext<ReferencedTextContextType | undefined>(undefined);

export function ReferencedTextProvider({ children }: { children: ReactNode }) {
  const [referencedText, setReferencedTextState] = useState<ReferencedTextData | null>(null);

  const setReferencedText = (data: ReferencedTextData | null) => {
    setReferencedTextState(data);
  };

  const clearReferencedText = () => {
    setReferencedTextState(null);
  };

  const value = {
    referencedText,
    setReferencedText,
    clearReferencedText,
  };

  return (
    <ReferencedTextContext.Provider value={value}>
      {children}
    </ReferencedTextContext.Provider>
  );
}

export function useReferencedText() {
  const context = useContext(ReferencedTextContext);
  if (context === undefined) {
    throw new Error('useReferencedText must be used within a ReferencedTextProvider');
  }
  return context;
} 