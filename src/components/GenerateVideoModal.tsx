'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Sparkles, Video } from 'lucide-react';

interface GenerateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (customPrompt?: string) => void;
  isRegenerating?: boolean;
  isGenerating?: boolean;
}

export default function GenerateVideoModal({
  isOpen,
  onClose,
  onGenerate,
  isRegenerating = false,
  isGenerating = false,
}: GenerateVideoModalProps) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    onGenerate(prompt.trim() || undefined);
    setPrompt(''); // Reset for next use
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            {isRegenerating ? 'Regenerate' : 'Generate'} Cover Video
          </DialogTitle>
          <DialogDescription>
            AI will create a seamless 6-second looping video from your cover image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <label htmlFor="motion-prompt" className="text-sm font-medium text-foreground mb-1.5 block">
              Custom Motion (Optional)
            </label>
            <textarea
              id="motion-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'subtle parallax with floating elements' or 'gentle breathing effect'"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Leave blank for default smooth, subtle motion
            </p>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-md border hover:bg-muted transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : isRegenerating ? 'Regenerate' : 'Generate'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

