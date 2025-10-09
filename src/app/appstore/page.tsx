'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import FeaturedAppsCarousel from '@/components/FeaturedAppsCarousel';
import HorizontalAppCarousel from '@/components/HorizontalAppCarousel';
import AppListItem from '@/components/AppListItem';
import { Search } from 'lucide-react';

export default function AppStorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const featuredApps = useQuery(api.apps.getFeaturedApps, { limit: 5 });
  const categories = useQuery(api.apps.getAppCategories);
  const allApps = useQuery(api.apps.getPublicDemoApps, { limit: 100 });

  const isLoading = featuredApps === undefined || categories === undefined || allApps === undefined;

  // Group apps by category
  const appsByCategory = useMemo(() => {
    if (!allApps || !categories) return {};

    const grouped: Record<string, typeof allApps> = {};
    categories.forEach((category) => {
      grouped[category] = allApps.filter((app) => app.category === category);
    });

    return grouped;
  }, [allApps, categories]);

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
          <div className="w-full h-64 rounded-3xl border bg-muted/20 animate-pulse" />
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
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-48 bg-muted/50 rounded animate-pulse px-2" />
                <div className="flex gap-6">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-[400px] md:w-[500px] flex-shrink-0 space-y-2"
                    >
                      {Array.from({ length: 3 }).map((_, k) => (
                        <div
                          key={k}
                          className="h-20 rounded-xl bg-muted/20 animate-pulse"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category, index) => {
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
