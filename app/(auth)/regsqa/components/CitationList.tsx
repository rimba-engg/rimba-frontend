import React from 'react';
import { CitationPreviewCard } from './CitationPreviewCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CitationListProps {
  citations: string[];
  onSelectCitation: (url: string) => void;
}

export function CitationList({ citations, onSelectCitation }: CitationListProps) {
  if (!citations || citations.length === 0) return null;
  
  return (
    <div className="mt-4 border-t pt-3">
      <div className="text-xs font-medium text-muted-foreground mb-2">Sources ({citations.length})</div>
      <div className="relative">
        <ScrollArea className="w-full h-full">
          <div className="flex space-x-2 pb-4 px-1">
            {citations.map((url, index) => (
              <CitationPreviewCard
                key={index}
                url={url}
                isCompact={true}
                onClick={() => onSelectCitation(url)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
} 