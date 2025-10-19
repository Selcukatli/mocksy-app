'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImproveDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImprove: (feedback?: string) => void;
  isImproving?: boolean;
}

export default function ImproveDescriptionModal({
  isOpen,
  onClose,
  onImprove,
  isImproving = false,
}: ImproveDescriptionModalProps) {
  const [feedback, setFeedback] = useState('');

  const handleImprove = () => {
    onImprove(feedback.trim() || undefined);
    setFeedback(''); // Reset for next use
  };

  const handleClose = () => {
    if (!isImproving) {
      setFeedback('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Improve App Description
          </DialogTitle>
          <DialogDescription>
            AI will reformat your description with better structure and natural App Store style.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <label htmlFor="improvement-feedback" className="text-sm font-medium text-foreground mb-1.5 block">
              Custom Instructions (Optional)
            </label>
            <textarea
              id="improvement-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., 'Make it more playful' or 'Emphasize productivity features'"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              disabled={isImproving}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Leave blank for automatic improvement with best practices
            </p>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImproving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImprove}
              disabled={isImproving}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isImproving ? 'Improving...' : 'Improve Description'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

