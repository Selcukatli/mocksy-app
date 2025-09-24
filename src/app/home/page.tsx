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
  User,
  X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const isSignedIn = !!user;

  const apps = useQuery(api.apps.getApps) || [];
  const recentSets = useQuery(api.screenshotSets.getRecentSets) || [];
  const createSetMutation = useMutation(api.screenshotSets.createSet);

  const [showAppSelectionDialog, setShowAppSelectionDialog] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [setName, setSetName] = useState('');
  const [creatingSet, setCreatingSet] = useState(false);

  // Function to handle creating a new set
  const handleCreateSet = async () => {
    if (!selectedAppId || !setName.trim()) return;

    setCreatingSet(true);
    try {
      const setId = await createSetMutation({
        appId: selectedAppId as Id<"apps">,
        name: setName.trim(),
        deviceType: 'iPhone 15 Pro',
      });

      // Navigate to the newly created set
      router.push(`/app/${selectedAppId}/set/${setId}`);

      // Reset the dialog state
      setShowAppSelectionDialog(false);
      setSelectedAppId(null);
      setSetName('');
    } catch (error) {
      console.error('Failed to create set:', error);
    } finally {
      setCreatingSet(false);
    }
  };

  // Function to get app icon (use first letter if no icon)
  const getAppIcon = (app: typeof apps[0]) => {
    if (app.iconUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover rounded-xl" />
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

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex-1 p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-black mb-8 relative inline-block cursor-pointer group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <span className="relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 via-pink-600 to-orange-500 animate-gradient-x">
              Welcome to Mocksy
            </span>
            <motion.span
              className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-blue-600/5 via-purple-600/5 via-pink-600/5 to-orange-500/5 blur-3xl transition-all duration-300 group-hover:blur-2xl group-hover:opacity-60"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </span>
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 overflow-hidden"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
            style={{ originX: 0.5 }}
          >
            <div className="h-full w-[200%] bg-gradient-to-r from-transparent via-purple-600/20 to-transparent group-hover:via-purple-600/40 transition-all duration-300 group-hover:animate-gradient-slide" />
          </motion.div>
        </motion.h1>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <Wand2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-base mb-1">Generate App Store Screenshots</h3>
            <p className="text-sm text-muted-foreground">Generate consistent, beautiful screenshots instantly</p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-400/20 dark:to-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <Layout className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-base mb-1">A/B Test Variations</h3>
            <p className="text-sm text-muted-foreground">Optimize conversions with AI-powered editing and testing</p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-400/20 dark:to-green-500/20 flex items-center justify-center mx-auto mb-3">
              <Languages className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-base mb-1">Automatically Translate Screenshots</h3>
            <p className="text-sm text-muted-foreground">Instantly localize for global markets in 30+ languages</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/new-app" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 transition-all duration-300 hover:shadow-xl shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
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
            </motion.div>
          </Link>

          <Link href="/browse-vibes" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 p-6 transition-all duration-300 hover:shadow-xl shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
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
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Your Apps Section - Only show if user is signed in and has apps */}
      {isSignedIn && apps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Apps</h2>
            <Link href="/new-app" className="text-primary hover:underline text-sm">
              Create New App →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {apps.slice(0, 3).map((app) => (
              <Link key={app._id} href={`/app/${app._id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getAppIcon(app)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{app.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {getRelativeTime(new Date(app.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}

            {/* Add App Card */}
            {apps.length < 4 && (
              <Link href="/new-app">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="p-4 rounded-xl border-2 border-dashed bg-card/50 hover:bg-card hover:shadow-md transition-all duration-200 h-full flex items-center justify-center min-h-[88px]"
                >
                  <div className="text-center">
                    <Plus className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Create New App</p>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Ghost cards to fill the row */}
            {apps.length === 1 && (
              <>
                <div className="hidden md:block opacity-0 pointer-events-none" />
                <div className="hidden lg:block opacity-0 pointer-events-none" />
              </>
            )}
            {apps.length === 2 && (
              <div className="hidden lg:block opacity-0 pointer-events-none" />
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Sets Section */}
      {isSignedIn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Screenshot Sets</h2>
            {apps.length > 0 && recentSets.length > 0 && (
              <Link href={`/app/${recentSets[0]?.appId}`} className="text-primary hover:underline text-sm">
                View All Sets →
              </Link>
            )}
          </div>
          {recentSets.length === 0 ? (
            <div className="text-center py-12 bg-card/30 rounded-xl border-2 border-dashed">
              <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No screenshot sets yet</p>
              {apps.length > 0 ? (
                <button
                  onClick={() => setShowAppSelectionDialog(true)}
                  className="text-primary hover:underline"
                >
                  Create your first screenshot set
                </button>
              ) : (
                <Link href="/new-app" className="text-primary hover:underline">
                  Create an app to get started
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSets.map((set) => {
                return (
                  <motion.div
                    key={set._id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link href={`/app/${set.appId}/set/${set._id}`} className="block group">
                      <div className="rounded-xl border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-200">
                        {/* Screenshot Previews Row */}
                        <div className="flex gap-1.5 p-3 pb-2">
                          {[0, 1, 2].map((index) => {
                            return (
                              <div
                                key={index}
                                className="flex-1 aspect-[9/16] bg-gradient-to-br from-muted/30 to-muted/20 rounded-md flex items-center justify-center overflow-hidden border border-border/30"
                              >
                                <div className="w-full h-full border border-dashed border-border/30 rounded-md flex items-center justify-center">
                                  <ImageIcon className="w-3 h-3 text-muted-foreground/30" />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Set Info */}
                        <div className="px-3 pb-3">
                          <div className="flex items-start gap-2 mb-2">
                            {/* App Icon */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {set.app?.iconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={set.app.iconUrl}
                                  alt={set.app.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold text-primary">
                                  {(set.app?.name || 'A').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm mb-0.5 truncate">{set.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {set.app?.name || 'Unknown App'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                              set.filledCount === set.screenshotCount && set.screenshotCount > 0
                                ? 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400'
                                : set.filledCount > 0
                                ? 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/30 dark:text-yellow-400'
                                : 'bg-gray-500/20 text-gray-600 dark:bg-gray-500/30 dark:text-gray-400'
                            }`}>
                              {set.filledCount}/{set.screenshotCount || 10} slots
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {getRelativeTime(new Date(set.updatedAt))}
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
                <button
                  onClick={() => setShowAppSelectionDialog(true)}
                  className="block group w-full text-left"
                >
                  <div className="rounded-xl border-2 border-dashed bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-200 h-full flex flex-col items-center justify-center">
                    <div className="text-center py-8">
                      <p className="font-medium text-sm mb-4 text-muted-foreground group-hover:text-foreground transition-colors">
                        Create New Set
                      </p>
                      <div className="w-16 h-16 rounded-full bg-muted/20 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200 mx-auto">
                        <Plus className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Ghost cards to fill the row */}
              {recentSets.length === 1 && (
                <>
                  <div className="hidden md:block" />
                  <div className="hidden lg:block" />
                </>
              )}
              {recentSets.length === 2 && (
                <div className="hidden lg:block" />
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Sign in prompt for non-authenticated users */}
      {!isSignedIn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center py-12"
        >
          <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to get started</h2>
          <p className="text-muted-foreground mb-6">Create and manage your app store screenshots</p>
          <Link href="/welcome?mode=sign-in&context=create-app">
            <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
              Sign In / Sign Up
            </button>
          </Link>
        </motion.div>
      )}

      {/* App Selection Dialog */}
      <AnimatePresence>
        {showAppSelectionDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowAppSelectionDialog(false);
                setSelectedAppId(null);
                setSetName('');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-card rounded-xl border shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden"
            >
              {/* Dialog Header */}
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selectedAppId ? 'Name Your Set' : 'Select an App'}
                </h2>
                <button
                  onClick={() => {
                    setShowAppSelectionDialog(false);
                    setSelectedAppId(null);
                    setSetName('');
                  }}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="relative p-6 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  {!selectedAppId ? (
                    // Step 1: App Selection
                    <motion.div
                      key="app-selection"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {apps.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No apps available</p>
                      <Link href="/new-app">
                        <button
                          onClick={() => setShowAppSelectionDialog(false)}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                        >
                          Create Your First App
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {apps.map((app, index) => (
                        <motion.button
                          key={app._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedAppId(app._id);
                            setSetName(`${app.name} Screenshots`);
                          }}
                          className="w-full p-3 rounded-lg border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200 flex items-start gap-3 group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {getAppIcon(app)}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                              {app.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {app.description || 'No description'}
                            </p>
                          </div>
                        </motion.button>
                      ))}

                      {/* Create New App Option */}
                      <Link href="/new-app">
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: apps.length * 0.05 }}
                          whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowAppSelectionDialog(false)}
                          className="w-full p-3 rounded-lg border-2 border-dashed bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-200 flex items-center gap-3 group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              Create New App
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Start fresh with a new app
                            </p>
                          </div>
                        </motion.button>
                      </Link>
                    </div>
                  )}
                    </motion.div>
                  ) : (
                    // Step 2: Set Naming
                    <motion.div
                      key="set-naming"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-4"
                    >
                    {/* Selected App Display */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
                      className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 border flex items-center gap-3"
                    >
                      <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden"
                      >
                        {getAppIcon(apps.find(a => a._id === selectedAppId)!)}
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {apps.find(a => a._id === selectedAppId)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Selected app</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedAppId(null);
                          setSetName('');
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                      >
                        Change
                      </motion.button>
                    </motion.div>

                    {/* Set Name Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label htmlFor="set-name" className="text-sm font-medium">
                        Set Name
                      </label>
                      <input
                        id="set-name"
                        type="text"
                        value={setName}
                        onChange={(e) => setSetName(e.target.value)}
                        placeholder="e.g., iOS Screenshots - English"
                        className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Give your screenshot set a descriptive name
                      </p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="flex gap-2 pt-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedAppId(null);
                          setSetName('');
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: creatingSet ? 1 : 1.02 }}
                        whileTap={{ scale: creatingSet ? 1 : 0.98 }}
                        onClick={handleCreateSet}
                        disabled={!setName.trim() || creatingSet}
                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                      >
                        {creatingSet && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: [-200, 200] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                        <span className="relative">
                          {creatingSet ? 'Creating...' : 'Create Set'}
                        </span>
                      </motion.button>
                    </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}