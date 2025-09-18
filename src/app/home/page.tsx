'use client';

import {
  Plus,
  Image as ImageIcon,
  Languages,
  Wand2,
  ArrowRight,
  Layout,
  Clock,
  Package,
  Folder,
  User
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { useUser } from '@clerk/nextjs';

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  const { apps, sets, getScreenshotsForSet, clearAllData } = useAppStore();
  const { isSignedIn } = useUser();

  // Add a clear button for development (you can remove this later)
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
      window.location.reload();
    }
  };

  // Get recent sets (last 4)
  const recentSets = [...sets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
    .map(set => {
      const app = apps.find(a => a.id === set.appId);
      const screenshots = getScreenshotsForSet(set.id);
      const filledCount = screenshots.filter(s => !s.isEmpty).length;
      return { ...set, app, filledCount, totalCount: screenshots.length };
    });

  // Function to get app icon (use first letter if no icon)
  const getAppIcon = (app: typeof apps[0]) => {
    if (app.icon) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.icon} alt={app.name} className="w-full h-full object-cover rounded-xl" />
      );
    }
    return (
      <span className="text-2xl font-bold text-primary">
        {app.name.charAt(0).toUpperCase()}
      </span>
    );
  };

  // Function to get relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Top Navigation Bar - Only show sign in button when not authenticated */}
      {!isSignedIn && (
        <div className="absolute top-0 right-0 p-6 z-10">
          <Link href="/welcome?mode=sign-in&context=create-app">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
              <User className="w-4 h-4" />
              Sign In
            </button>
          </Link>
        </div>
      )}

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-[linear-gradient(to_right,theme(colors.blue.600),theme(colors.purple.600),theme(colors.pink.600),theme(colors.orange.600),theme(colors.blue.600))] dark:bg-[linear-gradient(to_right,theme(colors.blue.400),theme(colors.purple.400),theme(colors.pink.400),theme(colors.orange.400),theme(colors.blue.400))] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
            Welcome to Mocksy
          </h1>
          {/* Temporary clear data button - remove in production */}
          {apps.length > 10 && (
            <div className="flex flex-col gap-4">
              <button
                onClick={handleClearData}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Clear All Data (Development Only)
              </button>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          variants={containerAnimation}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <motion.div variants={itemAnimation} className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Wand2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Generate App Store Screenshots</h3>
            <p className="text-sm text-muted-foreground">
              Generate consistent, beautiful screenshots instantly
            </p>
          </motion.div>

          <motion.div variants={itemAnimation} className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">A/B Test Variations</h3>
            <p className="text-sm text-muted-foreground">
              Optimize conversions with AI-powered editing and testing
            </p>
          </motion.div>

          <motion.div variants={itemAnimation} className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Languages className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Automatically Translate Screenshots</h3>
            <p className="text-sm text-muted-foreground">
              Instantly localize for global markets in 30+ languages
            </p>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <Link href="/new-app" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Create New App</h3>
                <p className="text-white/90 mb-3 text-sm">
                  Start fresh with templates and AI assistance
                </p>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/browse-vibes" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
                  <Layout className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Browse Templates</h3>
                <p className="text-white/90 mb-3 text-sm">
                  Explore professional screenshot designs
                </p>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <span>View Templates</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Your Apps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Apps</h2>
            <Link href="/new-app" className="text-sm text-primary hover:underline">
              Create New App →
            </Link>
          </div>
          {apps.length === 0 ? (
            <div className="text-center py-12 bg-card/30 rounded-xl border-2 border-dashed">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No apps yet</p>
              <Link href="/new-app" className="text-primary hover:underline">
                Create your first app
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {apps.map((app) => (
                <motion.div
                  key={app.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link href={`/app/${app.id}`} className="block group">
                    <div className="rounded-xl border bg-card/50 p-4 hover:bg-card hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-[1.05] transition-transform overflow-hidden">
                          {getAppIcon(app)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{app.name}</h3>
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            {app.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {app.sets?.length || 0} sets
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRelativeTime(app.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Add New App Card */}
              {apps.length < 4 && (
                <Link href="/new-app" className="block group">
                  <div className="rounded-xl border-2 border-dashed bg-card/30 p-4 hover:bg-card/50 hover:border-primary/30 transition-all duration-200 h-full flex items-center justify-center min-h-[104px]">
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Create New App</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Ghost cards to fill the row */}
              {apps.length < 3 && Array.from({ length: 3 - apps.length }, (_, i) => (
                <div key={`ghost-${i}`} className="rounded-xl border border-dashed border-border/30 bg-card/10 p-4 min-h-[104px]" />
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Sets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Screenshot Sets</h2>
            {apps.length > 0 && (
              <Link href={`/app/${apps[0]?.id}`} className="text-sm text-primary hover:underline">
                View All Sets →
              </Link>
            )}
          </div>
          {recentSets.length === 0 ? (
            <div className="text-center py-12 bg-card/30 rounded-xl border-2 border-dashed">
              <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No screenshot sets yet</p>
              <Link href="/new-app" className="text-primary hover:underline">
                Create an app to get started
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSets.map((set) => {
                const screenshots = getScreenshotsForSet(set.id);
                const previewScreenshots = screenshots.slice(0, 3);

                return (
                  <motion.div
                    key={set.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link href={`/app/${set.appId}/set/${set.id}`} className="block group">
                      <div className="rounded-xl border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-200">
                        {/* Screenshot Previews Row */}
                        <div className="flex gap-1.5 p-3 pb-2">
                          {[0, 1, 2].map((index) => {
                            const screenshot = previewScreenshots[index];
                            return (
                              <div
                                key={index}
                                className="flex-1 aspect-[9/16] bg-gradient-to-br from-muted/30 to-muted/20 rounded-md flex items-center justify-center overflow-hidden border border-border/30"
                              >
                                {screenshot && !screenshot.isEmpty ? (
                                  screenshot.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={screenshot.imageUrl}
                                      alt={`Screenshot ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                                  )
                                ) : (
                                  <div className="w-full h-full border border-dashed border-border/30 rounded-md flex items-center justify-center">
                                    <ImageIcon className="w-3 h-3 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Set Info */}
                        <div className="px-3 pb-3">
                          <h3 className="font-medium text-sm mb-0.5 truncate">{set.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2 truncate">
                            {set.app?.name || 'Unknown App'}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                              set.filledCount === set.totalCount
                                ? 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400'
                                : 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/30 dark:text-yellow-400'
                            }`}>
                              {set.filledCount}/{set.totalCount} slots
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {getRelativeTime(set.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Create Set Card if less than 3 sets */}
              {recentSets.length > 0 && recentSets.length < 3 && apps.length > 0 && (
                <Link href={`/app/${apps[0].id}/set/new`} className="block group">
                  <div className="rounded-xl border-2 border-dashed bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-200 h-full">
                    {/* Empty Screenshot Slots */}
                    <div className="flex gap-1.5 p-3 pb-2">
                      {[0, 1, 2].map((index) => (
                        <div
                          key={index}
                          className="flex-1 aspect-[9/16] rounded-md flex items-center justify-center border border-dashed border-border/30 bg-gradient-to-br from-muted/10 to-muted/5"
                        >
                          <Plus className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                        </div>
                      ))}
                    </div>

                    {/* Set Info */}
                    <div className="px-3 pb-3">
                      <h3 className="font-medium text-sm mb-0.5 text-muted-foreground group-hover:text-foreground transition-colors">Create New Set</h3>
                      <p className="text-xs text-muted-foreground">
                        Start a new collection
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Ghost cards to fill the row */}
              {recentSets.length > 0 && recentSets.length < 2 && Array.from({ length: 2 - recentSets.length }, (_, i) => (
                <div key={`ghost-set-${i}`} className="rounded-xl border border-dashed border-border/30 bg-card/10">
                  <div className="flex gap-1.5 p-3 pb-2">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="flex-1 aspect-[9/16] rounded-md bg-gradient-to-br from-muted/10 to-muted/5"
                      />
                    ))}
                  </div>
                  <div className="px-3 pb-3">
                    <div className="h-3.5 bg-muted/10 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-muted/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}