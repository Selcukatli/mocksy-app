'use client';

import {
  Sparkles,
  Search,
  X,
  TrendingUp,
  Upload,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Suspense, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

export default function StylesPage() {
  return (
    <Suspense fallback={<StylesPageFallback />}>
      <StylesPageContent />
    </Suspense>
  );
}

function StylesPageContent() {
  const { user } = useUser();
  const isSignedIn = !!user;
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [styleDescription, setStyleDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('tag') ?? '');

  // Fetch styles
  const publicStyles = useQuery(api.styles.getPublicStyles) || [];
  const generateStyleFromDescription = useAction(api.styleActions.generateStyleFromDescription);

  // Apply search filter
  const filteredStyles = publicStyles.filter(style =>
    style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    style.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateStyle = async () => {
    if (!styleDescription.trim()) return;

    setGenerating(true);
    try {
      // TODO: Upload reference image if provided and get URL
      let referenceImageUrl: string | undefined;
      if (referenceImage) {
        // For now, skip image upload - will implement later
        referenceImageUrl = undefined;
      }

      await generateStyleFromDescription({
        description: styleDescription.trim(),
        referenceImageUrl,
      });

      setShowCreateDialog(false);
      setStyleDescription('');
      setReferenceImage(null);
      setReferenceImagePreview(null);
    } catch (error) {
      console.error('Failed to generate style:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSetReferenceImage = useCallback((file: File) => {
    setReferenceImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSetReferenceImage(file);
    }
  };

  const updateTagFilter = useCallback(
    (value: string) => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set('tag', value);
      } else {
        params.delete('tag');
      }

      const search = params.toString();
      router.replace(`/styles${search ? `?${search}` : ''}`);
    },
    [router]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateTagFilter(value.trim());
  };

  useEffect(() => {
    const tagParam = searchParams.get('tag') ?? '';
    setSearchQuery((current) => (current === tagParam ? current : tagParam));
  }, [searchParams]);

  useEffect(() => {
    if (!showCreateDialog) {
      return;
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (!item.type.startsWith('image/')) continue;
        const file = item.getAsFile();
        if (!file) continue;

        const fileWithName = file.name
          ? file
          : new File([file], `pasted-image-${Date.now()}.png`, {
              type: file.type || 'image/png',
            });

        handleSetReferenceImage(fileWithName);
        event.preventDefault();
        break;
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [showCreateDialog, handleSetReferenceImage]);

  return (
    <div className="flex-1 p-8">
      {/* Sticky header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="sticky top-4 z-20 mb-8 rounded-xl border border-border/60 bg-card/95 px-5 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Screenshot Styles</h1>
            <p className="text-sm text-muted-foreground">
              Browse community looks or spin up your own with AI-powered style generation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
          >
            <Wand2 className="h-4 w-4" />
            Generate Style
          </button>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search styles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        {searchQuery && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Filtering by</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
              {searchQuery}
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary transition hover:bg-primary/30"
                aria-label="Clear style filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </motion.div>

      {/* Sign in prompt */}
      {!isSignedIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8 bg-card/50 rounded-xl mt-8"
        >
          <p className="text-muted-foreground">Sign in to generate custom styles</p>
        </motion.div>
      )}

      {/* Styles Grid */}
      {filteredStyles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No styles found' : 'No styles yet'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Generate your first custom style to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Generate Your First Style
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Create New Style Ghost Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative"
          >
            <button
              onClick={() => setShowCreateDialog(true)}
              className="w-full h-full rounded-xl border-2 border-dashed border-primary/30 bg-card hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 overflow-hidden cursor-pointer"
            >
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Create New Style</h3>
                  <p className="text-xs text-muted-foreground mt-1">Generate with AI</p>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Existing Styles */}
          {filteredStyles.map((style, index) => (
            <motion.div
              key={style._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative"
            >
              <Link href={`/styles/${style._id}`} className="block">
                <div className="rounded-xl border bg-card hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden cursor-pointer">
                  {/* Style Preview Area */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                    {style.previewImageUrl ? (
                      <Image
                        src={style.previewImageUrl}
                        alt={style.name}
                        fill
                        className="object-cover object-center scale-[1.15]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <>
                        {/* Decorative elements */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute top-4 left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                          <div className="absolute bottom-4 right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                        </div>

                        {/* Style Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-primary/60" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Style Info */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 truncate">{style.name}</h3>
                    {style.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {style.description}
                      </p>
                    )}

                    {/* Style Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{style.usageCount || 0} uses</span>
                      </div>
                      {style.isFeatured && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {style.tags && style.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {style.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-muted rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Generate Style Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowCreateDialog(false);
                setStyleDescription('');
                setReferenceImage(null);
                setReferenceImagePreview(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-card rounded-xl border shadow-xl w-full max-w-md md:max-w-2xl mx-4"
            >
              {/* Dialog Header */}
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generate Custom Style</h2>
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setStyleDescription('');
                    setReferenceImage(null);
                    setReferenceImagePreview(null);
                  }}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="p-6">
                <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-6">
                  <div className="space-y-4">
                    {/* Style Description */}
                    <div>
                      <label htmlFor="style-description" className="text-sm font-medium mb-1.5 block">
                        Describe your style
                      </label>
                      <textarea
                        id="style-description"
                        value={styleDescription}
                        onChange={(e) => setStyleDescription(e.target.value)}
                        placeholder="e.g., Cyberpunk neon with dark purple gradient, futuristic typography..."
                        className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px] resize-none"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Describe colors, mood, theme, and visual style
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Reference Image Upload */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Reference image <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          id="reference-image"
                          accept="image/*"
                          onChange={handleReferenceImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="reference-image"
                          className={`flex min-h-[216px] items-center justify-center gap-2 w-full px-3 ${referenceImagePreview ? 'py-4' : 'py-8'} rounded-lg border-2 border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors`}
                        >
                          {referenceImagePreview ? (
                            <div className="relative">
                              <Image
                                src={referenceImagePreview}
                                alt="Reference preview"
                                width={256}
                                height={256}
                                unoptimized
                                className="max-h-48 w-auto rounded-lg object-contain"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setReferenceImage(null);
                                  setReferenceImagePreview(null);
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-background border rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Paste or upload inspiration image
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="border-t px-6 py-4 flex gap-2">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setStyleDescription('');
                    setReferenceImage(null);
                    setReferenceImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateStyle}
                  disabled={!styleDescription.trim() || generating}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {generating && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-200, 200] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate Style'}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StylesPageFallback() {
  return (
    <div className="flex-1 p-8">
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}
