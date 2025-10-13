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
} from 'lucide-react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Button } from '@/components/ui/button';
import Toast from '@/components/Toast';
import AppConceptCard from '@/components/AppConceptCard';
import type { Id } from '@convex/_generated/dataModel';

const CATEGORIES = [
  'Productivity',
  'Health & Fitness',
  'Education',
  'Games',
  'Lifestyle',
  'Business',
  'Social',
  'Entertainment',
];

const MAX_REFERENCE_IMAGES = 4;

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
  style_description: string;
  app_icon_prompt: string;
  cover_image_prompt: string;
  icon_url?: string;
  cover_url?: string;
};

export default function GenerateNewAppPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const generateConcepts = useAction(api.appGenerationActions.generateAppConcepts);
  const scheduleAppGeneration = useAction(api.appGenerationActions.scheduleAppGeneration);

  // Form state
  const [idea, setIdea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const referenceImagesRef = useRef<ReferenceImage[]>([]);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);

  // Concept generation state
  const [view, setView] = useState<'form' | 'concepts'>('form');
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [conceptJobId, setConceptJobId] = useState<Id<'conceptGenerationJobs'> | null>(null);
  const [concepts, setConcepts] = useState<AppConcept[]>([]);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);
  const [isGeneratingApp, setIsGeneratingApp] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  // Poll for concept images
  const conceptJob = useQuery(
    api.conceptGenerationJobs.getConceptGenerationJob,
    conceptJobId ? { jobId: conceptJobId } : 'skip'
  );

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
        categoryHint: selectedCategory || undefined,
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

  const handleSelectConcept = async (index: number) => {
    if (isGeneratingApp) return;
    
    setSelectedConceptIndex(index);
    setIsGeneratingApp(true);

    try {
      const selectedConcept = concepts[index];
      
      // Call scheduleAppGeneration with the selected concept data
      const { appId } = await scheduleAppGeneration({
        appDescriptionInput: `${selectedConcept.app_name}: ${selectedConcept.app_description}`,
        uiStyle: selectedConcept.style_description,
      });

      // Navigate to the generation progress page
      router.push(`/app/${appId}/generation`);
    } catch (error) {
      console.error('Failed to generate app', error);
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

  const disabled = !idea.trim() || isGeneratingConcepts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12 md:px-12">
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI-powered starter flow
                </div>
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  Describe your idea, we&apos;ll show you concepts
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                  Tell us about your app and we&apos;ll generate 4 unique visual concepts to choose from.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="mt-8 space-y-8"
              >
                {/* App Idea Box with Integrated Actions */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  {/* Reference Images Preview - At the top */}
                  {referenceImages.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-3">
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
                  
                  <textarea
                    id="app-idea"
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    placeholder="Example: A wellness companion that turns daily journaling into affirmations, tracks mood trends, and nudges me with mindful breaks."
                    rows={5}
                    className="w-full resize-none bg-transparent text-base focus:outline-none placeholder:text-muted-foreground/60"
                  />
                  
                  <input
                    ref={referenceInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleReferenceSelect}
                  />
                  
                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Attach Reference Button */}
                      <button
                        type="button"
                        onClick={triggerReferenceUpload}
                        disabled={referenceImages.length >= MAX_REFERENCE_IMAGES}
                        className="inline-flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span>Attach reference</span>
                      </button>
                      
                      {/* Category Dropdown */}
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded-lg border border-border/40 bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-foreground/20"
                      >
                        <option value="">Category (optional)</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Generate Button */}
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleGenerateConcepts}
                      disabled={disabled}
                    >
                      {isGeneratingConcepts ? 'Generating concepts…' : 'Generate concepts'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  {concepts.length > 0 ? 'Pick your favorite concept' : 'Generating concepts...'}
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">
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
                          onClick={() => handleSelectConcept(index)}
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
                          {/* Cover image skeleton */}
                          <div className="aspect-[2/1] w-full animate-pulse bg-muted-foreground/15" />
                          
                          {/* Icon + Title skeleton (overlapping) */}
                          <div className="relative -mt-12 flex items-start gap-4 p-5">
                            {/* Icon skeleton - larger */}
                            <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-[18%] bg-muted-foreground/10 shadow-xl ring-2 ring-border" />
                            
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
    </div>
  );
}
