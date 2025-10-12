'use client';

import { useState, useEffect } from 'react';
import { X, Check, Loader2, ArrowLeft, Sparkles, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
  appName: string;
  appIconUrl: string | null;
  onGenerate: (feedback: string) => void;
  estimatedTimeMs?: number;
}

export default function CoverImageSelectionModal({
  isOpen,
  onClose,
  variants,
  isGenerating,
  imagePrompt,
  onSave,
  appName,
  appIconUrl,
  onGenerate,
  estimatedTimeMs,
}: CoverImageSelectionModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stage, setStage] = useState<'input' | 'generating' | 'results'>('input');
  const [userFeedback, setUserFeedback] = useState('');
  const [progress, setProgress] = useState(0);

  // Reset to input stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('input');
      setUserFeedback('');
      setSelectedIndex(null);
    }
  }, [isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    // Save the current scroll position
    const scrollY = window.scrollY;
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Update stage based on generation state
  useEffect(() => {
    if (isGenerating) {
      setStage('generating');
      setProgress(0);
    } else if (variants && variants.length > 0) {
      setStage('results');
      setProgress(100);
    }
  }, [isGenerating, variants]);

  // Animate progress bar during generation using estimated time
  useEffect(() => {
    if (stage === 'generating') {
      // Use estimated time if available, otherwise default to 28 seconds (4 images × 7s)
      const expectedDuration = estimatedTimeMs || 28000;
      const targetProgress = 90; // Stop at 90% until complete
      
      // Calculate increment to reach 90% over expected duration
      const updateInterval = 500; // Update every 500ms
      const totalUpdates = expectedDuration / updateInterval;
      const incrementPerUpdate = targetProgress / totalUpdates;
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= targetProgress) return prev;
          // Add small random variation for natural feel
          const increment = incrementPerUpdate + (Math.random() - 0.5) * 2;
          return Math.min(targetProgress, prev + increment);
        });
      }, updateInterval);
      
      return () => clearInterval(interval);
    }
  }, [stage, estimatedTimeMs]);

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

  const handleGenerate = () => {
    onGenerate(userFeedback);
  };

  const handleBack = () => {
    setStage('input');
    setSelectedIndex(null);
  };

  const handleCopyPrompt = async () => {
    if (imagePrompt) {
      await navigator.clipboard.writeText(imagePrompt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-background px-6 py-5 flex flex-col rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              {appIconUrl && stage === 'input' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-20 h-20 relative rounded-2xl overflow-hidden flex-shrink-0 border-2 border-muted"
                >
                  <Image
                    src={appIconUrl}
                    alt={appName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
              )}
              <div>
                <h2 className="text-3xl font-semibold">
                  {stage === 'input' ? `Generate Cover Image for ${appName}` : 'Select Cover Image'}
                </h2>
                {stage !== 'input' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {stage === 'generating'
                      ? 'Generating cover image variants...'
                      : 'Choose the best variant for your app'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSaving || isGenerating}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          {stage === 'generating' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="px-6 pt-2 pb-2 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {stage === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <textarea
                  id="feedback"
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder="Guide the AI (optional) - e.g., 'Focus on gameplay', 'Minimal and clean', 'Show social features'..."
                  className="w-full h-36 px-4 py-3 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </motion.div>
            )}

          {stage === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => {
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className={`aspect-video bg-gradient-to-br ${gradients[i]} rounded-lg flex items-center justify-center border border-dashed border-current/20 relative overflow-hidden`}
                  >
                    {/* Animated gradient shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: i * 0.3,
                      }}
                    />
                    
                    {/* Pulsing background */}
                    <motion.div
                      className="absolute inset-0 bg-white/5"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.2,
                      }}
                    />
                    
                    <div className="text-center relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Loader2 className={`h-10 w-10 ${spinnerColors[i]} mx-auto mb-3`} />
                      </motion.div>
                      <p className="text-sm font-medium text-foreground/80">
                        Generating variant {i + 1}...
                      </p>
                      <div className="flex gap-1 justify-center mt-2">
                        {[0, 1, 2].map((dot) => (
                          <motion.div
                            key={dot}
                            className={`w-1.5 h-1.5 rounded-full ${spinnerColors[i]}`}
                            animate={{
                              y: [0, -8, 0],
                              opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: dot * 0.15,
                              ease: 'easeInOut',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
              </motion.div>
            )}

            {stage === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
            <>
              {/* Compact Prompt Display with Copy */}
              {imagePrompt && (
                <div className="mb-4 flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-muted/50">
                  <p className="text-xs text-muted-foreground flex-1 truncate">
                    <span className="font-medium">Prompt:</span> {imagePrompt}
                  </p>
                  <button
                    onClick={handleCopyPrompt}
                    className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                    title="Copy prompt"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-4">
                {variants?.map((variant, i) => (
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
                  </button>
                ))}
              </div>
            </>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - Sticky */}
        {stage === 'input' && (
          <div className="sticky bottom-0 bg-background px-6 py-3 flex items-center justify-end gap-3 rounded-b-2xl z-10">
            <Button
              onClick={handleClose}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        )}

        {stage === 'results' && variants && variants.length > 0 && (
          <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-between rounded-b-2xl z-10">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <p className="text-sm text-muted-foreground">
                {selectedIndex !== null
                  ? `Variant ${selectedIndex + 1} selected`
                  : 'Select a variant to save'}
              </p>
            </div>
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

