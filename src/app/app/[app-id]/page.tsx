'use client';

import { use, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import OnboardingDialog from '@/components/OnboardingDialog';
import {
  Download,
  Settings,
  Smartphone,
  Check,
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
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

interface AppStoreSet {
  id: string;
  name: string;
  language: string;
  platform: 'iOS' | 'Android' | 'Both';
  status: 'draft' | 'ready' | 'exported';
  screenshots: string[];
  createdAt: Date;
  modifiedAt: Date;
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

  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Mock source images count - in real app this would come from API/database
  const sourceImagesCount = 8; // Set to 0 to test empty state

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

  // Mock data for app store sets
  const appStoreSets: AppStoreSet[] = [
    {
      id: '1',
      name: 'Main Launch Set',
      language: 'English',
      platform: 'Both',
      status: 'ready',
      screenshots: ['1', '2', '3', '4', '5'],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: '2',
      name: 'Holiday Campaign',
      language: 'English',
      platform: 'iOS',
      status: 'draft',
      screenshots: ['1', '3', '5'],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: '3',
      name: 'Spanish Version',
      language: 'Español',
      platform: 'Both',
      status: 'ready',
      screenshots: ['1', '2', '3', '4'],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

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
              <div>
                <h1 className="text-3xl font-bold">App {appId}</h1>
                <p className="text-muted-foreground mt-1">Manage your app store screenshots and source images</p>
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
                  <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
                    <FolderPlus className="w-4 h-4" />
                    Create New Set
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
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
                      onClick={() => setSelectedSet(set.id)}
                      className={cn(
                        "bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200",
                        selectedSet === set.id
                          ? "border-primary shadow-lg"
                          : "border-border hover:border-muted-foreground/30 hover:shadow-md"
                      )}
                    >
                      {/* Set Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{set.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              {set.language}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getPlatformIcon(set.platform)}
                              {set.platform}
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs border",
                          getStatusColor(set.status)
                        )}>
                          {set.status}
                        </div>
                      </div>

                      {/* Screenshot Preview Grid */}
                      <div className="grid grid-cols-3 gap-1.5 mb-3">
                        {set.screenshots.slice(0, set.screenshots.length > 3 ? 2 : 3).map((screenshotId, index) => (
                          <div
                            key={index}
                            className="aspect-[9/16] bg-gradient-to-br from-muted to-muted/50 rounded-md"
                          />
                        ))}
                        {set.screenshots.length > 3 && (
                          <div className="aspect-[9/16] bg-muted/30 rounded-md flex items-center justify-center relative">
                            <div
                              className="aspect-[9/16] absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 rounded-md"
                            />
                            <span className="text-sm font-medium text-muted-foreground z-10">
                              +{set.screenshots.length - 2}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Set Footer */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          {set.screenshots.length} screenshots
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Create New Set Card */}
                  <motion.div
                    variants={itemAnimation}
                    className="bg-card/50 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-muted-foreground/30 hover:bg-muted/20 transition-all duration-200 flex items-center justify-center min-h-[200px]"
                  >
                    <div className="text-center">
                      <FolderPlus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium">Create New Set</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start a new screenshot collection
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
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
                onClick={() => router.push(`/app/${appId}/source-images`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <FileImage className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      Upload Source Images
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add screenshots from your app to use as source material for AI generation
                    </p>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary" />
                        Drag & drop
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary" />
                        Batch upload
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/app/${appId}/source-images`);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {sourceImagesCount > 0 ? 'Upload & Manage' : 'Upload Images'}
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
                      {appStoreSets.filter(s => s.status === 'ready').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In Draft</span>
                    <span className="font-semibold text-yellow-600">
                      {appStoreSets.filter(s => s.status === 'draft').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Languages</span>
                    <span className="font-semibold">
                      {new Set(appStoreSets.map(s => s.language)).size}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}