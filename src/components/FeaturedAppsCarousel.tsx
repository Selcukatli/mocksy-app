'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Id } from '@convex/_generated/dataModel';

interface FeaturedApp {
  _id: Id<'apps'>;
  name: string;
  description?: string;
  category?: string;
  iconUrl?: string;
}

interface FeaturedAppsCarouselProps {
  apps: FeaturedApp[];
}

export default function FeaturedAppsCarousel({ apps }: FeaturedAppsCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (apps.length === 0) {
    return null;
  }

  const currentApp = apps[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? apps.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === apps.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full rounded-3xl border bg-gradient-to-br from-card to-muted/20 shadow-xl overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50" />

      <div className="relative p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* App Icon - Left Side */}
          <motion.div
            key={currentApp._id}
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-32 w-32 md:h-40 md:w-40 flex-shrink-0 rounded-[28%] overflow-hidden bg-background shadow-2xl"
          >
            {currentApp.iconUrl ? (
              <Image
                src={currentApp.iconUrl}
                alt={`${currentApp.name} icon`}
                fill
                className="object-cover"
                sizes="160px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 to-primary/20">
                <span className="text-5xl font-bold text-primary">
                  {currentApp.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </motion.div>

          {/* App Info - Center */}
          <motion.div
            key={`${currentApp._id}-info`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 space-y-4 text-center md:text-left"
          >
            <div>
              {currentApp.category && (
                <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-2">
                  Featured · {currentApp.category}
                </p>
              )}
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {currentApp.name}
              </h2>
              {currentApp.description && (
                <p className="text-base md:text-lg text-muted-foreground line-clamp-2 max-w-2xl">
                  {currentApp.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <button
                onClick={() => router.push(`/appstore/${currentApp._id}`)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
              >
                View Details
              </button>

              {/* Pagination dots */}
              <div className="flex items-center gap-2">
                {apps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-6 bg-primary'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to app ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        {apps.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg hover:bg-background hover:scale-110 transition-all z-10"
              aria-label="Previous app"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg hover:bg-background hover:scale-110 transition-all z-10"
              aria-label="Next app"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
