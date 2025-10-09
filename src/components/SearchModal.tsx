'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const allApps = useQuery(api.apps.getPublicDemoApps, { limit: 100 });

  // Filter apps by search query
  const searchResults = useMemo(() => {
    if (!searchQuery || !allApps) return allApps || [];

    const query = searchQuery.toLowerCase();
    return allApps.filter((app) =>
      app.name.toLowerCase().includes(query) ||
      app.description?.toLowerCase().includes(query) ||
      app.category?.toLowerCase().includes(query)
    );
  }, [searchQuery, allApps]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleAppClick = (appId: string) => {
    router.push(`/appstore/${appId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-20 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl border overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="relative border-b">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-14 pr-14 py-5 text-lg bg-transparent focus:outline-none"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {searchResults && searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((app, index) => (
                  <motion.button
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleAppClick(app._id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
                      "hover:bg-muted/50 text-left group"
                    )}
                  >
                    {/* App Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      {app.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {app.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      )}
                    </div>

                    {/* App Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{app.name}</h3>
                      {app.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {app.description}
                        </p>
                      )}
                      {app.category && (
                        <div className="mt-2">
                          <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {app.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-12 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No apps found</p>
                <p className="text-sm mt-2">Try searching for something else</p>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Search the App Store</p>
                <p className="text-sm mt-2">Find apps by name, description, or category</p>
              </div>
            )}
          </div>

          {/* Footer Hint */}
          <div className="border-t px-4 py-3 bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-2 py-1 bg-background rounded border text-xs">ESC</kbd> to close
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
