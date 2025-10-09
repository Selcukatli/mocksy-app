'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppStorePreviewCard from '@/components/AppStorePreviewCard';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

export default function PublicAppStorePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const appPreview = useQuery(api.apps.getPublicAppPreview, { appId: appId as Id<'apps'> });

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateYourOwn = () => {
    router.push('/create');
  };

  // Loading state
  if (appPreview === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading app preview...</p>
        </div>
      </div>
    );
  }

  // App not found
  if (appPreview === null) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12 px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold">App Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This app doesn&apos;t exist or is no longer available. Try creating your own amazing app!
          </p>
          <button
            type="button"
            onClick={handleCreateYourOwn}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Create Your Own App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 min-w-0">
        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">App Store Preview</h2>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              onClick={handleCreateYourOwn}
              size="sm"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Create Your Own
            </Button>
          </div>
        </motion.div>

        {/* App Store Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AppStorePreviewCard
            app={appPreview.app}
            screens={appPreview.screens}
            totalScreens={appPreview.totalScreens}
            isLoading={false}
          />
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 rounded-xl border bg-card p-6 text-center shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-2">Want to create an app like this?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate beautiful App Store screenshots with AI in minutes
          </p>
          <Button
            onClick={handleCreateYourOwn}
            size="lg"
            className="flex items-center gap-2 mx-auto"
          >
            <Sparkles className="h-5 w-5" />
            Get Started for Free
          </Button>
        </motion.div>
    </div>
  );
}
