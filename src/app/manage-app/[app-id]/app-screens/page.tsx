'use client';

import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import {
  Upload,
  Download,
  Trash2,
  Edit3,
  Eye,
  MoreVertical,
  Check,
  Image as ImageIcon,
  Search,
  Grid3x3,
  List,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/layout/PageHeader';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}


const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30
    }
  }
};

export default function SourceImagesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'] as Id<"apps">;
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  // Convex hooks
  const app = useQuery(api.features.apps.queries.getApp, { appId });
  const appScreensQuery = useQuery(api.appScreens.getAppScreens, { appId });
  const uploadAppScreen = useMutation(api.appScreens.uploadAppScreen);
  const deleteAppScreen = useMutation(api.appScreens.deleteAppScreen);
  const updateAppScreenName = useMutation(api.appScreens.updateAppScreenName);
  const storeFromBase64 = useAction(api.fileStorage.base64Files.storeBase64File);

  // Local UI state
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [uploadingItems, setUploadingItems] = useState<Array<{id: string, preview: string}>>([]);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Track when we've received the first non-undefined response
  useEffect(() => {
    if (appScreensQuery !== undefined) {
      setHasInitiallyLoaded(true);
    }
  }, [appScreensQuery]);

  // Convex returns undefined while loading, then the actual data
  const isLoading = appScreensQuery === undefined || !hasInitiallyLoaded;

  const appScreens = useMemo(() => appScreensQuery ?? [], [appScreensQuery]);

  const toggleImageSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async () => {
    if (editingId && editingName.trim()) {
      await updateAppScreenName({
        screenId: editingId as Id<"appScreens">,
        name: editingName.trim(),
      });
      cancelEditing();
    }
  };


  const filteredImages = useMemo(() => {
    return appScreens.filter((img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [appScreens, searchQuery]);

  const sortedImages = useMemo(() => {
    const sorted = [...filteredImages].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.createdAt - a.createdAt;
    });
    return sorted;
  }, [filteredImages, sortBy]);

  const openPreview = useCallback(
    (imageId: Id<'appScreens'>) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedSearch = searchQuery.trim();

      if (trimmedSearch) {
        params.set('search', trimmedSearch);
      } else {
        params.delete('search');
      }

      params.set('sort', sortBy);

      const queryString = params.toString();
      const basePath = `/manage-app/${appId}/app-screens/preview/${imageId}`;
      const url = queryString ? `${basePath}?${queryString}` : basePath;
      router.push(url, { scroll: false });
    },
    [appId, router, searchParams, searchQuery, sortBy],
  );

  const handleDownloadAll = useCallback(async () => {
    if (isDownloadingAll || sortedImages.length === 0) {
      return;
    }

    setIsDownloadingAll(true);

    const contentTypeToExtension: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    try {
      for (const image of sortedImages) {
        if (!image.screenUrl) {
          continue;
        }

        try {
          const response = await fetch(image.screenUrl);
          if (!response.ok) {
            console.error('Failed to download image', image._id, response.statusText);
            continue;
          }

          const blob = await response.blob();
          const rawContentType = response.headers.get('content-type');
          const contentType = rawContentType?.split(';')[0].trim() ?? '';
          const inferredExtension =
            contentTypeToExtension[contentType] || blob.type.split('/')[1] || '';

          const originalName = image.name?.trim() || `app-screen-${image._id}`;
          const safeBaseName = originalName.replace(/[\\/:*?"<>|]/g, '_');
          const hasExtension = safeBaseName.includes('.');
          const filename = hasExtension || !inferredExtension
            ? safeBaseName
            : `${safeBaseName}.${inferredExtension}`;

          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);

          // Small delay so the browser can process sequential downloads
          // without flagging as a spammy multi-download.
          await delay(150);
        } catch (error) {
          console.error('Failed to download app screen', image._id, error);
        }
      }
    } finally {
      setIsDownloadingAll(false);
    }
  }, [isDownloadingAll, sortedImages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);

    // Create preview items immediately
    const previewItems: Array<{id: string, preview: string}> = [];

    // First, create all previews
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      const preview = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      previewItems.push({ id: `uploading-${Date.now()}-${Math.random()}`, preview });
    }

    // Show all uploading placeholders at once
    setUploadingItems(prev => [...prev, ...previewItems]);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;

        // Get image dimensions
        const img = new Image();
        const dimensionsPromise = new Promise<{ width: number; height: number }>((resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = base64;
        });
        const dimensions = await dimensionsPromise;

        // Upload to Convex storage
        const storageId = await storeFromBase64({
          base64Data: base64,
          contentType: file.type || 'image/png',
        });

        // Create app screen record
        await uploadAppScreen({
          appId,
          name: file.name,
          storageId,
          dimensions,
          size: file.size,
        });

        // Remove this item from uploading list
        setUploadingItems(prev => prev.filter(item => item.id !== previewItems[i].id));
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      // Clear all uploading items on error
      setUploadingItems([]);
    } finally {
      setIsUploading(false);
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle paste event for images
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          // Give the pasted image a name with timestamp
          const timestamp = new Date().getTime();
          const extension = file.type.split('/')[1] || 'png';
          const newFile = new File([file], `pasted-image-${timestamp}.${extension}`, { type: file.type });
          imageItems.push(newFile);
        }
      }
    }

    if (imageItems.length > 0) {
      setIsUploading(true);

      // Create preview items immediately
      const previewItems: Array<{id: string, preview: string}> = [];

      // First, create all previews
      for (const file of imageItems) {
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        previewItems.push({ id: `uploading-${Date.now()}-${Math.random()}`, preview });
      }

      // Show all uploading placeholders at once
      setUploadingItems(previewItems);

      try {
        await Promise.all(
          imageItems.map(async (file, index) => {
            const reader = new FileReader();
            return new Promise<void>((resolve, reject) => {
              reader.onloadend = async () => {
                try {
                  const base64 = reader.result as string;
                  const base64Data = base64.split(',')[1];

                  // Get image dimensions
                  const img = new Image();
                  await new Promise<void>((imgResolve) => {
                    img.onload = () => imgResolve();
                    img.src = base64;
                  });

                  // Store the file in Convex storage
                  const storageId = await storeFromBase64({
                    base64Data,
                    contentType: file.type,
                  });

                  // Save screen metadata
                  await uploadAppScreen({
                    appId,
                    name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                    storageId,
                    dimensions: {
                      width: img.width,
                      height: img.height,
                    },
                    size: file.size,
                  });

                  // Remove this item from uploading list
                  setUploadingItems(prev => prev.filter(item => item.id !== previewItems[index].id));

                  resolve();
                } catch (error) {
                  console.error('Upload failed:', error);
                  reject(error);
                }
              };
              reader.readAsDataURL(file);
            });
          })
        );
      } catch (error) {
        console.error('Failed to upload pasted images:', error);
        // Clear all uploading items on error
        setUploadingItems([]);
      } finally {
        setIsUploading(false);
      }
    }
  }, [appId, uploadAppScreen, storeFromBase64]);

  // Add paste event listener
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener('paste', handlePasteEvent);
    return () => document.removeEventListener('paste', handlePasteEvent);
  }, [appId, uploadAppScreen, storeFromBase64, handlePaste]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PageHeader
            className="px-6"
            backHref={returnTo || `/manage-app/${appId}`}
            backLabel="Back to app"
            icon={
              app ? (
                app.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.iconUrl} alt={`${app.name} icon`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {app.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                )
              ) : null
            }
            title="Manage App Screens"
            subtitle={
              app ? (
                <span>
                  {app.name} • {sortedImages.length} images • {selectedImages.size} selected
                </span>
              ) : (
                <span>
                  {sortedImages.length} images • {selectedImages.size} selected
                </span>
              )
            }
            actions={(
              <>
                <div className="relative flex-1 min-w-[220px] max-w-xl text-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full pl-9 pr-3 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex h-10 items-center border rounded-lg px-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                      viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                  className="h-10 px-3 border rounded-lg bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                >
                  <option value="date">Latest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={sortedImages.length === 0 || isDownloadingAll}
                  className="h-10 px-4 border rounded-lg bg-background text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none hover:bg-muted/50"
                >
                  <Download className="w-4 h-4" />
                  {isDownloadingAll ? 'Preparing…' : 'Download All'}
                </button>
                <label className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload Images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </>
            )}
            actionsClassName="flex-1 items-center gap-2 sm:gap-3"
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            // Loading State - Skeleton UI
            <div className={viewMode === 'grid'
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
              : "space-y-2"
            }>
              {/* Show 6 skeleton items */}
              {[...Array(6)].map((_, index) => (
                viewMode === 'grid' ? (
                  // Grid skeleton
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[9/16] bg-muted/50 rounded-xl border" />
                  </div>
                ) : (
                  // List skeleton
                  <div key={index} className="animate-pulse flex items-center gap-4 p-3 bg-card border rounded-lg">
                    <div className="w-10 h-16 bg-muted/50 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted/50 rounded w-3/4" />
                      <div className="h-3 bg-muted/50 rounded w-1/2" />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-muted/50 rounded-md" />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : appScreens.length === 0 ? (
            // Zero State - No images uploaded
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[500px] text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <ImageIcon className="w-12 h-12 text-primary" />
              </div>

              <h2 className="text-2xl font-bold mb-3">Upload Screenshots from Your App</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                We&apos;ll use these screenshots to generate stunning App Store Screenshots with AI.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Drag and drop multiple files</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Organize and manage screenshots</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Transform with AI vibes</span>
                </div>
              </div>

              <label className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-5 h-5" />
                Upload Screenshots
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-muted-foreground mt-4">
                Supports PNG, JPG, JPEG, and WebP formats
              </p>
            </motion.div>
          ) : sortedImages.length === 0 ? (
            // No results from filter/search
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                Clear search
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key={`grid-${sortedImages.length}`}
              variants={containerAnimation}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
            >
              {/* Add App Screen Card - always first */}
              <motion.div
                variants={itemAnimation}
                className="group"
              >
                <label className="bg-card border rounded-xl p-3 hover:shadow-lg transition-all duration-200 flex flex-col h-full cursor-pointer">
                  {/* Image Container matching aspect ratio with integrated upload UI */}
                  <div className="relative flex-1 bg-muted/20 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-center">Add Screen</p>
                      <p className="text-xs text-muted-foreground mt-1">Click, drag or paste</p>
                    </div>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </motion.div>

              {/* Uploading placeholders - appear after Add Screen card */}
              {uploadingItems.map(item => (
                <motion.div
                  key={item.id}
                  variants={itemAnimation}
                  className="group"
                >
                  <div className="bg-card border rounded-xl p-3 shadow-sm flex flex-col h-full relative overflow-hidden">
                    {/* Header Section - Skeleton for name at top (matching real card structure) */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {/* Checkbox skeleton */}
                          <div className="w-5 h-5 rounded border-2 border-muted-foreground/20 flex-shrink-0 mt-0.5"></div>
                          {/* Name skeleton */}
                          <div className="h-4 bg-muted/50 rounded animate-pulse flex-1"></div>
                        </div>
                        {/* Menu button skeleton */}
                        <div className="w-6 h-6 bg-muted/30 rounded animate-pulse flex-shrink-0"></div>
                      </div>
                      {/* Metadata skeleton */}
                      <div className="h-3 bg-muted/30 rounded w-2/3 animate-pulse ml-7"></div>
                    </div>

                    {/* Image Container with loading animation - matching aspect ratio */}
                    <div className="relative flex-1 aspect-[9/16] bg-muted/20 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <NextImage
                          src={item.preview}
                          alt="Uploading..."
                          fill
                          className="object-cover opacity-50"
                        />
                      </div>
                      {/* Loading overlay */}
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-xs font-medium">Uploading...</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {sortedImages.map((image) => (
                <motion.div
                  key={image._id}
                  variants={itemAnimation}
                  className="group"
                >
                  <div className={`bg-card border rounded-xl p-3 hover:shadow-lg transition-all duration-200 flex flex-col ${
                    selectedImages.has(image._id)
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}>
                    {/* Card Header with Name and Actions */}
                    <div className="mb-3">
                      {/* Title and checkbox row */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleImageSelection(image._id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                              selectedImages.has(image._id)
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border hover:border-muted-foreground'
                            }`}
                          >
                            {selectedImages.has(image._id) && (
                              <Check className="w-3 h-3" />
                            )}
                          </button>

                          {/* Name */}
                          {editingId === image._id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                saveEdit();
                              }}
                              className="flex-1 min-w-0"
                            >
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={cancelEditing}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                                className="w-full px-1 py-0.5 text-sm font-medium bg-transparent border-b border-primary focus:outline-none"
                                autoFocus
                              />
                            </form>
                          ) : (
                            <div className="flex items-center gap-1 flex-1 min-w-0 group/edit">
                              <p
                                className="font-medium truncate text-sm flex-1 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => startEditing(image._id, image.name)}
                                title={image.name}
                              >
                                {image.name}
                              </p>
                              <button
                                onClick={() => startEditing(image._id, image.name)}
                                className="p-0.5 opacity-0 group-hover/edit:opacity-60 hover:!opacity-100 transition-opacity flex-shrink-0"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-md hover:bg-muted/50 transition-colors flex-shrink-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => openPreview(image._id as Id<'appScreens'>)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => deleteAppScreen({ screenId: image._id as Id<"appScreens"> })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Metadata */}
                      <p className="text-xs text-muted-foreground pl-7">
                        {image.dimensions.width} × {image.dimensions.height} • {formatFileSize(image.size)}
                      </p>
                    </div>

                    {/* Image Container */}
                    <div
                      className="relative flex-1 aspect-[9/16] bg-muted/20 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => openPreview(image._id as Id<'appScreens'>)}
                    >
                      {/* Image Preview */}
                      {image.screenUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.screenUrl}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Ghost cells to fill remaining space */}
              {(() => {
                const totalItems = sortedImages.length + uploadingItems.length + 1; // +1 for the Add card
                const columns = 6; // Maximum columns for 2xl screens
                const remainder = totalItems % columns;
                const ghostCount = remainder === 0 ? 0 : columns - remainder;
                return Array(ghostCount).fill(0).map((_, index) => (
                  <motion.div
                    key={`ghost-${index}`}
                    variants={itemAnimation}
                    className="bg-card/30 border border-dashed border-muted-foreground/10 rounded-xl p-3"
                  >
                    <div className="aspect-[9/16] bg-muted/10 rounded-lg" />
                  </motion.div>
                ));
              })()}
            </motion.div>
          ) : (
            // List View
            <div key={`list-${sortedImages.length}`} className="space-y-2">
              {sortedImages.map((image) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <button
                    onClick={() => toggleImageSelection(image._id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedImages.has(image._id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {selectedImages.has(image._id) && (
                      <Check className="w-3 h-3" />
                    )}
                  </button>

                  {image.screenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.screenUrl}
                      alt={image.name}
                      className="w-10 h-16 rounded-md object-cover flex-shrink-0 cursor-pointer"
                      onClick={() => openPreview(image._id as Id<'appScreens'>)}
                    />
                  ) : (
                    <div
                      className="w-10 h-16 rounded-md bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0 cursor-pointer"
                      onClick={() => openPreview(image._id as Id<'appScreens'>)}
                    >
                      <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {editingId === image._id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveEdit();
                        }}
                        className="flex items-center gap-1"
                      >
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="flex-1 px-1 py-0.5 font-medium bg-transparent border-b border-primary focus:outline-none"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {image.name}
                        </p>
                        <button
                          onClick={() => startEditing(image._id, image.name)}
                          className="p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{image.dimensions.width} × {image.dimensions.height}</span>
                      <span>•</span>
                      <span>{formatFileSize(image.size)}</span>
                      <span>•</span>
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openPreview(image._id as Id<'appScreens'>)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() => deleteAppScreen({ screenId: image._id as Id<"appScreens"> })}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
