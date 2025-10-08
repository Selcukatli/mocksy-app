'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
// import { useAppStore } from '@/stores/appStore';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import OnboardingDialog from '@/components/OnboardingDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Download,
  Settings,
  Smartphone,
  MoreVertical,
  Edit3,
  Upload,
  Layers,
  Globe,
  Package,
  Search,
  FolderPlus,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  FileImage,
  Palette,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';

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
      staggerChildren: 0.03
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

export default function AppDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deleteSetId, setDeleteSetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAppConfirm, setShowDeleteAppConfirm] = useState(false);
  const [showDeleteAppMenu, setShowDeleteAppMenu] = useState(false);
  const [isDeletingApp, setIsDeletingApp] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [screenSearch, setScreenSearch] = useState('');

  // Store hooks for local data (sets, screenshots)
  // const { getScreenshotsForSet } = useAppStore();

  // Convex mutations
  const deleteSetMutation = useMutation(api.screenshotSets.deleteSet);
  const deleteAppMutation = useMutation(api.apps.deleteApp);

  // Get app from Convex
  const app = useQuery(api.apps.getApp, { appId: appId as Id<"apps"> });

  // Fetch sets from Convex
  const convexSets = useQuery(api.screenshotSets.getSetsForApp, app ? { appId: appId as Id<"apps"> } : "skip") ?? [];

  // Fetch app screens from Convex
  const appScreensRaw = useQuery(api.appScreens.getAppScreens, { appId: appId as Id<'apps'> });
  const appScreens = useMemo(() => appScreensRaw ?? [], [appScreensRaw]);
  const appScreensBasePath = `/app/${appId}/app-screens`;
  const appScreensReturnTo = `${appScreensBasePath}?returnTo=${encodeURIComponent(`/app/${appId}`)}`;
  const buildPreviewUrl = (screenId: Id<'appScreens'>) =>
    `${appScreensBasePath}/preview/${screenId}?returnTo=${encodeURIComponent(`/app/${appId}`)}`;

  // Get data for current app
  const sourceImagesCount = appScreens.length;
  const filteredScreens = useMemo(() => {
    const term = screenSearch.trim().toLowerCase();
    if (!term) {
      return appScreens;
    }

    return appScreens.filter((screen) => {
      const name = screen.name?.toLowerCase() ?? '';
      return name.includes(term);
    });
  }, [appScreens, screenSearch]);

  const sortedScreens = useMemo(() => {
    // Sort by date (newest first) to match the preview lightbox default sort
    return [...filteredScreens].sort((a, b) => b.createdAt - a.createdAt);
  }, [filteredScreens]);

  useEffect(() => {
    // Check if user has seen onboarding globally
    const hasSeenOnboarding = localStorage.getItem('mocksy-onboarding-seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    // Listen for custom event from sidebar
    const handleShowOnboardingEvent = () => {
      setShowOnboarding(true);
    };

    window.addEventListener('show-onboarding', handleShowOnboardingEvent);

    return () => {
      window.removeEventListener('show-onboarding', handleShowOnboardingEvent);
    };
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Mark onboarding as seen globally
    localStorage.setItem('mocksy-onboarding-seen', 'true');
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const isAppLoading = app === undefined;
  const isAppMissing = app === null;

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading app…</p>
        </div>
      </div>
    );
  }

  if (isAppMissing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold">We couldn&apos;t find that app</h1>
          <p className="text-sm text-muted-foreground">
            The app you&apos;re looking for may have been removed or you no longer have access to it. Try returning to your apps dashboard.
          </p>
          <button
            type="button"
            onClick={() => router.push('/create')}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/dashboard/apps');
  };

  // Helper to determine set status based on screenshots
  const getSetStatus = (set: typeof convexSets[0]) => {
    if (set.status) return set.status;
    if (set.filledCount === 0) return 'draft';
    if (set.filledCount === set.screenshotCount) return 'ready';
    return 'draft';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'exported':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'iOS':
        return <Package className="w-3 h-3" />;
      case 'Android':
        return <Smartphone className="w-3 h-3" />;
      case 'Both':
        return <Layers className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <>
      <OnboardingDialog isOpen={showOnboarding} onClose={handleOnboardingClose} />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <div className="h-screen flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pt-6 pb-4 border-b"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/60"
                  aria-label="Back to apps"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-4">
                  {/* App Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {app?.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={app.iconUrl} alt={app?.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {app?.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <div className="max-w-lg">
                    <h1 className="text-3xl font-bold">{app?.name || `App ${appId}`}</h1>
                    <p className="text-muted-foreground mt-1 text-sm truncate">
                      {app?.description || 'Manage your app store screenshots and source images'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShowOnboarding}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  How It Works
                </button>
                <button
                  onClick={() => window.open(`/mockstore/${appId}`, '_blank')}
                  className="px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Preview</span>
                </button>
                <button
                  onClick={() => router.push(`/app/${appId}/manage`)}
                  className="px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">App Details</span>
                </button>
                <Popover open={showDeleteAppMenu} onOpenChange={setShowDeleteAppMenu}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border text-lg text-muted-foreground transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600"
                      style={{ lineHeight: 1 }}
                      aria-label="More app actions"
                    >
                      ...
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="end" className="w-40 p-1">
                    <button
                      onClick={() => {
                        setShowDeleteAppMenu(false);
                        setShowDeleteAppConfirm(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete App
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </motion.div>

          {/* Main Content - 2 Column Layout */}
          <div className="flex-1 flex gap-6 p-6 overflow-hidden">
            {/* Left Column - AppStore Sets */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-card border rounded-xl p-6 flex flex-col flex-1 min-h-0">
              {convexSets.length > 0 && (
                <div className="mb-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      AppStore Screenshot Sets
                      <span className="group relative">
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          Collections of screenshots ready for app store submission
                        </span>
                      </span>
                    </h2>
                  </div>

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search sets..."
                        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => router.push(`/app/${appId}/set/new`)}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Create New Set
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto flex flex-col">
                {convexSets.length === 0 ? (
                  /* Zero State - No Sets */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 flex items-center justify-center py-8"
                  >
                      <div className="text-center max-w-2xl px-4">
                        <h3 className="text-3xl font-semibold mb-10">Get Started in 3 Steps</h3>

                      {/* Step by Step Guide */}
                      <div className="space-y-3 mb-10">
                        {/* Step 1 */}
                        <div className={cn(
                          "flex items-start gap-4 text-left p-5 border rounded-xl transition-all cursor-pointer group",
                          appScreens.length > 0
                            ? "bg-card/50 hover:shadow-md"
                            : "bg-card hover:shadow-md"
                        )}
                            onClick={() => router.push(appScreensReturnTo)}>
                          <div className={cn(
                            "w-10 h-10 rounded-full font-bold flex items-center justify-center flex-shrink-0 transition-colors",
                            appScreens.length > 0
                              ? "bg-green-500/10 text-green-600"
                              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                          )}>
                            {appScreens.length > 0 ? '✓' : '1'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 flex items-center gap-2">
                              Upload App Screens
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {appScreens.length > 0 && (
                                <span className="text-xs text-green-600 font-normal">({appScreens.length} uploaded)</span>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Add screenshots from your app to give AI context
                            </p>
                          </div>
                          <Upload className="w-5 h-5 text-muted-foreground mt-0.5" />
                        </div>

                        {/* Step 2 */}
                        <div className={cn(
                          "flex items-start gap-4 text-left p-5 border rounded-xl transition-all",
                          appScreens.length > 0
                            ? "bg-card hover:shadow-md cursor-pointer group"
                            : "bg-card/50 opacity-75"
                        )}
                             onClick={appScreens.length > 0 ? () => router.push('/browse-vibes') : undefined}>
                          <div className={cn(
                            "w-10 h-10 rounded-full font-bold flex items-center justify-center flex-shrink-0 transition-colors",
                            appScreens.length > 0
                              ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            2
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 flex items-center gap-2">
                              Choose a Vibe
                              {appScreens.length > 0 && (
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Select AI-powered templates for your brand
                            </p>
                          </div>
                          <Palette className="w-5 h-5 text-muted-foreground mt-0.5" />
                        </div>

                        {/* Step 3 */}
                        <div className={cn(
                          "flex items-start gap-4 text-left p-5 border rounded-xl transition-all",
                          appScreens.length > 0
                            ? "bg-card hover:shadow-md cursor-pointer group"
                            : "bg-card/50 opacity-75"
                        )}
                             onClick={appScreens.length > 0 ? () => router.push(`/app/${appId}/set/new`) : undefined}>
                          <div className={cn(
                            "w-10 h-10 rounded-full font-bold flex items-center justify-center flex-shrink-0 transition-colors",
                            appScreens.length > 0
                              ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            3
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 flex items-center gap-2">
                              Generate AppStore Screenshots
                              {appScreens.length > 0 && (
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              AI creates beautiful screenshots ready for the App Store
                            </p>
                          </div>
                          <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {appScreens.length === 0 ? (
                          <>
                            <button
                              onClick={() => router.push(appScreensReturnTo)}
                              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Upload className="w-5 h-5" />
                              Start with Step 1: Upload App Screens
                            </button>
                            <button
                              onClick={() => router.push(`/app/${appId}/set/new`)}
                              className="w-full px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              or skip and create a set directly →
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => router.push(`/app/${appId}/set/new`)}
                              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <FolderPlus className="w-5 h-5" />
                              Continue: Create Your First Set
                            </button>
                            <button
                              onClick={() => router.push(appScreensReturnTo)}
                              className="w-full px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              or manage uploaded screens →
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerAnimation}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                    {convexSets.map((set) => (
                      <motion.div
                        key={set._id}
                        variants={itemAnimation}
                        onClick={() => router.push(`/app/${appId}/set/${set._id}`)}
                        className="bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 border-border hover:border-muted-foreground/30 hover:shadow-md"
                      >
                        {/* Set Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{set.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="w-3 h-3" />
                                English
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {getPlatformIcon(set.deviceType || 'Both')}
                                {set.deviceType || 'iPhone'}
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs border",
                            getStatusColor(getSetStatus(set))
                          )}>
                            {getSetStatus(set)}
                          </div>
                        </div>

                        {/* Screenshot Preview Grid */}
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {(() => {
                            const filledCount = set.filledCount || 0;
                            const toShow = Math.min(filledCount, 3);
                            return (
                              <>
                                {Array.from({ length: toShow }).map((_, index) => (
                                  <div
                                    key={index}
                                    className="aspect-[9/16] bg-gradient-to-br from-muted to-muted/50 rounded-md"
                                  />
                                ))}
                                {filledCount > 3 && (
                                  <div className="aspect-[9/16] bg-muted/30 rounded-md flex items-center justify-center relative">
                                    <div
                                      className="aspect-[9/16] absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 rounded-md"
                                    />
                                    <span className="text-sm font-medium text-muted-foreground z-10">
                                      +{filledCount - 2}
                                    </span>
                                  </div>
                                )}
                                {/* Empty slots */}
                                {toShow < 3 && !filledCount && Array.from({ length: 3 - toShow }).map((_, index) => (
                                  <div
                                    key={`empty-${index}`}
                                    className="aspect-[9/16] border border-dashed border-muted-foreground/30 rounded-md"
                                  />
                                ))}
                              </>
                            );
                          })()}
                        </div>

                        {/* Set Footer */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            {set.filledCount || 0} screenshots
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <Popover open={openPopoverId === set._id} onOpenChange={(open) => setOpenPopoverId(open ? set._id : null)}>
                              <PopoverTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="bottom" align="end" className="w-48 p-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPopoverId(null);
                                    // TODO: Implement duplicate functionality
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPopoverId(null);
                                    setDeleteSetId(set._id);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-red-500/10 hover:text-red-600 transition-colors text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Create New Set Card */}
                    <motion.div
                      variants={itemAnimation}
                      onClick={() => router.push(`/app/${appId}/set/new`)}
                      className="bg-card/50 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-muted-foreground/30 hover:bg-muted/20 transition-all duration-200 flex flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <FolderPlus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium">Create New Set</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Start a new screenshot collection
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
              </div>
            </div>

            {/* Right Column - Screens */}
            <div className="w-96 flex flex-col overflow-hidden">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-card border rounded-xl p-6 flex flex-col flex-1 min-h-0"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileImage className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">App Screens</h3>
                        <span className="rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {sourceImagesCount === 1 ? '1 screen' : `${sourceImagesCount} screens`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Keep your latest screens ready for AI templates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="search"
                        placeholder="Search screens..."
                        value={screenSearch}
                        onChange={(event) => setScreenSearch(event.target.value)}
                        className="w-full rounded-lg border border-border bg-background/80 pl-9 pr-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={sourceImagesCount === 0}
                      />
                    </div>
                    <button
                      onClick={() => router.push(appScreensReturnTo)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 flex items-center gap-1"
                    >
                      {sourceImagesCount > 0 ? 'See All' : 'Upload Screens'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex-1 overflow-y-auto pr-1">
                  {sourceImagesCount > 0 ? (
                    sortedScreens.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 pb-1">
                        {sortedScreens.map((screen) => (
                          <div
                            key={screen._id}
                            role="button"
                            tabIndex={0}
                            onClick={() => router.push(buildPreviewUrl(screen._id as Id<'appScreens'>))}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                router.push(buildPreviewUrl(screen._id as Id<'appScreens'>));
                              }
                            }}
                            className="group relative aspect-[9/16] overflow-hidden rounded-xl border border-border bg-muted/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                          >
                            {screen.screenUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={screen.screenUrl}
                                alt={screen.name}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                No preview
                              </div>
                            )}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <p className="text-xs text-white truncate" title={screen.name}>
                                {screen.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                        <div className="rounded-full bg-muted/40 p-3">
                          <Search className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">No matching screens</p>
                          <p className="text-sm">Try a different name or reset your search.</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                      <div className="rounded-full bg-muted/40 p-3">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">No screens yet</p>
                        <p className="text-sm">Upload images to preview them here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete App Confirmation Dialog */}
      {showDeleteAppConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">Delete App?</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete &ldquo;{app?.name || `App ${appId}`}&rdquo;? This will remove the app and all of its data once the process is complete. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteAppConfirm(false);
                  setIsDeletingApp(false);
                }}
                className="px-4 py-2 rounded-lg border transition-colors hover:bg-muted/50"
                disabled={isDeletingApp}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setIsDeletingApp(true);
                    await deleteAppMutation({ appId: appId as Id<"apps"> });
                    setShowDeleteAppConfirm(false);
                    setIsDeletingApp(false);
                    router.push('/create');
                  } catch (error) {
                    console.error('Failed to delete app:', error);
                    setIsDeletingApp(false);
                  }
                }}
                className={cn(
                  'px-4 py-2 rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700',
                  isDeletingApp && 'opacity-80 cursor-not-allowed'
                )}
                disabled={isDeletingApp}
              >
                {isDeletingApp ? 'Deleting...' : 'Delete App'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && deleteSetId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">Delete Set?</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete &quot;{convexSets.find(s => s._id === deleteSetId)?.name}&quot;?
              This will permanently delete all screenshots in this set. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteSetId(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteSetMutation({ setId: deleteSetId as Id<"screenshotSets"> });
                    setShowDeleteConfirm(false);
                    setDeleteSetId(null);
                  } catch (error) {
                    console.error('Failed to delete set:', error);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
