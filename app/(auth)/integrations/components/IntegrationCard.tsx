import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

interface IntegrationCardProps {
  title: string;
  imageSource: string;
  features: string[];
  isPartner?: boolean;
  isComingSoon?: boolean;
  onButtonClick?: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  title,
  imageSource,
  features,
  isPartner = false,
  isComingSoon = false,
  onButtonClick,
}) => {
  return (
    <Card className="p-6 relative">
      <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <Bookmark className="h-5 w-5" />
      </button>
      
      <div className="flex items-center gap-4 mb-6">
        <img src={imageSource} alt={title} className="w-16 h-16 object-contain" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {isPartner && (
        <div className="text-xs text-gray-500 mb-4 uppercase tracking-wide">
          Built by partner
        </div>
      )}

      <div className="space-y-1 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="text-sm text-gray-600">
            {feature}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm">View details</Button>
        {isComingSoon ? (
          <>
            <Button variant="outline" size="sm">Learn more</Button>
            <Button variant="secondary" size="sm">Notify me</Button>
          </>
        ) : (
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
            onClick={onButtonClick}
          >
            Connect
          </Button>
        )}
      </div>

      {isComingSoon && (
        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-tr rounded-bl">
          COMING SOON
        </div>
      )}
    </Card>
  );
};

export default IntegrationCard;