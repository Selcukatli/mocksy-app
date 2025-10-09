'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import AppListItem from '@/components/AppListItem';
import { Id } from '@convex/_generated/dataModel';

interface App {
  _id: Id<'apps'>;
  name: string;
  description?: string;
  category?: string;
  iconUrl?: string;
}

interface HorizontalAppCarouselProps {
  title: string;
  apps: App[];
  onSeeAll?: () => void;
}

export default function HorizontalAppCarousel({
  title,
  apps,
  onSeeAll,
}: HorizontalAppCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      return () => scrollElement.removeEventListener('scroll', checkScroll);
    }
  }, [apps]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (apps.length === 0) return null;

  // Show max 3 apps per row
  const displayedApps = apps.slice(0, 9);
  const useSimpleLayout = apps.length <= 6;

  // Calculate ghost slots for simple layout (for 3-column XL layout)
  const getGhostSlotsXL = () => {
    if (!useSimpleLayout) return 0;
    const cols = 3;
    const remainder = displayedApps.length % cols;
    return remainder === 0 ? 0 : cols - remainder;
  };

  // Calculate ghost slots for 2-column LG layout
  const getGhostSlotsLG = () => {
    if (!useSimpleLayout) return 0;
    const cols = 2;
    const remainder = displayedApps.length % cols;
    return remainder === 0 ? 0 : cols - remainder;
  };

  const ghostSlotsXL = getGhostSlotsXL();
  const ghostSlotsLG = getGhostSlotsLG();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        {apps.length > 9 && (
          <button
            onClick={onSeeAll}
            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            See All
          </button>
        )}
      </div>

      {/* Simple layout for <= 6 apps */}
      {useSimpleLayout ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
          {displayedApps.map((app, index) => (
            <AppListItem key={app._id} app={app} index={index} />
          ))}
          {/* Ghost slots for LG (2 columns) */}
          {Array.from({ length: ghostSlotsLG }).map((_, index) => (
            <div
              key={`ghost-lg-${index}`}
              className="hidden lg:block xl:hidden pointer-events-none"
            >
              <div className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/20">
                <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-[22%] bg-muted-foreground/8" />
                <div className="flex-1 min-w-0 space-y-2 mr-2">
                  <div className="h-5 w-32 max-w-full bg-muted-foreground/12 rounded" />
                  <div className="h-4 w-48 max-w-full bg-muted-foreground/6 rounded" />
                </div>
                <div className="flex-shrink-0">
                  <div className="h-9 w-20 rounded-full bg-muted-foreground/8" />
                </div>
              </div>
            </div>
          ))}
          {/* Ghost slots for XL (3 columns) */}
          {Array.from({ length: ghostSlotsXL }).map((_, index) => (
            <div
              key={`ghost-xl-${index}`}
              className="hidden xl:block pointer-events-none"
            >
              <div className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/20">
                <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-[22%] bg-muted-foreground/8" />
                <div className="flex-1 min-w-0 space-y-2 mr-2">
                  <div className="h-5 w-32 max-w-full bg-muted-foreground/12 rounded" />
                  <div className="h-4 w-48 max-w-full bg-muted-foreground/6 rounded" />
                </div>
                <div className="flex-shrink-0">
                  <div className="h-9 w-20 rounded-full bg-muted-foreground/8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Horizontal Scrollable List for > 6 apps */
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg hover:bg-background hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg hover:bg-background hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
          >
            <div className="flex gap-6">
              {/* Column 1 */}
              <div className="flex-shrink-0 w-[400px] md:w-[500px] space-y-1">
                {displayedApps.slice(0, 3).map((app, index) => (
                  <AppListItem key={app._id} app={app} index={index} />
                ))}
              </div>

              {/* Column 2 */}
              {displayedApps.length > 3 && (
                <div className="flex-shrink-0 w-[400px] md:w-[500px] space-y-1">
                  {displayedApps.slice(3, 6).map((app, index) => (
                    <AppListItem key={app._id} app={app} index={index} />
                  ))}
                </div>
              )}

              {/* Column 3 */}
              {displayedApps.length > 6 && (
                <div className="flex-shrink-0 w-[400px] md:w-[500px] space-y-1">
                  {displayedApps.slice(6, 9).map((app, index) => (
                    <AppListItem key={app._id} app={app} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
