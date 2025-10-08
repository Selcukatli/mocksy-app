'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import {
  Save,
  Trash2,
  Smartphone,
  Package,
  Link,
  AlertTriangle,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

export default function ManageAppPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'] as Id<"apps">;
  const router = useRouter();

  // State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [platforms, setPlatforms] = useState({ ios: true, android: true });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [appStoreUrl, setAppStoreUrl] = useState('');
  const [playStoreUrl, setPlayStoreUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ageRating, setAgeRating] = useState('4+');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<{
    name: string;
    description: string;
    category: string;
    platforms: { ios: boolean; android: boolean };
    languages: string[];
    appStoreUrl: string;
    playStoreUrl: string;
    websiteUrl: string;
    bundleId: string;
    keywords: string;
    ageRating: string;
    iconUrl: string | null;
  } | null>(null);

  // Convex queries and mutations
  const app = useQuery(api.apps.getApp, { appId });
  const updateApp = useMutation(api.apps.updateApp);
  const deleteApp = useMutation(api.apps.deleteApp);
  const storeFromBase64 = useAction(api.fileStorage.base64Files.storeBase64File);

  // Initialize form with app data
  useEffect(() => {
    if (app) {
      const initialData = {
        name: app.name,
        description: app.description || '',
        category: app.category || 'Productivity',
        platforms: app.platforms || { ios: true, android: true },
        languages: app.languages || ['English'],
        appStoreUrl: app.appStoreUrl || '',
        playStoreUrl: app.playStoreUrl || '',
        websiteUrl: app.websiteUrl || '',
        bundleId: app.bundleId || '',
        keywords: app.keywords?.join(', ') || '',
        ageRating: app.ageRating || '4+',
        iconUrl: app.iconUrl || null
      };

      setOriginalData(initialData);
      setAppName(initialData.name);
      setAppDescription(initialData.description);
      setCategory(initialData.category);
      setPlatforms(initialData.platforms);
      setSelectedLanguages(initialData.languages);
      setAppStoreUrl(initialData.appStoreUrl);
      setPlayStoreUrl(initialData.playStoreUrl);
      setWebsiteUrl(initialData.websiteUrl);
      setBundleId(initialData.bundleId);
      setKeywords(initialData.keywords);
      setAgeRating(initialData.ageRating);
      if (initialData.iconUrl) {
        setIconPreview(initialData.iconUrl);
      }
      setHasChanges(false);
    }
  }, [app]);

  // Check for changes
  useEffect(() => {
    if (!originalData) return;

    const hasAnyChanges =
      appName !== originalData.name ||
      appDescription !== originalData.description ||
      category !== originalData.category ||
      JSON.stringify(platforms) !== JSON.stringify(originalData.platforms) ||
      JSON.stringify(selectedLanguages) !== JSON.stringify(originalData.languages) ||
      appStoreUrl !== originalData.appStoreUrl ||
      playStoreUrl !== originalData.playStoreUrl ||
      websiteUrl !== originalData.websiteUrl ||
      bundleId !== originalData.bundleId ||
      keywords !== originalData.keywords ||
      ageRating !== originalData.ageRating ||
      (iconPreview !== originalData.iconUrl && !!iconPreview?.startsWith('data:'));

    setHasChanges(hasAnyChanges);
  }, [appName, appDescription, category, platforms, selectedLanguages, appStoreUrl,
      playStoreUrl, websiteUrl, bundleId, keywords, ageRating, iconPreview, originalData]);

  // Redirect if app not found
  useEffect(() => {
    if (app === null) {
      router.push('/create');
    }
  }, [app, router]);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!app) return;

    setIsSaving(true);
    try {
      // Upload new icon if changed
      let iconStorageId = app.iconStorageId;
      if (iconPreview && iconPreview !== app.iconUrl && iconPreview.startsWith('data:')) {
        iconStorageId = await storeFromBase64({
          base64Data: iconPreview,
          contentType: 'image/png',
        });
      }

      // Update app in Convex
      await updateApp({
        appId,
        name: appName,
        description: appDescription,
        iconStorageId,
        category,
        platforms,
        languages: selectedLanguages,
        appStoreUrl: appStoreUrl || undefined,
        playStoreUrl: playStoreUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        bundleId: bundleId || undefined,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        ageRating: ageRating || undefined,
      });

      // Reset original data to reflect saved state
      setOriginalData({
        name: appName,
        description: appDescription,
        category,
        platforms,
        languages: selectedLanguages,
        appStoreUrl,
        playStoreUrl,
        websiteUrl,
        bundleId,
        keywords,
        ageRating,
        iconUrl: iconPreview
      });
      setHasChanges(false);
      // TODO: Show success toast
    } catch {
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteApp({ appId });
      router.push('/create');
    } catch {
      setIsDeleting(false);
      // TODO: Show error toast
    }
  };

  if (!app) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <PageHeader
            className="px-6"
            backHref={`/app/${appId}`}
            backLabel="Back to app"
            title="Manage App Details"
            subtitle="Configure your app settings and metadata"
            actions={(
              <>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete App
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !appName || !hasChanges}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* App Icon */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">App Icon</h2>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                  {iconPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={iconPreview} alt="App icon" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your app icon. Recommended size: 1024x1024px
                  </p>
                  <label className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors text-sm cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                    Upload Icon
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">App Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter app name"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">App Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Describe your app"
                    rows={4}
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Productivity</option>
                    <option>Social</option>
                    <option>Entertainment</option>
                    <option>Education</option>
                    <option>Lifestyle</option>
                    <option>Health & Fitness</option>
                    <option>Business</option>
                    <option>Games</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Store Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Store Links</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    App Store URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="https://apps.apple.com/..."
                    value={appStoreUrl}
                    onChange={(e) => setAppStoreUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Play Store URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="https://play.google.com/store/apps/..."
                    value={playStoreUrl}
                    onChange={(e) => setPlayStoreUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Platform Settings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Platform Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">iOS</p>
                      <p className="text-xs text-muted-foreground">Apple App Store</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={platforms.ios}
                      onChange={(e) => setPlatforms({ ...platforms, ios: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Android</p>
                      <p className="text-xs text-muted-foreground">Google Play Store</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={platforms.android}
                      onChange={(e) => setPlatforms({ ...platforms, android: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

              </div>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Supported Languages</h2>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese', 'Italian', 'Portuguese'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      if (selectedLanguages.includes(lang)) {
                        setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                      } else {
                        setSelectedLanguages([...selectedLanguages, lang]);
                      }
                    }}
                    className={`px-3 py-1.5 border rounded-lg transition-colors text-sm ${
                      selectedLanguages.includes(lang)
                        ? 'bg-foreground text-background border-foreground'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* App Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="bg-card rounded-xl border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">App Metadata</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Bundle ID / Package Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="com.company.appname"
                    value={bundleId}
                    onChange={(e) => setBundleId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Keywords</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter keywords separated by commas"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Age Rating</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    value={ageRating}
                    onChange={(e) => setAgeRating(e.target.value)}
                  >
                    <option>4+</option>
                    <option>9+</option>
                    <option>12+</option>
                    <option>17+</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border rounded-xl shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Remove {appName} from Mocksy</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-sm mb-6">
                  Are you sure you want to remove <strong>{appName}</strong> from Mocksy?
                  This will permanently delete all screenshots, templates, and settings stored in Mocksy. Your actual app will not be affected.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Removing...' : 'Yes, Remove'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteDialog(false)}
                className="absolute top-3 right-3 p-1 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
