import React from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitationPreviewCardProps {
  url: string;
  isCompact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CitationPreviewCard({ 
  url, 
  isCompact = false, 
  className,
  onClick
}: CitationPreviewCardProps) {
  const [title, setTitle] = React.useState<string | null>(null);
  const [favicon, setFavicon] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    // This is a mock function to simulate fetching metadata
    // In production, you would use an API to fetch the actual metadata
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Extract domain name for display
        const domain = new URL(url).hostname.replace('www.', '');
        
        // Generate title from URL
        // In production, you'd fetch real metadata
        const urlPath = new URL(url).pathname;
        const pathSegments = urlPath.split('/').filter(Boolean);
        const pageTitle = pathSegments.length > 0 
          ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ')
          : domain;
        
        setTitle(pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1));
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  const domain = React.useMemo(() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  }, [url]);

  if (isCompact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-2 bg-card rounded-md border shadow-sm hover:bg-accent/50 transition-colors cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {loading ? (
          <div className="w-4 h-4 flex-shrink-0">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          favicon && <img src={favicon} alt={domain} className="w-4 h-4 flex-shrink-0" />
        )}
        <div className="text-xs font-medium truncate max-w-[150px]">{domain}</div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex flex-col gap-2 p-3 bg-card rounded-md border shadow-sm min-w-[250px] max-w-[350px]",
        loading ? "animate-pulse" : "",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="w-5 h-5 bg-muted rounded-full flex-shrink-0">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          favicon && <img src={favicon} alt={domain} className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="text-xs text-muted-foreground font-medium truncate">{domain}</span>
      </div>
      
      <div className="text-sm font-medium line-clamp-2">
        {loading ? (
          <div className="h-4 bg-muted rounded w-[90%]"></div>
        ) : error ? (
          'Could not load preview'
        ) : (
          title || 'No title available'
        )}
      </div>
      
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-3 w-3" />
        View source
      </a>
    </div>
  );
} 