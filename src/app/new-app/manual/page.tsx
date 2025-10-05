'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Upload, Sparkles, NotebookPen, ListChecks } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function ManualNewAppPage() {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('Productivity');
  const [platforms, setPlatforms] = useState({
    ios: true,
    android: true,
  });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const createAppMutation = useMutation(api.apps.createApp);
  const storeFromBase64 = useAction(api.fileStorage.base64Files.storeBase64File);

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

  const handleCreate = async () => {
    if (!appName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let iconStorageId;
      if (iconPreview) {
        iconStorageId = await storeFromBase64({
          base64Data: iconPreview,
          contentType: 'image/png',
        });
      }

      const appId = await createAppMutation({
        name: appName.trim(),
        description: appDescription.trim() || undefined,
        iconStorageId,
        category,
        platforms,
        languages: selectedLanguages,
      });

      router.push(`/app/${appId}`);
    } catch {
      // TODO: surface error toast
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleCreate();
  };

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
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <NotebookPen className="h-3.5 w-3.5 text-primary" />
            Manual setup flow
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Enter your existing app details manually
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Enter the details you already have so Mocksy can organize everything in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex flex-col items-center gap-3 sm:items-start">
                  <div className="text-center text-sm font-medium text-foreground sm:text-left">
                    App icon
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label htmlFor="icon-upload" className="sr-only">
                    App icon
                  </label>
                  <label
                    htmlFor="icon-upload"
                    className="flex h-[128px] w-[128px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border transition-all duration-200 hover:border-muted-foreground/40 hover:bg-muted/40 overflow-hidden"
                    aria-describedby="app-icon-help"
                  >
                    {iconPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={iconPreview} alt="App icon" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Upload icon</p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, or SVG up to 1 MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                  <span id="app-icon-help" className="sr-only">
                    Upload a PNG, JPG, or SVG up to 1 megabyte.
                  </span>
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <label htmlFor="appName" className="text-sm font-medium text-foreground">
                      App name
                    </label>
                    <input
                      type="text"
                      id="appName"
                      value={appName}
                      onChange={(event) => setAppName(event.target.value)}
                      className="mt-2 w-full rounded-xl border bg-background px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/70"
                      placeholder="Enter your app name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="appDescription" className="text-sm font-medium text-foreground">
                      Description
                    </label>
                    <textarea
                      id="appDescription"
                      value={appDescription}
                      onChange={(event) => setAppDescription(event.target.value)}
                      className="mt-2 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/70"
                      placeholder="Summarize the app's key features"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <span className="text-sm font-medium text-foreground">Target platforms</span>
                <p className="mt-1 text-xs text-muted-foreground">Toggle where this app ships today.</p>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                        <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                        </svg>
                      </div>
                      <span className="font-medium">iOS</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={platforms.ios}
                      onChange={(event) => setPlatforms({ ...platforms, ios: event.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                        <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.523 2.102a1.24 1.24 0 0 0-.238-.108 1.426 1.426 0 0 0-.236-.074c-.154-.04-.313-.04-.468-.002-.114.016-.227.049-.332.098l-.006.002L5.9 6.3c-.696.258-1.168.928-1.168 1.705v7.99c0 .777.472 1.447 1.168 1.705l10.343 4.282a1.397 1.397 0 0 0 1.057 0L17.524 22a1.81 1.81 0 0 0 1.168-1.705v-7.99a1.81 1.81 0 0 0-1.168-1.705L7.18 6.318v-.013l10.343-4.282s.002 0 .002-.002l-.002.08z" />
                        </svg>
                      </div>
                      <span className="font-medium">Android</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={platforms.android}
                      onChange={(event) => setPlatforms({ ...platforms, android: event.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <span className="text-sm font-medium text-foreground">Supported languages</span>
                <p className="mt-1 text-xs text-muted-foreground">Select the locales you already maintain.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (selectedLanguages.includes(lang)) {
                          setSelectedLanguages(selectedLanguages.filter((current) => current !== lang));
                        } else {
                          setSelectedLanguages([...selectedLanguages, lang]);
                        }
                      }}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        selectedLanguages.includes(lang)
                          ? 'bg-foreground text-background border-foreground'
                          : 'hover:bg-muted/60'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>

          <div className="flex h-fit flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="rounded-xl border border-dashed bg-background/80 p-4 text-sm text-muted-foreground">
              <ListChecks className="mr-2 inline h-4 w-4 text-primary" />
              Double-check these details before creating the app—everything can still be edited later inside Mocksy.
            </div>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={handleCreate}
              disabled={!appName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving…' : 'Set up your app'}
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/home')}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
