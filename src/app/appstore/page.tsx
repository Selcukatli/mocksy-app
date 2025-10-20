'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import FeaturedAppsCarousel from '@/components/FeaturedAppsCarousel';
import HorizontalAppCarousel from '@/components/HorizontalAppCarousel';
import AppListItem from '@/components/AppListItem';
import { Search } from 'lucide-react';

export default function AppStorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [minLoadTime, setMinLoadTime] = useState(true);
  const router = useRouter();

  const featuredApps = useQuery(api.data.apps.getFeaturedApps, { limit: 5 });
  const categories = useQuery(api.data.apps.getAppCategories);
  const allApps = useQuery(api.data.apps.getPublicDemoApps, { limit: 100 });

  // Force minimum loading time so skeleton is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTime(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = featuredApps === undefined || categories === undefined || allApps === undefined || minLoadTime;

  // Group apps by category
  const appsByCategory = useMemo(() => {
    if (!allApps || !categories) return {};

    const grouped: Record<string, typeof allApps> = {};
    categories.forEach((category) => {
      grouped[category] = allApps.filter((app) => app.category === category);
    });

    return grouped;
  }, [allApps, categories]);

  // Sort categories to display Games first
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    
    return [...categories].sort((a, b) => {
      if (a === 'Games') return -1;
      if (b === 'Games') return 1;
      return 0;
    });
  }, [categories]);

  // Filter apps by search query
  const searchResults = useMemo(() => {
    if (!searchQuery || !allApps) return null;

    const query = searchQuery.toLowerCase();
    return allApps.filter((app) =>
      app.name.toLowerCase().includes(query) ||
      app.description?.toLowerCase().includes(query) ||
      app.category?.toLowerCase().includes(query)
    );
  }, [searchQuery, allApps]);

  // Show search results if searching
  if (searchQuery && searchResults) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </motion.div>

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Search Results</h2>
              <p className="text-sm text-muted-foreground">
                {searchResults.length} {searchResults.length === 1 ? 'app' : 'apps'}
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="max-w-3xl space-y-1">
                {searchResults.map((app, index) => (
                  <AppListItem key={app._id} app={app} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center">
                <p className="text-muted-foreground">
                  No apps found matching &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default browse view with carousels
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Featured Apps Carousel */}
        {isLoading ? (
          // Skeleton while loading - matches actual carousel height
          <div className="w-full h-[450px] md:h-[550px] rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-900/40 animate-pulse">
            <div className="w-full h-full flex items-end p-8 md:p-12">
              <div className="space-y-4 w-full max-w-2xl">
                <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-800/60 rounded-lg" />
                <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-800/60 rounded-lg" />
                <div className="flex gap-2 mt-6">
                  <div className="h-10 w-32 bg-gray-300 dark:bg-gray-800/60 rounded-full" />
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-800/60 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : featuredApps && featuredApps.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FeaturedAppsCarousel apps={featuredApps} />
          </motion.div>
        ) : null}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </motion.div>

        {/* Category Carousels */}
        {isLoading ? (
          // Skeleton while loading
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="h-7 w-32 bg-gray-200 dark:bg-gray-900/40 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-900/40 rounded animate-pulse" />
                </div>
                {/* Carousel Items */}
                <div className="flex gap-6 overflow-hidden">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-[400px] md:w-[500px] flex-shrink-0 space-y-1"
                    >
                      {Array.from({ length: 3 }).map((_, k) => (
                        <div
                          key={k}
                          className="w-full flex items-center gap-4 p-4 rounded-xl animate-pulse"
                        >
                          {/* Icon */}
                          <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-[22%] bg-gray-200 dark:bg-gray-900/40" />
                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-900/40 rounded" />
                            <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800/40 rounded" />
                          </div>
                          {/* Button */}
                          <div className="flex-shrink-0">
                            <div className="h-9 w-20 rounded-full bg-gray-200 dark:bg-gray-900/40" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : sortedCategories && sortedCategories.length > 0 ? (
          <div className="space-y-8">
            {sortedCategories.map((category, index) => {
              const categoryApps = appsByCategory[category] || [];
              if (categoryApps.length === 0) return null;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <HorizontalAppCarousel
                    title={category}
                    apps={categoryApps}
                    onSeeAll={() => router.push(`/appstore/category/${encodeURIComponent(category)}`)}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center">
            <p className="text-muted-foreground">No apps available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
