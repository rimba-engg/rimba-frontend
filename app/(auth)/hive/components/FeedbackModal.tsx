
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageSquareText } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  selectedText: string;
  onClose: () => void;
  onSubmit: (feedback: string, type: 'positive' | 'negative' | 'suggestion') => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  selectedText,
  onClose,
  onSubmit
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'suggestion'>('positive');

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      onSubmit(feedbackText.trim(), feedbackType);
      setFeedbackText('');
      setFeedbackType('positive');
    }
  };

  const handleClose = () => {
    setFeedbackText('');
    setFeedbackType('positive');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Feedback on Selected Text</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Selected Text:</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md border text-sm">
              "{selectedText}"
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Feedback Type:
            </label>
            <div className="flex gap-2">
              <Button
                variant={feedbackType === 'positive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('positive')}
                className="flex items-center gap-1"
              >
                <ThumbsUp size={14} />
                Positive
              </Button>
              <Button
                variant={feedbackType === 'negative' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('negative')}
                className="flex items-center gap-1"
              >
                <ThumbsDown size={14} />
                Negative
              </Button>
              <Button
                variant={feedbackType === 'suggestion' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('suggestion')}
                className="flex items-center gap-1"
              >
                <MessageSquareText size={14} />
                Suggestion
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Your Feedback:</label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts about this text..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!feedbackText.trim()}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};