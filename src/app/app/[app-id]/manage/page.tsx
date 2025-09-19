'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Trash2,
  Globe,
  Smartphone,
  Package,
  Link,
  Image as ImageIcon,
  AlertTriangle,
  X,
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

export default function ManageAppPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);

  const handleDelete = () => {
    // Handle delete logic here
    console.log('Deleting app:', appId);
    router.push('/home');
  };

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
          <button
            onClick={() => router.push(`/app/${appId}`)}
            className="mb-4 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage App Details</h1>
              <p className="text-muted-foreground mt-1">Configure your app settings and metadata</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete App
              </button>
              <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
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
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your app icon. Recommended size: 1024x1024px
                  </p>
                  <button className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors text-sm">
                    Upload Icon
                  </button>
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
                    defaultValue={`App ${appId}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">App Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="Describe your app"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors">
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
                    <input type="checkbox" className="sr-only peer" defaultChecked />
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
                    <input type="checkbox" className="sr-only peer" defaultChecked />
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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Keywords</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter keywords separated by commas"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Age Rating</label>
                  <select className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors">
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
                    <h3 className="text-lg font-semibold">Delete App</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-sm mb-6">
                  Are you sure you want to delete <strong>App {appId}</strong>?
                  This will permanently remove all app data, screenshots, and settings.
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
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete App
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