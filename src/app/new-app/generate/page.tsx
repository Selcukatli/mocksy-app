'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  X,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import Toast from '@/components/Toast';
import AppConceptCard from '@/components/AppConceptCard';
import AppConceptDetailModal from '@/components/AppConceptDetailModal';
import type { Id } from '@convex/_generated/dataModel';

const MAX_REFERENCE_IMAGES = 4;

const ALL_EXAMPLE_PROMPTS = [
  // Wellness & Health
  "A wellness companion that tracks mood trends and provides mindful break reminders",
  "A meditation app with guided sessions that adapt to your stress levels throughout the day",
  "A sleep tracker that analyzes patterns and suggests personalized bedtime routines",
  
  // Productivity
  "A habit tracker with beautiful streak visualization and motivational daily check-ins",
  "A focus timer that blocks distracting apps and rewards deep work sessions with points",
  "A note-taking app that uses AI to organize thoughts and surface related ideas",
  
  // Food & Cooking
  "A recipe discovery app that suggests meals based on ingredients I already have",
  "A meal planning app that generates weekly grocery lists and tracks nutrition goals",
  "A cooking timer app that manages multiple dishes and alerts you at the perfect moment",
  
  // Games
  "A word puzzle game where players create chains of connected words to earn points",
  "A memory game that trains your brain with increasingly complex pattern sequences",
  "A trivia game that adapts difficulty based on your knowledge in different categories",
  "A relaxing puzzle game where you arrange colorful tiles to create beautiful patterns",
  "A competitive multiplayer game where players race to solve math challenges",
  
  // Social & Entertainment
  "A book club app where friends vote on monthly reads and schedule virtual discussions",
  "A movie night planner that helps groups decide what to watch together",
  "A journal app that turns daily entries into illustrated memory timelines",
  
  // Learning & Education
  "A language learning app that teaches through real conversations and cultural context",
  "A flashcard app that uses spaced repetition to optimize long-term memory retention",
  
  // Finance
  "A budget tracker that visualizes spending patterns and suggests savings opportunities",
  "A bill reminder app that alerts you before due dates and tracks payment history",
  
  // Lifestyle
  "A plant care app that reminds you to water and tracks growth with photo timelines",
  "A travel planner that builds custom itineraries based on your interests and budget",
  "A gift idea tracker that remembers loved ones' wishes and suggests perfect presents"
];

// Function to get random prompts with at least one game
function getRandomPrompts(count: number = 3): string[] {
  const gamePrompts = ALL_EXAMPLE_PROMPTS.filter(prompt => 
    prompt.includes('game') || prompt.includes('puzzle') || prompt.includes('trivia')
  );
  
  // Always include at least one game
  const randomGame = gamePrompts[Math.floor(Math.random() * gamePrompts.length)];
  
  // Get remaining prompts from all prompts (excluding the selected game)
  const remainingPrompts = ALL_EXAMPLE_PROMPTS.filter(prompt => prompt !== randomGame);
  const shuffled = remainingPrompts.sort(() => Math.random() - 0.5);
  
  // Combine: one game + (count-1) random others
  return [randomGame, ...shuffled.slice(0, count - 1)];
}

type ReferenceImage = {
  id: string;
  file: File;
  preview: string;
  name: string;
};

type AppConcept = {
  app_name: string;
  app_subtitle: string;
  app_description: string;
  app_category?: string; // Optional for backward compatibility with existing concepts
  style_description: string;
  app_icon_prompt: string;
  cover_image_prompt: string;
  icon_url?: string;
  cover_url?: string;
};

export default function GenerateNewAppPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const generateConcepts = useAction(api.features.appGeneration.generateAppConcepts);
  const generateAppFromConcept = useAction(api.features.appGeneration.generateAppFromConcept);
  
  const firstName = user?.firstName || 'there';

  // Form state
  const [idea, setIdea] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const referenceImagesRef = useRef<ReferenceImage[]>([]);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const [examplePrompts, setExamplePrompts] = useState(() => getRandomPrompts(3));
  const [isMac, setIsMac] = useState(true);
  
  const refreshExamples = () => {
    setExamplePrompts(getRandomPrompts(3));
  };

  // Concept generation state
  const [view, setView] = useState<'form' | 'concepts'>('form');
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [conceptJobId, setConceptJobId] = useState<Id<'conceptGenerationJobs'> | null>(null);
  const [concepts, setConcepts] = useState<AppConcept[]>([]);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);
  const [viewingConceptIndex, setViewingConceptIndex] = useState<number | null>(null);
  const [isGeneratingApp, setIsGeneratingApp] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  // Poll for concept images
  const conceptJob = useQuery(
    api.features.appGeneration.jobs.getConceptGenerationJob,
    conceptJobId ? { jobId: conceptJobId } : 'skip'
  );

  // Detect OS for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/welcome?mode=sign-in&context=new-app');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    referenceImagesRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    return () => {
      referenceImagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  // Update concepts when job data changes
  useEffect(() => {
    if (conceptJob?.concepts) {
      setConcepts(conceptJob.concepts);
    }
  }, [conceptJob]);

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

  const handleGenerateConcepts = async () => {
    if (!idea.trim() || isGeneratingConcepts) return;
    setIsGeneratingConcepts(true);
    
    // Switch to concepts view immediately with loading state
    setView('concepts');

    try {
      const result = await generateConcepts({
        appDescriptionInput: idea,
      });

      setConceptJobId(result.jobId);
      setConcepts(result.concepts);
    } catch (error) {
      console.error('Failed to generate concepts', error);
      setToast({
        message: 'Failed to generate concepts. Please try again.',
        type: 'error',
        isOpen: true
      });
      // Go back to form on error
      setView('form');
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const handleSelectConcept = async (index: number, editedValues?: Partial<AppConcept>) => {
    if (isGeneratingApp) return;
    
    setSelectedConceptIndex(index);
    const selectedConcept = concepts[index];
    
    // Check if concept has required images
    if (!selectedConcept.icon_url || !selectedConcept.cover_url) {
      setToast({
        message: 'Concept images are still generating. Please wait.',
        type: 'info',
        isOpen: true
      });
      setSelectedConceptIndex(null);
      return;
    }
    
    setIsGeneratingApp(true);

    try {
      // Use new action to generate app from concept
      // Start full generation immediately - no preview step
      // Use edited values if provided, otherwise use original concept values
      const { appId } = await generateAppFromConcept({
        concept: {
          app_name: editedValues?.app_name ?? selectedConcept.app_name,
          app_subtitle: editedValues?.app_subtitle ?? selectedConcept.app_subtitle,
          app_description: editedValues?.app_description ?? selectedConcept.app_description,
          app_category: selectedConcept.app_category || 'Lifestyle', // Default category for backward compatibility
          style_description: selectedConcept.style_description,
          icon_url: selectedConcept.icon_url,
          cover_url: selectedConcept.cover_url,
        },
        // No skipScreenshots - start full generation
        numScreens: 5, // Generate 5 screenshots
      });

      // Navigate directly to appstore view with progressive loading
      router.push(`/appstore/${appId}`);
    } catch (error) {
      console.error('Failed to generate app from concept', error);
      setIsGeneratingApp(false);
      setSelectedConceptIndex(null);
      setToast({
        message: 'Failed to generate app. Please try again.',
        type: 'error',
        isOpen: true
      });
    }
  };

  const handleBackToForm = () => {
    setView('form');
    setConceptJobId(null);
    setConcepts([]);
    setSelectedConceptIndex(null);
  };

  const disabled = !idea.trim() || isGeneratingConcepts;

  // Handle Cmd+Enter / Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!disabled) {
          handleGenerateConcepts();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Calculate progress based on concept job status OR if actively generating
  const conceptProgress = (() => {
    // If we're generating but don't have a job yet, show initial progress
    if (isGeneratingConcepts && !conceptJob) {
      return { progress: 10, message: 'Starting generation...' };
    }
    
    // If we have a job, show progress based on status
    if (conceptJob) {
      const status = conceptJob.status;
      if (status === 'generating_concepts') return { progress: 30, message: 'Generating concepts...' };
      if (status === 'generating_images') return { progress: 70, message: 'Generating images...' };
      if (status === 'completed') return { progress: 100, message: 'Concepts ready!' };
      return { progress: 10, message: 'Starting...' };
    }
    
    return null;
  })();

  const showProgress = view === 'concepts' && (isGeneratingConcepts || (conceptJob && conceptJob.status !== 'completed' && conceptJob.status !== 'failed'));

  return (
    <div className="bg-background">
      {/* Sticky Progress Bar */}
      {showProgress && conceptProgress && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
        >
          <div className="mx-auto max-w-6xl px-6 py-3 md:px-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-primary flex-1">
                {conceptProgress.message}
              </p>
              <span className="text-xs text-muted-foreground font-mono">
                {Math.round(conceptProgress.progress)}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${conceptProgress.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl text-center"
            >
              {/* Personalized Greeting */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                  Hey, {firstName}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
                  Describe your app idea, I&apos;ll show you concepts
                </p>
              </motion.div>

              {/* Input Area */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="mt-10 space-y-4"
              >
                {/* Reference Images Preview */}
                {referenceImages.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {referenceImages.map((image, index) => {
                      const rotations = ['rotate-[-2deg]', 'rotate-[1deg]', 'rotate-[-1.5deg]', 'rotate-[2deg]'];
                      const rotation = rotations[index % rotations.length];
                      return (
                        <div 
                          key={image.id} 
                          className={`relative h-16 w-16 rounded-lg border shadow-md transition-transform hover:scale-105 ${rotation}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.preview} alt={image.name} className="h-full w-full rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReferenceImage(image.id)}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                            aria-label="Remove reference"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Textarea with integrated action bar */}
                <div className="relative rounded-2xl border border-border/60 bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <textarea
                    id="app-idea"
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    placeholder="Example: A wellness companion that turns daily journaling into affirmations, tracks mood trends, and nudges me with mindful breaks."
                    rows={4}
                    className="w-full resize-none rounded-t-2xl bg-transparent px-6 py-4 text-base focus:outline-none placeholder:text-muted-foreground/50"
                  />
                  <input
                    ref={referenceInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleReferenceSelect}
                  />
                  
                  {/* Action bar inside textarea */}
                  <div className="flex items-center justify-between px-4 py-3">
                    {/* Attach Reference Button */}
                    <button
                      type="button"
                      onClick={triggerReferenceUpload}
                      disabled={referenceImages.length >= MAX_REFERENCE_IMAGES}
                      className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>Attach reference</span>
                      {referenceImages.length > 0 && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {referenceImages.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generate Button as CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateConcepts}
                    disabled={disabled}
                    className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{isGeneratingConcepts ? 'Generating concepts…' : 'Generate concepts'}</span>
                    {!isGeneratingConcepts && (
                      <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-primary-foreground/20 px-2 py-0.5 text-xs font-mono text-primary-foreground/90">
                        <span className="text-[10px]">{isMac ? '⌘' : 'Ctrl'}</span>
                        <span>↵</span>
                      </kbd>
                    )}
                    {!isGeneratingConcepts && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>

                {/* Example Prompts */}
                <div className="pt-10 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">Or try one of these examples:</p>
                  <div className="flex flex-col items-center gap-3">
                    <AnimatePresence mode="popLayout">
                      {examplePrompts.slice(0, -1).map((prompt, index) => (
                        <motion.button
                          key={prompt}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          type="button"
                          onClick={() => setIdea(prompt)}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-5 py-2.5 text-sm text-foreground transition-all hover:bg-muted/80 hover:border-primary/30"
                        >
                          <span>{prompt}</span>
                        </motion.button>
                      ))}
                      {/* Last pill with refresh button */}
                      <div className="flex items-center gap-3">
                        <motion.button
                          key={examplePrompts[examplePrompts.length - 1]}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2, delay: (examplePrompts.length - 1) * 0.05 }}
                          type="button"
                          onClick={() => setIdea(examplePrompts[examplePrompts.length - 1])}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-5 py-2.5 text-sm text-foreground transition-all hover:bg-muted/80 hover:border-primary/30"
                        >
                          <span>{examplePrompts[examplePrompts.length - 1]}</span>
                        </motion.button>
                        {/* Refresh Button */}
                        <motion.button
                          type="button"
                          onClick={refreshExamples}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground hover:border-primary/30"
                          title="Show more examples"
                          whileTap={{ rotate: 180, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="concepts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full py-8"
            >
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to form
                </button>
                <h1 className="mt-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
                  {concepts.length > 0 ? 'Pick your favorite concept' : 'Generating concepts...'}
                </h1>
                <p className="mt-3 text-center text-base text-muted-foreground sm:text-lg">
                  {concepts.length > 0 
                    ? 'We generated 4 unique visual concepts. Select one to continue with full app generation.'
                    : 'Creating 4 unique app concepts tailored to your idea. This will take about 15-20 seconds.'
                  }
                </p>
              </motion.div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {concepts.length > 0 ? (
                    concepts.map((concept, index) => (
                      <motion.div
                        key={`concept-${index}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <AppConceptCard
                          concept={concept}
                          isSelected={selectedConceptIndex === index}
                          onClick={() => setViewingConceptIndex(index)}
                        />
                      </motion.div>
                    ))
                  ) : (
                    // Loading skeletons while concepts are being generated
                    Array.from({ length: 4 }).map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm"
                      >
                        {/* Cover skeleton with overlaid icon/text */}
                        <div className="relative bg-muted-foreground/10">
                          {/* Cover image skeleton with gradient mask */}
                          <div 
                            className="aspect-[2/1] w-full animate-pulse bg-muted-foreground/15"
                            style={{
                              maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                            }}
                          />
                          
                          {/* Icon + Title skeleton (overlapping) */}
                          <div className="relative -mt-12 flex items-start gap-4 p-5">
                            {/* Icon skeleton - larger */}
                            <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-[18%] bg-gray-100 dark:bg-gray-800 shadow-xl ring-2 ring-border" />
                            
                            {/* Text content skeleton */}
                            <div className="flex-1 space-y-2 pt-1">
                              <div className="h-6 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
                              <div className="h-4 w-full animate-pulse rounded bg-muted-foreground/15" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Description skeleton */}
                        <div className="flex flex-1 flex-col gap-3 bg-muted-foreground/5 p-5">
                          <div className="space-y-2">
                            <div className="h-3 w-full animate-pulse rounded bg-muted-foreground/20" />
                            <div className="h-3 w-full animate-pulse rounded bg-muted-foreground/20" />
                            <div className="h-3 w-2/3 animate-pulse rounded bg-muted-foreground/20" />
                          </div>
                          
                          <div className="mt-auto flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                            <span>Generating concept {index + 1}...</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {concepts.length > 0 && conceptJob?.status === 'generating_images' && (
                <div className="mt-6 rounded-xl border border-dashed bg-background/80 p-4 text-center text-sm text-muted-foreground">
                  <Sparkles className="mr-2 inline h-4 w-4 animate-pulse text-primary" />
                  Images are still generating in the background. You can select a concept now or wait for images to load.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Concept Detail Modal */}
      <AnimatePresence>
        {viewingConceptIndex !== null && concepts[viewingConceptIndex] && (
          <AppConceptDetailModal
            concept={concepts[viewingConceptIndex]}
            isSelected={selectedConceptIndex === viewingConceptIndex}
            onSelect={(editedValues) => {
              handleSelectConcept(viewingConceptIndex, editedValues);
              setViewingConceptIndex(null);
            }}
            onClose={() => setViewingConceptIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
