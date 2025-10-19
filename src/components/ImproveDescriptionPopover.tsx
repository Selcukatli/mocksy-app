'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

interface ImproveDescriptionPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImprove: (feedback?: string) => void;
  isImproving?: boolean;
  trigger: React.ReactNode;
}

export default function ImproveDescriptionPopover({
  isOpen,
  onOpenChange,
  onImprove,
  isImproving = false,
  trigger,
}: ImproveDescriptionPopoverProps) {
  const [feedback, setFeedback] = useState('');

  const handleImprove = () => {
    onImprove(feedback.trim() || undefined);
    setFeedback(''); // Reset for next use
  };

  const handleOpenChange = (open: boolean) => {
    if (!isImproving) {
      if (!open) {
        setFeedback(''); // Reset when closing
      }
      onOpenChange(open);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Improve Description
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI will enhance your app's description
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={isImproving}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label htmlFor="feedback-input" className="text-xs font-medium text-foreground mb-1.5 block">
              Custom Instructions (Optional)
            </label>
            <Textarea
              id="feedback-input"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., 'Make it more playful' or 'Emphasize productivity features'"
              className="w-full text-sm resize-none"
              rows={3}
              disabled={isImproving}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Leave blank for automatic improvement
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isImproving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImprove}
              disabled={isImproving}
            >
              {isImproving ? (
                'Improving...'
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Improve
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

