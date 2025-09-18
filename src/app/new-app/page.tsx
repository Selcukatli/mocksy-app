'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Upload,
  Sparkles,
  Check
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useUser } from '@clerk/nextjs';
import FeatureSlides from '@/components/FeatureSlides';

export default function NewAppPage() {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
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

    // Create the app in the store
    const newApp = createApp(appName, appDescription);

    // If icon was uploaded, update the app with the icon
    if (iconPreview) {
      const { updateApp } = useAppStore.getState();
      updateApp(newApp.id, { icon: iconPreview });
    }

    console.log('Created app:', newApp);

    // Navigate to the newly created app page
    router.push(`/app/${newApp.id}`);
  };

  const templates = [
    { id: 1, name: 'Modern', color: 'from-blue-500 to-purple-600' },
    { id: 2, name: 'Classic', color: 'from-green-500 to-teal-600' },
    { id: 3, name: 'Bold', color: 'from-pink-500 to-orange-500' },
  ];

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
                </motion.div>

                {/* Screenshot Templates */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="bg-card rounded-xl border p-6"
                >
                  <label className="block text-sm font-medium mb-4">
                    Screenshot Template
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          selectedTemplate === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/20 hover:bg-muted/30'
                        }`}
                      >
                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                        <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${template.color} mb-2`} />
                        <p className="text-xs font-medium text-center">{template.name}</p>
                      </div>
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