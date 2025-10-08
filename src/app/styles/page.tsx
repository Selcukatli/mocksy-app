'use client';

import {
  Sparkles,
  Search,
  X,
  TrendingUp,
  Wand2,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreateStyleDialog } from './components/CreateStyleDialog';
import { PageHeader } from '@/components/layout/PageHeader';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('tag') ?? '');

  // Advanced style control states
  const [backgroundStyle, setBackgroundStyle] = useState('');
  const [textStyleInput, setTextStyleInput] = useState('');
  const [deviceStyleInput, setDeviceStyleInput] = useState('');
  const [decorativeElements, setDecorativeElements] = useState('');
  const [backgroundFieldActive, setBackgroundFieldActive] = useState(false);
  const [textFieldActive, setTextFieldActive] = useState(false);
  const [deviceFieldActive, setDeviceFieldActive] = useState(false);
  const [decorativeFieldActive, setDecorativeFieldActive] = useState(false);

  // Fetch styles
  const publicStyles = useQuery(api.styles.getPublicStyles);
  const generateStyleFromDescription = useAction(api.styleActions.generateStyleFromDescription);
  const generateUploadUrl = useMutation(api.fileStorage.files.generateUploadUrl);
  const activeJobs = useQuery(api.jobs.getActiveJobs) || [];

  // Apply search filter
  const filteredStyles = useMemo(
    () => {
      const list = publicStyles ?? [];
      return list.filter((style) =>
        style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        style.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
    [publicStyles, searchQuery]
  );

  const styleJob = generating
    ? activeJobs.find((job) => job.type === 'style')
    : undefined;

  const hasReferenceImage = Boolean(referenceImage);

  const handleCloseCreateDialog = useCallback(() => {
    setShowCreateDialog(false);
    setStyleDescription('');
    setReferenceImage(null);
    setReferenceImagePreview(null);
    setBackgroundStyle('');
    setTextStyleInput('');
    setDeviceStyleInput('');
    setDecorativeElements('');
    setBackgroundFieldActive(false);
    setTextFieldActive(false);
    setDeviceFieldActive(false);
    setDecorativeFieldActive(false);
  }, []);

  const handleRemoveReferenceImage = useCallback(() => {
    setReferenceImage(null);
    setReferenceImagePreview(null);
  }, [setReferenceImage, setReferenceImagePreview]);

  const handleBackgroundFieldToggle = useCallback((active: boolean) => {
    setBackgroundFieldActive(active);
    if (!active) {
      setBackgroundStyle('');
    }
  }, []);

  const handleTextFieldToggle = useCallback((active: boolean) => {
    setTextFieldActive(active);
    if (!active) {
      setTextStyleInput('');
    }
  }, []);

  const handleDeviceFieldToggle = useCallback((active: boolean) => {
    setDeviceFieldActive(active);
    if (!active) {
      setDeviceStyleInput('');
    }
  }, []);

  const handleDecorativeFieldToggle = useCallback((active: boolean) => {
    setDecorativeFieldActive(active);
    if (!active) {
      setDecorativeElements('');
    }
  }, []);

  const handleBackgroundStyleChange = useCallback(
    (value: string) => {
      setBackgroundStyle(value);
      if (!backgroundFieldActive && value.trim()) {
        setBackgroundFieldActive(true);
      }
    },
    [backgroundFieldActive]
  );

  const handleTextStyleChange = useCallback(
    (value: string) => {
      setTextStyleInput(value);
      if (!textFieldActive && value.trim()) {
        setTextFieldActive(true);
      }
    },
    [textFieldActive]
  );

  const handleDeviceStyleChange = useCallback(
    (value: string) => {
      setDeviceStyleInput(value);
      if (!deviceFieldActive && value.trim()) {
        setDeviceFieldActive(true);
      }
    },
    [deviceFieldActive]
  );

  const handleDecorativeElementsChange = useCallback(
    (value: string) => {
      setDecorativeElements(value);
      if (!decorativeFieldActive && value.trim()) {
        setDecorativeFieldActive(true);
      }
    },
    [decorativeFieldActive]
  );

  type StyleItem = (typeof filteredStyles)[number];

  const CreateStyleCard = ({ onClick }: { onClick: () => void }) => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative h-full"
    >
      <button
        onClick={onClick}
        className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-sm">Create New Style</h3>
          <p className="text-xs text-muted-foreground">Generate with AI</p>
        </div>
      </button>
    </motion.div>
  );

  const StyleGridCard = ({ style, index = 0 }: { style: StyleItem; index?: number }) => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative h-full"
    >
      <Link href={`/styles/${style._id}`} className="block h-full">
        <div className="flex h-full flex-col rounded-xl border bg-card hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden cursor-pointer">
          <StylePreview style={style} />
          <StyleInfo style={style} />
        </div>
      </Link>
    </motion.div>
  );

  const CreateStyleRow = ({ onClick }: { onClick: () => void }) => (
    <motion.button
      type="button"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-xl border-2 border-dashed border-primary/30 bg-card px-4 py-3 text-left hover:bg-primary/5 hover:border-primary/50 transition"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Create New Style</h3>
          <p className="text-xs text-muted-foreground">Generate with AI</p>
        </div>
      </div>
      <Wand2 className="h-4 w-4 text-primary" />
    </motion.button>
  );

  const StyleListRow = ({ style, index = 0 }: { style: StyleItem; index?: number }) => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="rounded-xl border bg-card hover:shadow-md transition"
    >
      <Link href={`/styles/${style._id}`} className="flex items-stretch gap-4 p-4">
        <StylePreview style={style} variant="list" />
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold">{style.name}</h3>
            {style.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {style.description}
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {style.usageCount ?? 0} uses
            </span>
            {style.category && <span className="capitalize">{style.category}</span>}
            {style.tags && style.tags.length > 0 && (
              <span className="inline-flex flex-wrap gap-1">
                {style.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  const StylePreview = ({
    style,
    variant = 'grid',
  }: {
    style: StyleItem;
    variant?: 'grid' | 'list';
  }) => {
    const wrapperClasses =
      variant === 'grid'
        ? 'relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5'
        : 'relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5';

    const imageClasses =
      variant === 'grid'
        ? 'object-cover object-center scale-[1.15]'
        : 'object-cover object-center';

    return (
      <div className={wrapperClasses}>
        {style.previewImageUrl ? (
          <Image
            src={style.previewImageUrl}
            alt={style.name}
            fill
            className={imageClasses}
            sizes={variant === 'grid' ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw' : '112px'}
          />
        ) : (
          <>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-4 h-12 w-12 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-primary/10 blur-xl" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary/60" />
            </div>
          </>
        )}
      </div>
    );
  };

  const StyleInfo = ({ style }: { style: StyleItem }) => (
    <div className="flex flex-1 flex-col p-4">
      <div>
        <h3 className="font-semibold mb-1 truncate">{style.name}</h3>
        {style.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {style.description}
          </p>
        )}
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
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

        {style.tags && style.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {style.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const handleGenerateStyle = async () => {
    if (!styleDescription.trim() && !referenceImage) return;

    setGenerating(true);
    try {
      const descriptionForGeneration = styleDescription.trim()
        ? styleDescription.trim()
        : 'Generate a polished mobile app screenshot style inspired by the uploaded reference image.';

      let referenceImageStorageId: Id<'_storage'> | undefined;

      if (referenceImage) {
        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': referenceImage.type || 'application/octet-stream' },
          body: referenceImage,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload reference image: ${uploadResponse.statusText}`);
        }

        const uploadJson = await uploadResponse.json();
        referenceImageStorageId = uploadJson.storageId as Id<'_storage'>;
      }

      await generateStyleFromDescription({
        description: descriptionForGeneration,
        referenceImageStorageId,
        // Add optional fields if provided
        backgroundStyle: backgroundStyle.trim() || undefined,
        textStyle: textStyleInput.trim() || undefined,
        deviceStyle: deviceStyleInput.trim() || undefined,
        decorativeElements: decorativeElements.trim() || undefined,
      });

      handleCloseCreateDialog();
    } catch (error) {
      console.error('Failed to generate style:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSetReferenceImage = useCallback(
    (file: File) => {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [setReferenceImage, setReferenceImagePreview]
  );

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

  useEffect(() => {
    if (!showCreateDialog) {
      return;
    }

    if (backgroundStyle.trim() && !backgroundFieldActive) {
      setBackgroundFieldActive(true);
    }

    if (textStyleInput.trim() && !textFieldActive) {
      setTextFieldActive(true);
    }

    if (deviceStyleInput.trim() && !deviceFieldActive) {
      setDeviceFieldActive(true);
    }

    if (decorativeElements.trim() && !decorativeFieldActive) {
      setDecorativeFieldActive(true);
    }
  }, [
    showCreateDialog,
    backgroundStyle,
    textStyleInput,
    deviceStyleInput,
    decorativeElements,
    backgroundFieldActive,
    textFieldActive,
    deviceFieldActive,
    decorativeFieldActive,
  ]);

  return (
    <div className="flex-1 p-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6"
      >
        <PageHeader
          className="border-b border-border/60 pb-4 pt-0"
          backHref="/home"
          backLabel="Back to home"
          title="Screenshot Styles"
          subtitle={
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {filteredStyles.length} styles available
            </span>
          }
          subtitleClassName="mt-1 text-sm text-muted-foreground"
          actions={(
            <>
              <div className="relative flex-1 min-w-[260px] max-w-md text-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search styles..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-full border border-border/70 bg-muted/90 pl-12 pr-12 py-2.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 transition ${
                    viewMode === 'grid' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 transition ${
                    viewMode === 'list' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <List className="h-3.5 w-3.5" /> List
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
              >
                <Wand2 className="h-4 w-4" />
                Generate Style
              </button>
            </>
          )}
          actionsClassName="flex flex-wrap items-center gap-3 sm:gap-4"
        />
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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CreateStyleCard onClick={() => setShowCreateDialog(true)} />
          {filteredStyles.map((style, index) => (
            <StyleGridCard key={style._id} style={style} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <CreateStyleRow onClick={() => setShowCreateDialog(true)} />
          {filteredStyles.map((style, index) => (
            <StyleListRow key={style._id} style={style} index={index} />
          ))}
        </div>
      )}

      <CreateStyleDialog
        open={showCreateDialog}
        styleDescription={styleDescription}
        onStyleDescriptionChange={(value) => setStyleDescription(value)}
        hasReferenceImage={hasReferenceImage}
        referenceImagePreview={referenceImagePreview}
        onReferenceImageChange={handleReferenceImageChange}
        onRemoveReferenceImage={handleRemoveReferenceImage}
        generating={generating}
        onSubmit={handleGenerateStyle}
        onClose={handleCloseCreateDialog}
        backgroundStyle={backgroundStyle}
        onBackgroundStyleChange={handleBackgroundStyleChange}
        backgroundFieldActive={backgroundFieldActive}
        onBackgroundFieldToggle={handleBackgroundFieldToggle}
        textStyle={textStyleInput}
        onTextStyleChange={handleTextStyleChange}
        textFieldActive={textFieldActive}
        onTextFieldToggle={handleTextFieldToggle}
        deviceStyle={deviceStyleInput}
        onDeviceStyleChange={handleDeviceStyleChange}
        deviceFieldActive={deviceFieldActive}
        onDeviceFieldToggle={handleDeviceFieldToggle}
        decorativeElements={decorativeElements}
        onDecorativeElementsChange={handleDecorativeElementsChange}
        decorativeFieldActive={decorativeFieldActive}
        onDecorativeFieldToggle={handleDecorativeFieldToggle}
        styleJob={styleJob}
      />
    </div>
  );
}

function StylesPageFallback() {
  const placeholderCards = Array.from({ length: 8 });

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="h-9 w-56 rounded-lg bg-muted/80 animate-pulse" />
          <div className="h-4 w-80 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-muted/50 animate-pulse" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-8 w-32 rounded-full bg-muted/40 animate-pulse" />
          <div className="h-9 w-40 rounded-full bg-muted/50 animate-pulse" />
        </div>
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-2xl">
          <div className="h-10 w-full rounded-lg bg-muted/50 animate-pulse" />
          <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-muted-foreground/30" />
          <div className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-muted-foreground/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {placeholderCards.map((_, index) => {
          if (index === 0) {
            return (
              <div key="create" className="group relative h-full">
                <div className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card/80 p-6">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-muted/40 animate-pulse" />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-muted-foreground/30"
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="h-4 w-28 rounded bg-muted/60 animate-pulse" />
                    <div className="h-3 w-36 rounded bg-muted/40 animate-pulse" />
                  </div>
                  <div className="h-8 w-32 rounded-full bg-muted/30 animate-pulse" />
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="relative h-full">
              <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
                <div className="relative aspect-[4/3] bg-muted/30">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/60 to-transparent"
                    animate={{ x: ['-50%', '110%'] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted/70 animate-pulse" />
                    <div className="h-3 w-full rounded bg-muted/50 animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-muted/50 animate-pulse" />
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 rounded bg-muted/50 animate-pulse" />
                      <div className="h-3 w-14 rounded bg-muted/40 animate-pulse" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 3 }).map((__, tagIndex) => (
                        <div
                          key={tagIndex}
                          className="h-5 w-16 rounded-full bg-muted/40 animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
