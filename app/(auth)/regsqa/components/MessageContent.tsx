import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CitationTooltip } from './CitationTooltip';
import { CitationList } from './CitationList';
import { BookOpen } from 'lucide-react';

interface MessageContentProps {
  content: string;
  citations?: string[];
  onCitationClick: (url: string) => void;
}

export function MessageContent({ content, citations, onCitationClick }: MessageContentProps) {
  if (!citations || citations.length === 0) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Process content to identify citation markers
  const renderContentWithCitations = () => {
    // First split the content by citation markers
    const citationRegex = /\[(\d+)\]/g;
    const segments: { text: string; isCitation: boolean; citationIndex?: number }[] = [];
    
    let lastIndex = 0;
    let match;
    
    // Find all citation markers and split the content
    while ((match = citationRegex.exec(content)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        segments.push({
          text: content.substring(lastIndex, match.index),
          isCitation: false
        });
      }
      
      // Add the citation
      const citationNum = parseInt(match[1]) - 1;
      if (citationNum >= 0 && citationNum < citations.length) {
        segments.push({
          text: match[0],
          isCitation: true,
          citationIndex: citationNum
        });
      } else {
        // If citation number is invalid, treat it as regular text
        segments.push({
          text: match[0],
          isCitation: false
        });
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < content.length) {
      segments.push({
        text: content.substring(lastIndex),
        isCitation: false
      });
    }
    
    // Render each segment
    return (
      <div className="markdown-content">
        {segments.map((segment, index) => {
          if (segment.isCitation && segment.citationIndex !== undefined) {
            // Render citation marker
            return (
              <CitationTooltip 
                key={`citation-${index}`}
                url={citations[segment.citationIndex!]}
                onSelect={() => onCitationClick(citations[segment.citationIndex!])}
              >
                <span className="inline-flex items-center px-1 py-0.5 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {segment.text}
                </span>
              </CitationTooltip>
            );
          } else {
            // Render markdown text
            return (
              <span key={`text-${index}`} className="markdown-text-segment">
                <ReactMarkdown>
                  {segment.text}
                </ReactMarkdown>
              </span>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderContentWithCitations()}
      
      <CitationList 
        citations={citations} 
        onSelectCitation={onCitationClick} 
      />
    </div>
  );
} 