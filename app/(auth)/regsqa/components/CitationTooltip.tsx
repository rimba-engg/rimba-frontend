import React, { useState, useEffect, useRef } from 'react';
import { CitationPreviewCard } from './CitationPreviewCard';
import { cn } from '@/lib/utils';

interface CitationTooltipProps {
  children: React.ReactNode;
  url: string;
  onSelect: () => void;
}

export function CitationTooltip({ children, url, onSelect }: CitationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);
  
  useEffect(() => {
    const calculatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Position the tooltip above the trigger by default
      let top = triggerRect.top - tooltipRect.height - 10;
      
      // If tooltip would be off the top, position it below
      if (top < 10) {
        top = triggerRect.bottom + 10;
      }
      
      // Center the tooltip horizontally
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      
      // Keep tooltip within viewport bounds
      if (left < 10) left = 10;
      if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }
      
      setPosition({ top, left });
    };
    
    if (isVisible) {
      // Use setTimeout to ensure the tooltip is rendered before measuring
      setTimeout(calculatePosition, 0);
      
      // Recalculate on resize
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, true);
      };
    }
  }, [isVisible]);
  
  const handleClick = () => {
    onSelect();
    hideTooltip();
  };

  return (
    <div className="inline-block relative" ref={triggerRef}>
      <div 
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={handleClick}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 animate-in fade-in zoom-in-95 duration-150",
          )}
          style={{ 
            top: `${position.top}px`, 
            left: `${position.left}px`,
          }}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <CitationPreviewCard url={url} onClick={handleClick} />
        </div>
      )}
    </div>
  );
} 