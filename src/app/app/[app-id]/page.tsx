'use client';

import { use, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Download,
  Settings,
  Smartphone,
  Check,
  MoreVertical,
  Edit3,
  Upload,
  Image as ImageIcon,
  Layers,
  Globe,
  Package,
  Search,
  FolderPlus,
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

interface SourceImage {
  id: string;
  name: string;
  url?: string;
  uploadedAt: Date;
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
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Mock data for source images
  const sourceImages: SourceImage[] = [
    { id: '1', name: 'Home Screen', uploadedAt: new Date() },
    { id: '2', name: 'Dashboard', uploadedAt: new Date() },
    { id: '3', name: 'Profile', uploadedAt: new Date() },
    { id: '4', name: 'Settings', uploadedAt: new Date() },
    { id: '5', name: 'Onboarding 1', uploadedAt: new Date() },
    { id: '6', name: 'Onboarding 2', uploadedAt: new Date() },
    { id: '7', name: 'Feature Detail', uploadedAt: new Date() },
    { id: '8', name: 'Search Results', uploadedAt: new Date() },
  ];

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

  const toggleImageSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
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
            <div className="flex gap-2">
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

        {/* Main Content - 3 Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Source Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-80 border-r bg-card/50 flex flex-col"
          >
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">Source Images</h2>
                <button
                  onClick={() => router.push(`/app/${appId}/source-images`)}
                  className="text-xs hover:text-foreground text-muted-foreground transition-colors"
                >
                  See All
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search images..."
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>

              <button className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                Upload Images
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {sourceImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => toggleImageSelection(image.id)}
                    className={cn(
                      "relative p-2 rounded-lg border cursor-pointer transition-all duration-200",
                      selectedImages.has(image.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-20 rounded-md bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {image.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                      {selectedImages.has(image.id) && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Center - AppStore Sets */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b bg-card/30">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">AppStore Sets</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Collections of screenshots ready for app store submission
                </p>
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

            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                variants={containerAnimation}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
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

          {/* Right Sidebar - Contextual Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="w-80 border-l bg-card/50 flex flex-col"
          >
            {selectedSet ? (
              // Set Details View
              <>
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-sm">Set Details</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {appStoreSets.find(s => s.id === selectedSet) && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Name</label>
                          <p className="text-sm mt-1">{appStoreSets.find(s => s.id === selectedSet)?.name}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Language</label>
                          <p className="text-sm mt-1">{appStoreSets.find(s => s.id === selectedSet)?.language}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Platform</label>
                          <p className="text-sm mt-1">{appStoreSets.find(s => s.id === selectedSet)?.platform}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Status</label>
                          <p className="text-sm mt-1 capitalize">{appStoreSets.find(s => s.id === selectedSet)?.status}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <button className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm">
                          Export Set
                        </button>
                        <button className="w-full px-3 py-2 border hover:bg-muted/50 rounded-lg transition-colors text-sm">
                          Edit Set
                        </button>
                        <button className="w-full px-3 py-2 border hover:bg-muted/50 rounded-lg transition-colors text-sm">
                          Duplicate Set
                        </button>
                        <button className="w-full px-3 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-600 rounded-lg transition-colors text-sm">
                          Delete Set
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Vibes View (default when no set selected)
              <>
                <div className="p-4 border-b space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-semibold text-sm">Vibes</h2>
                      <button className="text-xs hover:text-foreground text-muted-foreground transition-colors">
                        See All
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">AI styles to generate stunning screenshots</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search vibes..."
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Popular Vibes */}
                  <div className="space-y-2">
                    <button className="w-full p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 text-left group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">✨</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Snap Style</p>
                          <p className="text-xs text-muted-foreground">Bold, playful, social media ready</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 text-left group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">🎨</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Watercolor Zen</p>
                          <p className="text-xs text-muted-foreground">Soft, calming, wellness focused</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 text-left group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">⚡</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">GenZ Medley</p>
                          <p className="text-xs text-muted-foreground">Vibrant, trendy, meme-worthy</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 text-left group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">🏢</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Corporate Pro</p>
                          <p className="text-xs text-muted-foreground">Clean, professional, trustworthy</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 text-left group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">🌿</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Nature Flow</p>
                          <p className="text-xs text-muted-foreground">Organic, earthy, sustainable</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 text-left group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">🚀</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Tech Futura</p>
                          <p className="text-xs text-muted-foreground">Futuristic, innovative, cutting-edge</p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 border rounded-lg hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 text-left group">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-lg">💖</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Love Story</p>
                          <p className="text-xs text-muted-foreground">Romantic, emotional, heartfelt</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 border-t space-y-3">
                  <button className="w-full px-3 py-2 border border-dashed hover:bg-muted/30 rounded-lg transition-colors text-sm">
                    + Create Custom Vibe
                  </button>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Tip:</span> Select a vibe and source images to generate AI-powered screenshots instantly.
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}