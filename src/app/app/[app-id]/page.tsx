'use client';

import { use, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/appStore';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
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
  Sparkles,
  ArrowRight,
  FileImage,
  Palette,
  Trash2,
  Copy,
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
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Store hooks for local data (sets, screenshots)
  const { getSetsForApp, getScreenshotsForSet, deleteSet } = useAppStore();

  // Get app from Convex
  const app = useQuery(api.apps.getApp, { appId: appId as Id<"apps"> });

  // Fetch app screens from Convex
  const appScreens = useQuery(api.appScreens.getAppScreens, { appId: appId as Id<"apps"> }) ?? [];

  // If app doesn't exist or still loading, handle accordingly
  useEffect(() => {
    // app === null means it loaded but doesn't exist
    // app === undefined means still loading
    if (app === null) {
      console.log('App not found in Convex, redirecting to home');
      router.push('/home');
    }
  }, [app, router]);

  // Get data for current app (still from local store for now)
  const appStoreSets = app ? getSetsForApp(appId) : [];
  const sourceImagesCount = appScreens.length;

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

  // Helper to determine set status based on screenshots
  const getSetStatus = (setId: string) => {
    const screenshots = getScreenshotsForSet(setId);
    const filledCount = screenshots.filter(s => !s.isEmpty).length;
    if (filledCount === 0) return 'draft';
    if (filledCount === screenshots.length) return 'ready';
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
                <div>
                  <h1 className="text-3xl font-bold">{app?.name || `App ${appId}`}</h1>
                  <p className="text-muted-foreground mt-1">{app?.description || 'Manage your app store screenshots and source images'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleShowOnboarding}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  See How It Works
                </button>
                <button
                  onClick={() => router.push(`/app/${appId}/manage`)}
                  className="px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Manage App Details</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content - 2 Column Layout */}
          <div className="flex-1 flex gap-6 p-6 overflow-hidden">
            {/* Left Column - AppStore Sets */}
            <div className="flex-1 flex flex-col">
              {appStoreSets.length > 0 && (
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
                {appStoreSets.length === 0 ? (
                  /* Zero State - No Sets */
                  <div className="flex-1 flex flex-col">
                    {/* Header for zero state */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          AppStore Screenshot Sets
                          <span className="group relative">
                            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              Collections of screenshots ready for app store submission
                            </span>
                          </span>
                        </h2>
                        <button
                          onClick={() => router.push(`/app/${appId}/set/new`)}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                        >
                          <FolderPlus className="w-4 h-4" />
                          Create New Set
                        </button>
                      </div>
                    </div>

                    {/* Zero State Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex-1 flex items-center justify-center"
                    >
                      <div className="text-center max-w-lg">
                        <div className="mb-6">
                          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-primary" />
                          </div>
                        </div>

                        <h3 className="text-2xl font-semibold mb-8">Get Started in 3 Steps</h3>

                      {/* Step by Step Guide */}
                      <div className="space-y-4 mb-8">
                        {/* Step 1 */}
                        <div className={cn(
                          "flex items-start gap-4 text-left p-4 border rounded-lg transition-all cursor-pointer group",
                          appScreens.length > 0
                            ? "bg-card/50 hover:shadow-md"
                            : "bg-card hover:shadow-md"
                        )}
                             onClick={() => router.push(`/app/${appId}/app-screens`)}>
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
                          "flex items-start gap-4 text-left p-4 border rounded-lg transition-all",
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
                          "flex items-start gap-4 text-left p-4 border rounded-lg transition-all",
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
                              onClick={() => router.push(`/app/${appId}/app-screens`)}
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
                              onClick={() => router.push(`/app/${appId}/app-screens`)}
                              className="w-full px-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              or manage uploaded screens →
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  </div>
                ) : (
                  <motion.div
                    variants={containerAnimation}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                    {appStoreSets.map((set) => (
                      <motion.div
                        key={set.id}
                        variants={itemAnimation}
                        onClick={() => router.push(`/app/${appId}/set/${set.id}`)}
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
                            getStatusColor(getSetStatus(set.id))
                          )}>
                            {getSetStatus(set.id)}
                          </div>
                        </div>

                        {/* Screenshot Preview Grid */}
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {(() => {
                            const screenshots = getScreenshotsForSet(set.id).filter(s => !s.isEmpty);
                            const toShow = screenshots.slice(0, screenshots.length > 3 ? 2 : 3);
                            return (
                              <>
                                {toShow.map((screenshot, index) => (
                                  <div
                                    key={index}
                                    className="aspect-[9/16] bg-gradient-to-br from-muted to-muted/50 rounded-md"
                                  />
                                ))}
                                {screenshots.length > 3 && (
                                  <div className="aspect-[9/16] bg-muted/30 rounded-md flex items-center justify-center relative">
                                    <div
                                      className="aspect-[9/16] absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 rounded-md"
                                    />
                                    <span className="text-sm font-medium text-muted-foreground z-10">
                                      +{screenshots.length - 2}
                                    </span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Set Footer */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            {getScreenshotsForSet(set.id).filter(s => !s.isEmpty).length} screenshots
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
                            <Popover open={openPopoverId === set.id} onOpenChange={(open) => setOpenPopoverId(open ? set.id : null)}>
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
                                    setDeleteSetId(set.id);
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

            {/* Right Column - Actions */}
            <div className="w-96 space-y-4">
              {/* Upload Source Images Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push(`/app/${appId}/app-screens`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <FileImage className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      Manage App Screens
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload and organize screenshots from your app for AI generation
                    </p>
                  </div>
                </div>

                {/* Thumbnail Preview Section */}
                {appScreens.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {/* Show actual uploaded images */}
                    {appScreens.slice(0, Math.min(appScreens.length, 3)).map((screen) => (
                      <div
                        key={screen._id}
                        className="aspect-[9/16] bg-muted/20 rounded-md overflow-hidden"
                      >
                        {screen.screenUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={screen.screenUrl}
                            alt={screen.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}

                    {/* Add ghost cells if less than 3 images */}
                    {appScreens.length < 3 && Array(3 - appScreens.length).fill(0).map((_, index) => (
                      <div
                        key={`ghost-${index}`}
                        className="aspect-[9/16] bg-muted/10 border border-dashed border-muted-foreground/20 rounded-md"
                      />
                    ))}

                    {/* Show +X indicator for overflow */}
                    {appScreens.length > 3 && (
                      <div className="aspect-[9/16] bg-muted/30 rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          +{appScreens.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/app/${appId}/app-screens`);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {sourceImagesCount > 0 ? 'Manage Screens' : 'Upload Screens'}
                </button>
              </motion.div>

              {/* Browse Vibes Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push('/browse-vibes')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                    <Palette className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      Browse Vibes
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose AI style templates to generate stunning, consistent app store screenshots
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center">
                        <div className="w-full h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-md mb-1" />
                        <span className="text-xs">Snap</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-full h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md mb-1" />
                        <span className="text-xs">Zen</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-full h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-md mb-1" />
                        <span className="text-xs">GenZ</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/browse-vibes');
                  }}
                  className="w-full mt-4 px-4 py-2 border hover:bg-muted/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore All Vibes
                </button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-muted/30 rounded-xl p-6"
              >
                <h3 className="font-semibold mb-4 text-sm">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Sets</span>
                    <span className="font-semibold">{appStoreSets.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ready to Export</span>
                    <span className="font-semibold text-green-600">
                      {appStoreSets.filter(s => getSetStatus(s.id) === 'ready').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In Draft</span>
                    <span className="font-semibold text-yellow-600">
                      {appStoreSets.filter(s => getSetStatus(s.id) === 'draft').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source Images</span>
                    <span className="font-semibold">
                      {sourceImagesCount}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

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
              Are you sure you want to delete &quot;{appStoreSets.find(s => s.id === deleteSetId)?.name}&quot;?
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
                onClick={() => {
                  deleteSet(deleteSetId);
                  setShowDeleteConfirm(false);
                  setDeleteSetId(null);
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