'use client';

import { use, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { motion } from 'framer-motion';
import AppListItem from '@/components/AppListItem';
import { usePageHeader } from '@/components/RootLayoutContent';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const category = decodeURIComponent(resolvedParams.category);
  const { setTitle } = usePageHeader();

  const apps = useQuery(api.apps.getPublicDemoApps, { category });

  useEffect(() => {
    setTitle('AppStore');
  }, [setTitle]);

  // Loading state
  if (apps === undefined) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No apps found
  if (apps.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center">
              <p className="text-muted-foreground">
                No apps found in this category yet.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{category}</h1>
            <p className="text-muted-foreground">
              {apps.length} {apps.length === 1 ? 'app' : 'apps'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
            {apps.map((app, index) => (
              <AppListItem key={app._id} app={app} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
