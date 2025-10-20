'use client';

import { Id } from '@convex/_generated/dataModel';
import { Star, StarOff, Eye, Trash2, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, CloudUpload, ExternalLink, Play, Plus } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAction, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import ImageLightbox from '@/components/ImageLightbox';
import GenerateVideoModal from '@/components/GenerateVideoModal';
import Toast from '@/components/Toast';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';

// Helper function to format compact time ago
const formatCompactTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

interface App {
  _id: Id<'apps'>;
  name: string;
  description?: string;
  category?: string;
  iconUrl?: string;
  coverImageUrl?: string;
  coverVideoUrl?: string;
  status?: 'draft' | 'published';
  isDemo?: boolean;
  isFeatured: boolean;
  featuredAt?: number;
  createdAt: number;
  prodAppId?: string;
  lastPublishedToProdAt?: number;
}

type SortField = 'name' | 'status' | 'featured' | 'created';
type SortDirection = 'asc' | 'desc';

interface AppsTableProps {
  apps: App[];
  onFeature: (appId: Id<'apps'>) => Promise<void>;
  onUnfeature: (appId: Id<'apps'>) => Promise<void>;
  onDelete: (appId: Id<'apps'>) => Promise<void>;
  onView: (appId: Id<'apps'>) => void;
  onStatusChange: (appId: Id<'apps'>, status: 'draft' | 'published') => Promise<void>;
  onPublishToProd?: (appId: Id<'apps'>) => Promise<void>; // Optional - only on dev
}

function AppsTable({
  apps,
  onFeature,
  onUnfeature,
  onDelete,
  onView,
  onStatusChange,
  onPublishToProd,
}: AppsTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<'apps'> | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<Id<'apps'> | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ 
    url: string; 
    alt: string; 
    type: 'image' | 'video';
    imageUrl?: string;
    videoUrl?: string;
    appId?: Id<'apps'>;
  } | null>(null);
  const [statusPopoverId, setStatusPopoverId] = useState<Id<'apps'> | null>(null);
  const [featuredPopoverId, setFeaturedPopoverId] = useState<Id<'apps'> | null>(null);
  const [sortField, setSortField] = useState<SortField>('featured');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [generatingVideoAppId, setGeneratingVideoAppId] = useState<Id<'apps'> | null>(null);
  const [generatingImageAppId, setGeneratingImageAppId] = useState<Id<'apps'> | null>(null);
  const [generateCoverDialogOpen, setGenerateCoverDialogOpen] = useState<Id<'apps'> | null>(null);
  const [removeVideoDialogOpen, setRemoveVideoDialogOpen] = useState<Id<'apps'> | null>(null);
  const [videoModalAppId, setVideoModalAppId] = useState<Id<'apps'> | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const generateCoverVideo = useAction(api.features.appGeneration.generateAppCoverVideo);
  const generateCoverImage = useAction(api.features.appGeneration.generateAndSaveCoverImage);
  const removeCoverVideo = useMutation(api.features.apps.queries.removeCoverVideo);

  // Update lightbox when video generation completes
  useEffect(() => {
    if (lightboxMedia && lightboxMedia.appId && generatingVideoAppId === null) {
      // Find the app with updated video URL
      const updatedApp = apps.find(app => app._id === lightboxMedia.appId);
      if (updatedApp && updatedApp.coverVideoUrl && !lightboxMedia.videoUrl) {
        // Video generation completed! Update lightbox with new video
        setLightboxMedia({
          ...lightboxMedia,
          videoUrl: updatedApp.coverVideoUrl,
          url: updatedApp.coverVideoUrl,
          type: 'video',
        });
      }
    }
  }, [apps, lightboxMedia, generatingVideoAppId]);

  const handleFeatureToggle = async (app: App) => {
    setActionLoadingId(app._id);
    try {
      if (app.isFeatured) {
        await onUnfeature(app._id);
      } else {
        await onFeature(app._id);
      }
      setFeaturedPopoverId(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (appId: Id<'apps'>) => {
    setActionLoadingId(appId);
    try {
      await onDelete(appId);
      setDeleteConfirmId(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (appId: Id<'apps'>, status: 'draft' | 'published') => {
    setActionLoadingId(appId);
    try {
      await onStatusChange(appId, status);
      setStatusPopoverId(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleGenerateVideo = async (appId: Id<'apps'>, customPrompt?: string) => {
    setGeneratingVideoAppId(appId);
    try {
      const result = await generateCoverVideo({ 
        appId,
        customPrompt,
      });
      if (result.success && result.jobId) {
        setToastMessage('Generating cover video...');
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage(result.error || 'Failed to start cover video generation');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error generating cover video:', error);
      setToastMessage('Failed to generate cover video');
      setToastType('error');
      setShowToast(true);
    } finally {
      setGeneratingVideoAppId(null);
    }
  };

  const handleGenerateImage = async (appId: Id<'apps'>) => {
    setGeneratingImageAppId(appId);
    try {
      const result = await generateCoverImage({ appId });
      if (result.success && result.jobId) {
        setToastMessage('Generating cover image...');
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage(result.error || 'Failed to start cover image generation');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error generating cover image:', error);
      setToastMessage('Failed to generate cover image');
      setToastType('error');
      setShowToast(true);
    } finally {
      setGeneratingImageAppId(null);
    }
  };

  const handleRemoveVideo = async (appId: Id<'apps'>) => {
    try {
      await removeCoverVideo({ appId });
      setToastMessage('Cover video removed');
      setToastType('success');
      setShowToast(true);
      // Update lightbox to remove video but keep it open
      if (lightboxMedia) {
        setLightboxMedia({
          ...lightboxMedia,
          videoUrl: undefined,
          url: lightboxMedia.imageUrl || '',
          type: 'image',
        });
      }
      // Close confirmation dialog
      setRemoveVideoDialogOpen(null);
    } catch (error) {
      console.error('Error removing cover video:', error);
      setToastMessage('Failed to remove cover video');
      setToastType('error');
      setShowToast(true);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Sort apps based on current sort settings
  const sortedApps = [...apps].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      
      case 'status': {
        const aStatus = a.status || 'published';
        const bStatus = b.status || 'published';
        comparison = aStatus.localeCompare(bStatus);
        break;
      }
      
      case 'featured':
        if (a.isFeatured && !b.isFeatured) comparison = -1;
        else if (!a.isFeatured && b.isFeatured) comparison = 1;
        else if (a.isFeatured && b.isFeatured) {
          comparison = (b.featuredAt || 0) - (a.featuredAt || 0);
        }
        break;
      
      case 'created':
        comparison = b.createdAt - a.createdAt;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5" />
    );
  };

  if (apps.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground">No apps found matching your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    App
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cover
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('featured')}
                    className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    Featured
                    <SortIcon field="featured" />
                  </button>
                </th>
                {onPublishToProd && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prod
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedApps.map((app) => (
                <tr key={app._id} className="hover:bg-muted/30 transition-colors">
                  {/* App Icon + Name */}
                  <td className="px-4 py-4">
                    <Link 
                      href={`/appstore/${app._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {app.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={app.iconUrl}
                            alt={app.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-sm font-bold text-primary">
                              {app.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{app.name}</p>
                        {app.isDemo && (
                          <span className="text-xs text-muted-foreground">Demo App</span>
                        )}
                      </div>
                    </Link>
                  </td>

                  {/* Cover Image/Video */}
                  <td className="px-4 py-4">
                    {app.coverVideoUrl || app.coverImageUrl ? (
                      <button
                        onClick={() =>
                          setLightboxMedia({
                            url: app.coverVideoUrl || app.coverImageUrl!,
                            alt: `${app.name} cover`,
                            type: app.coverVideoUrl ? 'video' : 'image',
                            imageUrl: app.coverImageUrl,
                            videoUrl: app.coverVideoUrl,
                            appId: app._id,
                          })
                        }
                        className="w-20 h-14 rounded-lg overflow-hidden bg-muted border transition-all hover:ring-2 hover:ring-primary hover:scale-105 cursor-pointer relative group"
                      >
                        {app.coverVideoUrl ? (
                          <>
                            <video
                              src={app.coverVideoUrl}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                            />
                            {/* Blur overlay */}
                            <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]" />
                            {/* Play icon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-white drop-shadow-lg" />
                            </div>
                          </>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={app.coverImageUrl!}
                            alt={`${app.name} cover`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Video generation overlay */}
                        {generatingVideoAppId === app._id && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-1 rounded-lg">
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-white"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-white"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-white"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        )}
                      </button>
                    ) : generatingImageAppId === app._id ? (
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted/30 border border-primary/50 relative">
                        {/* Animated colorful gradient blur */}
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            background: [
                              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(16, 185, 129, 0.3) 100%)',
                              'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.6) 0%, rgba(16, 185, 129, 0.4) 50%, rgba(139, 92, 246, 0.3) 100%)',
                              'radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.6) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(59, 130, 246, 0.3) 100%)',
                              'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(16, 185, 129, 0.3) 100%)',
                              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(16, 185, 129, 0.3) 100%)',
                            ],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          style={{ filter: 'blur(20px)' }}
                        />
                        {/* Animated dots on top */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1">
                          <motion.div
                            className="w-2 h-2 rounded-full bg-white/90"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 rounded-full bg-white/90"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 rounded-full bg-white/90"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Dialog
                        open={generateCoverDialogOpen === app._id}
                        onOpenChange={(open) => setGenerateCoverDialogOpen(open ? app._id : null)}
                      >
                        <DialogTrigger asChild>
                          <button
                            className="w-20 h-14 rounded-lg bg-muted/30 border border-dashed flex items-center justify-center hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
                          >
                            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Generate Cover Image</DialogTitle>
                            <DialogDescription>
                              AI will create a professional cover image for <span className="font-semibold text-foreground">{app.name}</span>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-4 pt-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <div className="text-sm text-muted-foreground">
                                AI will generate a professional cover image based on your app&apos;s description and style guide. Generation takes approximately 40 seconds.
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setGenerateCoverDialogOpen(null)}
                                className="px-4 py-2 rounded-md border hover:bg-muted transition-colors text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  handleGenerateImage(app._id);
                                  // Open lightbox in generation state
                                  setLightboxMedia({
                                    url: '',
                                    alt: `${app.name} cover`,
                                    type: 'image',
                                    imageUrl: undefined,
                                    videoUrl: undefined,
                                    appId: app._id,
                                  });
                                  setGenerateCoverDialogOpen(null);
                                }}
                                disabled={actionLoadingId === app._id}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Generate Cover
                              </button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      {app.category || '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <Popover
                      open={statusPopoverId === app._id}
                      onOpenChange={(open) => setStatusPopoverId(open ? app._id : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          disabled={actionLoadingId === app._id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 ${
                            app.status === 'published' || !app.status
                              ? 'bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20'
                          }`}
                        >
                          {app.status === 'published' || !app.status ? 'Published' : 'Draft'}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-40 p-1">
                        <div className="space-y-1">
                          <button
                            onClick={() => handleStatusChange(app._id, 'published')}
                            disabled={
                              actionLoadingId === app._id ||
                              app.status === 'published' ||
                              !app.status
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-green-500/10 text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-600" />
                            <span>Published</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(app._id, 'draft')}
                            disabled={
                              actionLoadingId === app._id || app.status === 'draft'
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-yellow-500/10 text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-2 h-2 rounded-full bg-yellow-600" />
                            <span>Draft</span>
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>

                  {/* Featured Status */}
                  <td className="px-4 py-4">
                    <Popover
                      open={featuredPopoverId === app._id}
                      onOpenChange={(open) => setFeaturedPopoverId(open ? app._id : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          disabled={actionLoadingId === app._id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 ${
                            app.isFeatured
                              ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20'
                              : 'bg-muted/50 text-muted-foreground border border-muted hover:bg-muted'
                          }`}
                        >
                          {app.isFeatured ? (
                            <>
                              <Star className="w-3 h-3 fill-yellow-600" />
                              Featured
                            </>
                          ) : (
                            <>
                              <Star className="w-3 h-3" />
                              Not Featured
                            </>
                          )}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-48 p-1">
                        <div className="space-y-1">
                          <button
                            onClick={() => handleFeatureToggle(app)}
                            disabled={actionLoadingId === app._id || app.isFeatured}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-yellow-500/10 text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Star className="w-3.5 h-3.5 fill-yellow-600" />
                            <span>Feature App</span>
                          </button>
                          <button
                            onClick={() => handleFeatureToggle(app)}
                            disabled={actionLoadingId === app._id || !app.isFeatured}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <StarOff className="w-3.5 h-3.5" />
                            <span>Remove Featured</span>
                          </button>
                        </div>
                        {app.isFeatured && app.featuredAt && (
                          <div className="px-3 py-2 mt-1 border-t text-xs text-muted-foreground">
                            Featured {formatDate(app.featuredAt)}
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </td>

                  {/* Prod Status (only on dev deployment) */}
                  {onPublishToProd && (
                    <td className="px-4 py-4">
                      {app.isDemo ? (
                        app.lastPublishedToProdAt ? (
                          // Already published - show status
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span className="font-medium">
                                Published {formatCompactTimeAgo(app.lastPublishedToProdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {app.prodAppId && (
                                <a
                                  href={`https://mocksy.app/appstore/${app.prodAppId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-primary hover:underline w-fit"
                                >
                                  <span>View in Prod</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                onClick={() => onPublishToProd(app._id)}
                                disabled={actionLoadingId === app._id}
                                className="p-1 rounded text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                                title="Re-publish to Production"
                              >
                                <CloudUpload className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Not published yet - show publish button
                          <button
                            onClick={() => onPublishToProd(app._id)}
                            disabled={actionLoadingId === app._id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-primary border border-primary/20 hover:bg-primary/10 transition-colors disabled:opacity-50"
                            title="Publish to Production"
                          >
                            <CloudUpload className="w-3.5 h-3.5" />
                            <span>Publish</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* View */}
                      <button
                        onClick={() => onView(app._id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                        title="View app"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirmId(app._id)}
                        disabled={actionLoadingId === app._id}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Delete app"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Delete App?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete &ldquo;
                {sortedApps.find((a) => a._id === deleteConfirmId)?.name}&rdquo;? This will
                remove the app and all of its data. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={actionLoadingId === deleteConfirmId}
                  className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={actionLoadingId === deleteConfirmId}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === deleteConfirmId ? 'Deleting...' : 'Delete App'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <ImageLightbox
        imageUrl={lightboxMedia?.url || ''}
        alt={lightboxMedia?.alt || ''}
        isOpen={!!lightboxMedia}
        onClose={() => setLightboxMedia(null)}
        type={lightboxMedia?.type}
        videoUrl={lightboxMedia?.videoUrl}
        coverImageUrl={lightboxMedia?.imageUrl}
        appId={lightboxMedia?.appId}
        onGenerateVideo={lightboxMedia?.appId ? () => setVideoModalAppId(lightboxMedia.appId!) : undefined}
        isGeneratingVideo={lightboxMedia?.appId === generatingVideoAppId}
        onGenerateImage={lightboxMedia?.appId ? () => handleGenerateImage(lightboxMedia.appId!) : undefined}
        isGeneratingImage={lightboxMedia?.appId === generatingImageAppId}
        onRemoveVideo={lightboxMedia?.appId ? () => setRemoveVideoDialogOpen(lightboxMedia.appId!) : undefined}
      />
      
      {/* Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isOpen={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Remove Video Confirmation Dialog */}
      <Dialog
        open={!!removeVideoDialogOpen}
        onOpenChange={(open) => !open && setRemoveVideoDialogOpen(null)}
      >
        <DialogPortal>
          <DialogOverlay className="z-[110]" />
          <div className="fixed top-[50%] left-[50%] z-[110] translate-x-[-50%] translate-y-[-50%] w-full max-w-[calc(100%-2rem)] sm:max-w-lg">
            <div className="bg-background relative grid w-full gap-4 rounded-lg border p-6 shadow-lg">
              <DialogHeader>
                <DialogTitle>Remove Cover Video</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove this cover video? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setRemoveVideoDialogOpen(null)}
                  className="px-4 py-2 rounded-md border hover:bg-muted transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => removeVideoDialogOpen && handleRemoveVideo(removeVideoDialogOpen)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Remove Video
                </button>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>

      {/* Generate Video Modal */}
      <GenerateVideoModal
        isOpen={!!videoModalAppId}
        onClose={() => setVideoModalAppId(null)}
        onGenerate={(prompt) => {
          if (videoModalAppId) {
            handleGenerateVideo(videoModalAppId, prompt);
            setVideoModalAppId(null);
          }
        }}
        isRegenerating={!!apps.find(a => a._id === videoModalAppId)?.coverVideoUrl}
        isGenerating={generatingVideoAppId === videoModalAppId}
      />
    </>
  );
}

// Memoize the component to prevent re-renders when apps array reference changes
// but the actual data hasn't changed
export default memo(AppsTable);