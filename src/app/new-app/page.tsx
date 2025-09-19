'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Upload,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useUser } from '@clerk/nextjs';
import FeatureSlides from '@/components/FeatureSlides';

export default function NewAppPage() {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('Productivity');
  const [platforms, setPlatforms] = useState({
    ios: true,
    android: true,
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const router = useRouter();
  const { createApp } = useAppStore();
  const { isLoaded, isSignedIn } = useUser();

  // Redirect to welcome page if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/welcome?mode=sign-in&context=new-app');
    }
  }, [isLoaded, isSignedIn, router]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create the app in the store with all the new fields
    const newApp = createApp(appName, appDescription);

    // Update the app with all additional information
    const { updateApp } = useAppStore.getState();
    updateApp(newApp.id, {
      icon: iconPreview || undefined,
      category,
      platforms,
      languages: selectedLanguages,
    });

    console.log('Created app:', newApp);

    // Navigate to the newly created app page
    router.push(`/app/${newApp.id}`);
  };

  // Show loading state while checking authentication
  if (!isLoaded || (isLoaded && !isSignedIn)) {
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
      <div className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8 pb-0"
        >
          <h1 className="text-4xl font-bold">Create New App</h1>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 pt-6 overflow-hidden">
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex flex-col h-full overflow-y-auto"
          >
            <div className="flex-1 space-y-6 pr-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* App Details */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="bg-card rounded-xl border p-6 space-y-4"
                >
                  {/* App Icon and Name */}
                  <div className="flex gap-4">
                    {/* Icon Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">App Icon</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          className="hidden"
                          id="icon-upload"
                        />
                        <label
                          htmlFor="icon-upload"
                          className="w-[60px] h-[60px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/30 hover:bg-muted/30 transition-all duration-200 overflow-hidden"
                        >
                          {iconPreview ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={iconPreview} alt="App icon" className="w-full h-full object-cover" />
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-muted-foreground mb-0.5" />
                              <span className="text-[10px] text-muted-foreground">Upload</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    {/* App Name Input */}
                    <div className="flex-1">
                      <label htmlFor="appName" className="block text-sm font-medium mb-2">
                        App Name
                      </label>
                      <input
                        type="text"
                        id="appName"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full h-[60px] px-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors text-base placeholder:text-muted-foreground/70"
                        placeholder="Enter your app name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="appDescription" className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      id="appDescription"
                      value={appDescription}
                      onChange={(e) => setAppDescription(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors resize-none placeholder:text-muted-foreground/70"
                      placeholder="Describe your app's key features and purpose"
                      rows={4}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
                </motion.div>

                {/* Platform Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <label className="block text-sm font-medium mb-4">
                    Target Platforms
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                          </svg>
                        </div>
                        <span className="font-medium">iOS</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={platforms.ios}
                        onChange={(e) => setPlatforms({ ...platforms, ios: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.523 2.102a1.24 1.24 0 0 0-.238-.108 1.426 1.426 0 0 0-.236-.074c-.154-.04-.313-.04-.468-.002-.114.016-.227.049-.332.098l-.006.002L5.9 6.3c-.696.258-1.168.928-1.168 1.705v7.99c0 .777.472 1.447 1.168 1.705l10.343 4.282a1.397 1.397 0 0 0 1.057 0L17.524 22a1.81 1.81 0 0 0 1.168-1.705v-7.99a1.81 1.81 0 0 0-1.168-1.705L7.18 6.318v-.013l10.343-4.282s.002 0 .002-.002l-.002.08z"/>
                          </svg>
                        </div>
                        <span className="font-medium">Android</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={platforms.android}
                        onChange={(e) => setPlatforms({ ...platforms, android: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>

                  </div>
                </motion.div>

                {/* Languages */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <label className="block text-sm font-medium mb-4">
                    Supported Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese'].map((lang) => (
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
              </form>
            </div>

            {/* Sticky Create Button - at bottom of left column */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="sticky bottom-0 flex gap-4 mt-6 pt-4 pb-2"
            >
              <Button
                onClick={handleSubmit}
                variant="default"
                size="lg"
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create App
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/home')}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Feature Slides */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hidden lg:flex flex-col h-full rounded-xl overflow-hidden border"
          >
            <FeatureSlides
              className="flex-1"
              maskGradient={false}
              interval={6000}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}