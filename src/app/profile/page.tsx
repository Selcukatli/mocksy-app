'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Settings,
  CreditCard,
  Bell,
  Lock,
  ChevronRight,
  Camera,
  Sparkles,
  Palette,
  Globe,
  Sun,
  Moon,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const syncProfile = useMutation(api.features.profiles.mutations.syncMyProfileFromClerk);
  const isAdmin = useQuery(api.features.profiles.queries.isCurrentUserAdmin);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/welcome?mode=sign-in&context=app-access');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Unknown';

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/welcome?mode=sign-in' });
  };

  const handleDeleteAccount = async () => {
    // This would connect to your backend to delete the user account
    // For now, just sign out
    await signOut({ redirectUrl: '/welcome?mode=sign-in' });
  };

  const handleSyncProfile = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const result = await syncProfile({});
      setSyncMessage(result.message);
      setTimeout(() => setSyncMessage(''), 3000);
    } catch {
      setSyncMessage('Failed to sync profile');
      setTimeout(() => setSyncMessage(''), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          description: 'Update your personal information',
          onClick: () => openUserProfile()
        },
        {
          icon: Mail,
          label: 'Email Addresses',
          description: 'Manage your email addresses',
          onClick: () => openUserProfile()
        },
        {
          icon: Lock,
          label: 'Security',
          description: 'Password and authentication',
          onClick: () => openUserProfile()
        },
        ...(isAdmin ? [{
          icon: Shield,
          label: 'Admin',
          description: 'Access admin dashboard',
          onClick: () => router.push('/admin')
        }] : []),
      ]
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: Palette,
          label: 'Appearance',
          description: 'Theme and display preferences',
          onClick: () => {}
        },
        {
          icon: Globe,
          label: 'Language',
          description: 'Language and region settings',
          onClick: () => {}
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Configure notification preferences',
          onClick: () => {}
        },
      ]
    },
    {
      title: 'Billing',
      items: [
        {
          icon: CreditCard,
          label: 'Subscription',
          description: 'Manage your subscription',
          onClick: () => {}
        },
        {
          icon: Settings,
          label: 'Usage',
          description: 'View your usage statistics',
          onClick: () => {}
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:p-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-1 space-y-4 md:space-y-6"
          >
            {/* Profile Card */}
            <div className="bg-card rounded-xl border p-4 md:p-6">
              <div className="flex flex-col">
                {/* Edit and Sync buttons in top right corner */}
                <div className="flex justify-end gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSyncProfile}
                    disabled={isSyncing}
                    className="text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openUserProfile()}
                    className="text-xs"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
                {syncMessage && (
                  <div className="mb-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-600 dark:text-green-500">
                    {syncMessage}
                  </div>
                )}

                {/* Avatar and User Info */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                      {user.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-primary" />
                      )}
                    </div>
                    <button
                      onClick={() => openUserProfile()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-1">
                      {user.firstName || user.username || 'User'} {user.lastName || ''}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm w-full">
                  <div className="flex items-center justify-between py-2 border-t">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">{memberSince}</span>
                  </div>
                  {user.primaryEmailAddress?.verification?.status === 'verified' && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-muted-foreground">Status</span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                        <Shield className="w-3 h-3" />
                        <span className="font-medium">Verified</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Out Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowSignOutDialog(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Plan Card */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border p-4 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Free Plan</h3>
                  <p className="text-xs text-muted-foreground">
                    3 apps, 10 screenshots per app
                  </p>
                </div>
              </div>
              <Button variant="default" className="w-full flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Upgrade to Pro
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2 space-y-4 md:space-y-6"
          >
            {profileSections.filter(section => section.title !== 'Account').map((section) => (
              <div key={section.title} className="bg-card rounded-xl border">
                <div className="px-4 py-3 md:px-6 border-b border-border/50 bg-muted/5">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                </div>
                <div className="divide-y divide-border/50">
                  {section.items.map((item, itemIndex) => {
                    // Special rendering for Appearance item
                    if (item.label === 'Appearance') {
                      return (
                        <div key={itemIndex} className="px-4 py-4 md:px-6 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Palette className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant={theme === 'light' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => setTheme('light')}
                              className={`h-8 px-2 md:px-3 ${theme === 'light' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
                            >
                              <Sun className="w-4 h-4 md:mr-1" />
                              <span className="hidden md:inline">Light</span>
                            </Button>
                            <Button
                              variant={theme === 'dark' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => setTheme('dark')}
                              className={`h-8 px-2 md:px-3 ${theme === 'dark' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
                            >
                              <Moon className="w-4 h-4 md:mr-1" />
                              <span className="hidden md:inline">Dark</span>
                            </Button>
                            <Button
                              variant={theme === 'system' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => setTheme('system')}
                              className={`h-8 px-2 md:px-3 ${theme === 'system' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
                            >
                              <Monitor className="w-4 h-4 md:mr-1" />
                              <span className="hidden md:inline">System</span>
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    // Default rendering for other items
                    return (
                      <button
                        key={itemIndex}
                        onClick={item.onClick}
                        className="w-full px-4 py-4 md:px-6 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Danger Zone */}
            <div className="p-4 md:p-6 rounded-xl border border-destructive/20 bg-destructive/5">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Sign Out Confirmation Dialog */}
        <AnimatePresence>
          {showSignOutDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSignOutDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-background rounded-xl border p-6 max-w-sm w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-2">Sign Out?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to sign out of your account?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSignOutDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Account Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText('');
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-background rounded-xl border p-6 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </p>
                <p className="text-sm font-medium mb-2">
                  Type <span className="font-mono bg-muted px-2 py-1 rounded">delete my account</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-destructive"
                  placeholder="Type here..."
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'delete my account'}
                  >
                    Delete Account
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}