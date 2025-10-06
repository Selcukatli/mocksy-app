'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  X
} from 'lucide-react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';

const DEFAULT_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese'];
const AUTO_CATEGORY_OPTION = 'Let Mocksy decide';
const CATEGORY_OPTIONS = [AUTO_CATEGORY_OPTION, 'Productivity', 'Lifestyle', 'Education', 'Health & Fitness', 'Business', 'Games'];
const VIBE_PRESETS = [
  {
    label: 'Minimal & clean',
    description: 'Neutral palettes, crisp typography, plenty of white space.',
  },
  {
    label: 'Playful & vibrant',
    description: 'Bright colors, rounded shapes, and an upbeat tone.',
  },
  {
    label: 'Futuristic neon',
    description: 'High-contrast gradients and glowing, tech-forward motifs.',
  },
  {
    label: 'Calm wellness',
    description: 'Soft hues, soothing motion, mindful breathing room.',
  },
  {
    label: 'Bold fintech',
    description: 'Confident tones, sharp edges, data-rich visuals.',
  },
];
const MAX_REFERENCE_IMAGES = 4;

const titleCase = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');

const buildDescription = (idea: string, category?: string, vibe?: string) => {
  const categoryDescriptor = category ? `${category.toLowerCase()} concept` : 'concept';
  const base = `Mocksy drafted this ${categoryDescriptor} from your brief: ${idea.trim()}.`;
  if (vibe && vibe.trim().length > 0) {
    return `${base} The design direction leans into a ${vibe.trim()} aesthetic. Tweak any detail before you start planning screenshot sets.`;
  }
  return `${base} Tweak any detail before you start planning screenshot sets.`;
};

type ReferenceImage = {
  id: string;
  file: File;
  preview: string;
  name: string;
};

export default function GenerateNewAppPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const createAppMutation = useMutation(api.apps.createApp);
  const improveDescription = useAction(api.demoActions.improveAppDescription);

  const [idea, setIdea] = useState('');
  const [category, setCategory] = useState<string>(AUTO_CATEGORY_OPTION);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGES[0]);
  const [vibe, setVibe] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const referenceImagesRef = useRef<ReferenceImage[]>([]);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpandingIdea, setIsExpandingIdea] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/welcome?mode=sign-in&context=new-app');
    }
  }, [isLoaded, isSignedIn, router]);

  const generatedName = useMemo(() => {
    if (!idea.trim()) return '';

    // If idea contains "AppName: Description" format, extract the app name
    const colonIndex = idea.indexOf(':');
    if (colonIndex > 0 && colonIndex < 30) {
      const potentialName = idea.substring(0, colonIndex).trim();
      // Verify it's a reasonable app name (1-4 words, not too long)
      const wordCount = potentialName.split(/\s+/).length;
      if (wordCount <= 4 && potentialName.length <= 30) {
        return potentialName;
      }
    }

    // Fallback: title case the idea
    const base = titleCase(idea);
    if (base.length <= 24) return base;
    return `${base.slice(0, 21).trim()}…`;
  }, [idea]);

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
      const vibeHint = vibe.trim()
        ? vibe.trim()
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
    } catch (error) {
      console.error('Failed to expand description', error);
    } finally {
      setIsExpandingIdea(false);
    }
  };

  const handleGenerate = async () => {
    if (disabled) return;
    setIsSubmitting(true);
    try {
      const selectedCategory = category === AUTO_CATEGORY_OPTION ? undefined : category;
      const fallbackName = selectedCategory ? `${selectedCategory} App` : 'New Mocksy app';
      const name = generatedName || fallbackName;
      const description = buildDescription(idea, selectedCategory, vibe);
      const platforms = { ios: true, android: true };

      const appId = await createAppMutation({
        name,
        description,
        category: selectedCategory,
        platforms,
        languages: [language],
      });

      router.push(`/app/${appId}`);
    } catch (error) {
      console.error('Failed to generate app', error);
      setIsSubmitting(false);
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
              <div className="mt-6">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Pick a category focus
                </label>
                <p className="mt-1 text-xs text-muted-foreground">Let Mocksy infer the domain or choose one yourself.</p>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Desired vibe or look</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Optional. Helps Mocksy match tone when drafting copy.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {VIBE_PRESETS.map((preset) => {
                    const isActive = vibe === preset.label;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setVibe(preset.label)}
                        aria-pressed={isActive}
                        title={preset.description}
                        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                          isActive
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/60 hover:bg-muted/40'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <label htmlFor="vibe" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Or describe your own look
                  </label>
                  <input
                    id="vibe"
                    value={vibe}
                    onChange={(event) => setVibe(event.target.value)}
                    placeholder="e.g. Cozy illustrated wellness"
                    className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
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

              <div className="rounded-2xl border bg-card p-6 shadow-sm md:col-span-2">
                <span className="text-sm font-medium text-foreground">Primary language</span>
                <p className="mt-1 text-xs text-muted-foreground">You can add more locales later.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {DEFAULT_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        language === lang ? 'bg-foreground text-background border-foreground' : 'hover:bg-muted/60'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLanguage('English')}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-fit flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="rounded-xl border border-dashed bg-background/80 p-4 text-sm text-muted-foreground">
              <Sparkles className="mr-2 inline h-4 w-4 text-primary" />
              Mocksy will create the app entry instantly. You can still edit the name, description, platforms, and languages afterward.
            </div>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={disabled}
            >
              {isSubmitting ? 'Generating…' : 'Generate app' }
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/new-app/manual')}
            >
              Set up existing app instead
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
