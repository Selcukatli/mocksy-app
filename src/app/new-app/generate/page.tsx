'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Lightbulb,
  RefreshCcw,
  Palette,
  Upload,
  Image as ImageIcon,
  X,
  FolderOpen
} from 'lucide-react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import Toast from '@/components/Toast';
import GenerationProgressModal from './components/GenerationProgressModal';
import type { Id } from '../../../../convex/_generated/dataModel';

const AUTO_CATEGORY_OPTION = 'Automatically Inferred';
const CATEGORY_OPTIONS = [AUTO_CATEGORY_OPTION, 'Productivity', 'Lifestyle', 'Education', 'Health & Fitness', 'Business', 'Games'];
const MAX_REFERENCE_IMAGES = 4;


type ReferenceImage = {
  id: string;
  file: File;
  preview: string;
  name: string;
};

export default function GenerateNewAppPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const generateAppAction = useAction(api.demoActions.generateApp);
  const improveDescription = useAction(api.demoActions.improveAppDescription);

  const [idea, setIdea] = useState('');
  const [category, setCategory] = useState<string>(AUTO_CATEGORY_OPTION);
  const [style, setStyle] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const referenceImagesRef = useRef<ReferenceImage[]>([]);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpandingIdea, setIsExpandingIdea] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false
  });
  const [generatingAppId, setGeneratingAppId] = useState<Id<"apps"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Poll for app generation status
  const appStatus = useQuery(
    api.apps.getAppGenerationStatus,
    generatingAppId ? { appId: generatingAppId } : "skip"
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/welcome?mode=sign-in&context=new-app');
    }
  }, [isLoaded, isSignedIn, router]);

  const disabled = !idea.trim() || isSubmitting || isExpandingIdea;

  useEffect(() => {
    referenceImagesRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    return () => {
      referenceImagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  const handleReferenceSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = MAX_REFERENCE_IMAGES - referenceImages.length;
    if (remainingSlots <= 0) {
      event.target.value = '';
      return;
    }

    const toAdd = Array.from(files)
      .slice(0, remainingSlots)
      .map((file) => ({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));

    setReferenceImages((prev) => [...prev, ...toAdd]);
    event.target.value = '';
  };

  const handleRemoveReferenceImage = (id: string) => {
    setReferenceImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((image) => image.id !== id);
    });
  };

  const triggerReferenceUpload = () => {
    referenceInputRef.current?.click();
  };

  const handleExpandIdea = async () => {
    if (!idea.trim() || isExpandingIdea) return;
    setIsExpandingIdea(true);

    try {
      // Use style if provided, fallback to category
      const vibeHint = style.trim()
        ? style.trim()
        : category !== AUTO_CATEGORY_OPTION
          ? category
          : undefined;

      const result = await improveDescription({
        draftDescription: idea,
        vibeHint,
      });

      if (result.improvedDescription) {
        setIdea(result.improvedDescription);
      }
      if (result.improvedStyle) {
        setStyle(result.improvedStyle);
      }
      if (result.inferredCategory) {
        setCategory(result.inferredCategory);
      }

      // Show toast notification
      setToast({
        message: 'AI expanded your idea and inferred category & style ✨',
        type: 'success',
        isOpen: true
      });
    } catch (error) {
      console.error('Failed to expand description', error);
      setToast({
        message: 'Failed to expand description. Please try again.',
        type: 'error',
        isOpen: true
      });
    } finally {
      setIsExpandingIdea(false);
    }
  };

  // Handle modal close (only if complete)
  const handleModalClose = () => {
    const isComplete = (appStatus?.totalScreens || 0) >= 5;
    if (isComplete) {
      setIsModalOpen(false);
      setGeneratingAppId(null);
      setIsSubmitting(false);
      if (generatingAppId) {
        router.push(`/app/${generatingAppId}`);
      }
    }
  };

  // Handle view app button
  const handleViewApp = () => {
    setIsModalOpen(false);
    setGeneratingAppId(null);
    setIsSubmitting(false);
    if (generatingAppId) {
      router.push(`/app/${generatingAppId}`);
    }
  };

  const handleGenerate = async () => {
    if (disabled) return;
    setIsSubmitting(true);
    setIsModalOpen(true);

    try {
      const selectedCategory = category === AUTO_CATEGORY_OPTION ? undefined : category;
      const selectedVibe = style.trim() || undefined;

      // Call the new generateApp action which creates app with icon + screens
      const appId = await generateAppAction({
        appDescription: idea,
        category: selectedCategory,
        vibe: selectedVibe,
      });

      setGeneratingAppId(appId);

      // The modal will stay open and poll for status updates
      // When complete, user can click "View your app" button
    } catch (error) {
      console.error('Failed to generate app', error);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setToast({
        message: 'Failed to generate app. Please try again.',
        type: 'error',
        isOpen: true
      });
    }
  };

  if (!isLoaded || (isLoaded && !isSignedIn)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
      <GenerationProgressModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        appIcon={appStatus?.app.iconUrl}
        appName={appStatus?.app.name}
        appCategory={appStatus?.app.category}
        appDescription={appStatus?.app.description}
        screenUrls={appStatus?.screens.map(s => s.screenUrl).filter((url): url is string => !!url) || []}
        screensGenerated={appStatus?.totalScreens || 0}
        totalScreens={5}
        onViewApp={handleViewApp}
      />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered starter flow
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Describe your idea, we&apos;ll draft mockups
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Share the pitch, pick a vibe, and we&apos;ll spin up a starter app entry and mockups you can refine.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]"
        >
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Describe your app idea</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tell us what it does, who it&apos;s for, and the standout features. We&apos;ll draft around this brief.
                  </p>
                </div>
              </div>
              <div className="relative mt-4">
                <textarea
                  id="app-idea"
                  value={idea}
                  onChange={(event) => setIdea(event.target.value)}
                  placeholder="Example: A wellness companion that turns daily journaling into affirmations, tracks mood trends, and nudges me with mindful breaks."
                  rows={6}
                  className="w-full rounded-xl border bg-background px-4 py-3 pr-36 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleExpandIdea}
                  disabled={!idea.trim() || isExpandingIdea}
                  aria-busy={isExpandingIdea}
                  className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border-muted-foreground/30 bg-background/90 px-3 text-xs font-semibold text-foreground shadow-sm backdrop-blur hover:border-muted-foreground/60 hover:bg-background disabled:opacity-70"
                >
                  {isExpandingIdea ? (
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  )}
                  Expand with AI
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Visual style & vibe</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Optional. Describe the look, feel, colors, and design aesthetic you want.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <textarea
                    id="style"
                    value={style}
                    onChange={(event) => setStyle(event.target.value)}
                    placeholder="e.g. Minimal & clean with neutral palettes and crisp typography, or Playful & vibrant with bright colors and rounded shapes..."
                    rows={3}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Reference images (optional)</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add inspiration shots or existing screenshots. We&apos;ll surface them in future updates to guide layout and style.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Array.from({ length: MAX_REFERENCE_IMAGES }).map((_, index) => {
                    const image = referenceImages[index];
                    const isAddSlot = !image && index === referenceImages.length && referenceImages.length < MAX_REFERENCE_IMAGES;

                    if (image) {
                      return (
                        <div key={image.id} className="relative h-24 w-full overflow-hidden rounded-lg border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.preview} alt={image.name} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReferenceImage(image.id)}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                            aria-label="Remove reference"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    }

                    if (isAddSlot) {
                      const remaining = MAX_REFERENCE_IMAGES - referenceImages.length;
                      return (
                        <button
                          key="reference-add"
                          type="button"
                          onClick={triggerReferenceUpload}
                          className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/40 text-xs text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-muted/40"
                        >
                          <Upload className="h-5 w-5" />
                          Add image
                          <span className="text-[10px] text-muted-foreground/80">{remaining} left</span>
                        </button>
                      );
                    }

                    return (
                      <div
                        key={`reference-ghost-${index}`}
                        className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10 text-[10px] uppercase tracking-wide text-muted-foreground/70"
                        aria-hidden="true"
                      >
                        Preview
                      </div>
                    );
                  })}
                </div>
                <input
                  ref={referenceInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleReferenceSelect}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Category</h2>
                      <p className="mt-1 text-xs text-muted-foreground">App Store category for discoverability.</p>
                    </div>
                    <select
                      id="category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="w-[360px] rounded-lg border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-fit flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="rounded-xl border border-dashed bg-background/80 p-4 text-sm text-muted-foreground">
              <Sparkles className="mr-2 inline h-4 w-4 text-primary" />
              Mocksy will generate your app with icon and 5 sample screenshots. This takes about 30-60 seconds.
            </div>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={disabled}
            >
              {isSubmitting ? 'Generating app with AI…' : 'Generate app' }
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/new-app/setup-existing-app')}
            >
              Set up existing app instead
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
