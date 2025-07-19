"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/app/(auth)/vertex/lib/utils";
import { api } from "@/lib/api";

interface SuggestionItem {
  id: string;
  display: string;
  description?: string;
  type?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Type your message...",
  className,
  disabled = false,
}: MentionInputProps) {
  const [allSuggestions, setAllSuggestions] = useState<SuggestionItem[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [isFetching, setIsFetching] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch all suggestions once on mount
  useEffect(() => {
    const fetchAllSuggestions = async () => {
      setIsFetching(true);
      try {
        const response = await api.get<{
          suggestions: SuggestionItem[];
          total: number;
          query: string;
        }>("/vertex/suggest");

        setAllSuggestions(response.suggestions || []);
      } catch (error) {
        console.error("Error fetching all suggestions:", error);
        setAllSuggestions([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAllSuggestions();
  }, []);

  // Filter suggestions based on query
  const filterSuggestions = useCallback(
    (query: string): SuggestionItem[] => {
      if (!query.trim()) {
        return [];
      }

      const queryLower = query.toLowerCase().trim();
      const filtered = allSuggestions.filter((suggestion) => {
        return (
          suggestion.display.toLowerCase().includes(queryLower) ||
          (suggestion.description && suggestion.description.toLowerCase().includes(queryLower)) ||
          (suggestion.type && suggestion.type.toLowerCase().includes(queryLower))
        );
      });

      // Sort by relevance
      filtered.sort((a, b) => {
        const aStartsWith = a.display.toLowerCase().startsWith(queryLower);
        const bStartsWith = b.display.toLowerCase().startsWith(queryLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.display.length - b.display.length;
      });

      return filtered.slice(0, 10);
    },
    [allSuggestions]
  );

  // Handle textarea change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check if we're typing after an @ symbol
    const beforeCursor = newValue.substring(0, cursorPos);
    const lastAtSymbol = beforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      // Check if there's a space between @ and cursor (if so, not a mention)
      const afterAt = beforeCursor.substring(lastAtSymbol + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        // We're in a mention
        setMentionQuery(afterAt);
        setMentionStartPos(lastAtSymbol);
        const filtered = filterSuggestions(afterAt);
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          insertMention(filteredSuggestions[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    }

    // Call the parent's onKeyDown if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Insert mention into text
  const insertMention = (suggestion: SuggestionItem) => {
    const before = value.substring(0, mentionStartPos);
    const after = value.substring(mentionStartPos + mentionQuery.length + 1); // +1 for the @ symbol
    const newValue = `${before}@${suggestion.display} ${after}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartPos + suggestion.display.length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    insertMention(suggestion);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isFetching}
        className="w-full border-none bg-transparent resize-none outline-none focus:outline-none"
        rows={1}
        style={{
          minHeight: '24px',
          maxHeight: '200px',
          overflow: 'auto',
          lineHeight: '1.5',
        }}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0",
                index === selectedIndex 
                  ? "bg-blue-50 text-blue-900" 
                  : "hover:bg-gray-50"
              )}
            >
              <div className="font-medium text-sm">{suggestion.display}</div>
              {suggestion.description && (
                <div className="text-xs text-gray-500 mt-1">{suggestion.description}</div>
              )}
              {suggestion.type && (
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                  {suggestion.type}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isFetching && (
        <div className="absolute right-2 top-2 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
    </div>
  );
} 