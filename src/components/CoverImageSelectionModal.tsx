'use client';

import { useState } from 'react';
import { X, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface CoverImageVariant {
  imageUrl: string;
  width?: number;
  height?: number;
}

interface CoverImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants?: CoverImageVariant[];
  isGenerating: boolean;
  imagePrompt?: string;
  onSave: (imageUrl: string) => Promise<void>;
}

export default function CoverImageSelectionModal({
  isOpen,
  onClose,
  variants,
  isGenerating,
  imagePrompt,
  onSave,
}: CoverImageSelectionModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selectedIndex === null || !variants || !variants[selectedIndex]) return;
    
    setIsSaving(true);
    try {
      await onSave(variants[selectedIndex].imageUrl);
      onClose();
    } catch (error) {
      console.error('Error saving cover image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return; // Prevent closing while saving
    onClose();
    setSelectedIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-semibold">Select Cover Image</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the best variant for your app
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Image Prompt - Collapsible */}
          {imagePrompt && !isGenerating && (
            <div className="mb-6">
              <button
                onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 rounded-lg transition-colors"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  Generated Prompt
                </p>
                {isPromptExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isPromptExpanded && (
                <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-muted">
                  <p className="text-sm leading-relaxed">{imagePrompt}</p>
                </div>
              )}
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            {isGenerating ? (
              // Loading placeholders - colorful and fun
              Array.from({ length: 4 }).map((_, i) => {
                const gradients = [
                  'from-purple-400/20 via-pink-400/20 to-red-400/20',
                  'from-blue-400/20 via-cyan-400/20 to-teal-400/20',
                  'from-orange-400/20 via-yellow-400/20 to-amber-400/20',
                  'from-green-400/20 via-emerald-400/20 to-lime-400/20',
                ];
                const spinnerColors = [
                  'text-purple-500',
                  'text-cyan-500',
                  'text-orange-500',
                  'text-green-500',
                ];
                return (
                  <div
                    key={i}
                    className={`aspect-video bg-gradient-to-br ${gradients[i]} rounded-lg flex items-center justify-center border border-dashed border-current/20 relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-pulse" />
                    <div className="text-center relative z-10">
                      <Loader2 className={`h-10 w-10 animate-spin ${spinnerColors[i]} mx-auto mb-3`} />
                      <p className="text-sm font-medium text-foreground/80">
                        Generating variant {i + 1}...
                      </p>
                      <div className="flex gap-1 justify-center mt-2">
                        {[0, 1, 2].map((dot) => (
                          <div
                            key={dot}
                            className={`w-1.5 h-1.5 rounded-full ${spinnerColors[i]} opacity-60`}
                            style={{
                              animation: `bounce 1.4s infinite ${dot * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Generated images
              variants?.map((variant, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`group relative aspect-video rounded-lg overflow-hidden border-4 transition-all duration-200 ${
                    selectedIndex === i
                      ? 'border-primary shadow-xl scale-[1.02]'
                      : 'border-muted hover:border-primary/60 hover:shadow-lg hover:scale-[1.05]'
                  }`}
                >
                  <Image
                    src={variant.imageUrl}
                    alt={`Cover variant ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-110"
                    unoptimized
                  />
                  
                  {/* Selected checkmark */}
                  {selectedIndex === i && (
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg animate-in zoom-in-50 duration-200">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                  
                  {/* Variant label - only show when NOT selected */}
                  {selectedIndex !== i && (
                    <div className="absolute bottom-3 left-3 text-white text-xs px-2.5 py-1.5 rounded-md bg-black/70 group-hover:bg-black/90 transition-all duration-200">
                      Variant {i + 1}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Empty state if no variants and not generating */}
          {!isGenerating && (!variants || variants.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No variants generated</p>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        {!isGenerating && variants && variants.length > 0 && (
          <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-between rounded-b-2xl z-10">
            <p className="text-sm text-muted-foreground">
              {selectedIndex !== null
                ? `Variant ${selectedIndex + 1} selected`
                : 'Select a variant to save'}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={selectedIndex === null || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Selected'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

