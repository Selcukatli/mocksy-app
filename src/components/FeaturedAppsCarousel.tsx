'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Id } from '@convex/_generated/dataModel';
import { useDominantColor } from '@/hooks/useDominantColor';

interface FeaturedApp {
  _id: Id<'apps'>;
  name: string;
  description?: string;
  category?: string;
  iconUrl?: string;
  coverImageUrl?: string;
}

interface FeaturedAppsCarouselProps {
  apps: FeaturedApp[];
}

export default function FeaturedAppsCarousel({ apps }: FeaturedAppsCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentApp = apps[currentIndex];
  
  // Get dominant color from cover image, or from icon if no cover
  const { color: dominantColor } = useDominantColor(
    currentApp?.coverImageUrl || currentApp?.iconUrl
  );

  if (apps.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? apps.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === apps.length - 1 ? 0 : prev + 1));
  };

  // Determine layout based on cover image availability
  const hasCoverImage = !!currentApp.coverImageUrl;

  return (
    <div 
      className="relative w-full rounded-3xl border shadow-xl overflow-hidden"
      style={{
        background: dominantColor || 'rgba(0, 0, 0, 0.85)',
      }}
    >
      {/* Background - either cover image or gradient */}
      {hasCoverImage ? (
        <>
          {/* Cover Image with fade to transparent at bottom */}
          <div className="relative w-full h-[280px] md:h-[340px]">
            <motion.div
              key={`${currentApp._id}-cover`}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
              style={{
                maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
              }}
            >
              <Image
                src={currentApp.coverImageUrl!}
                alt={`${currentApp.name} cover`}
                fill
                className="object-cover object-[right_top]"
                sizes="(max-width: 768px) 100vw, 1200px"
                unoptimized
                priority
              />
            </motion.div>
          </div>
          
          {/* App info section on solid color */}
          <div className="relative p-8 md:p-10 -mt-12">
            <div className="flex flex-row items-end gap-6 md:gap-8 w-full">
              {/* App Icon */}
              <motion.div
                key={currentApp._id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-28 w-28 md:h-32 md:w-32 flex-shrink-0 rounded-[28%] overflow-hidden bg-white shadow-2xl ring-2 ring-white/30"
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
                    <span className="text-4xl font-bold text-primary">
                      {currentApp.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* App Info */}
              <motion.div
                key={`${currentApp._id}-info`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 space-y-2 text-left max-w-3xl"
              >
                {/* App Name */}
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {currentApp.name}
                </h2>
                
                {/* Description - single line */}
                {currentApp.description && (
                  <p className="text-base md:text-lg line-clamp-1 text-white/90">
                    {currentApp.description}
                  </p>
                )}

                {/* Actions row */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => router.push(`/appstore/${currentApp._id}`)}
                    className="px-6 py-3 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl bg-white text-black hover:bg-white/90"
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
                            ? 'w-6 bg-white'
                            : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to app ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      ) : (
        /* Default layout when no cover image - use icon color */
        <>
          {/* Gradient background with patterns using icon's dominant color */}
          <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden">
            {/* Base subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
            
            {/* Colorful gradients from icon color */}
            <div 
              className="absolute inset-0"
              style={{
                background: dominantColor
                  ? `radial-gradient(ellipse at 20% 20%, ${dominantColor.replace('0.85', '0.5')}, transparent 65%)`
                  : 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.5), transparent 65%)',
                filter: 'brightness(1.5) saturate(1.3)',
              }}
            />
            <div 
              className="absolute inset-0"
              style={{
                background: dominantColor
                  ? `radial-gradient(ellipse at 80% 70%, ${dominantColor.replace('0.85', '0.35')}, transparent 70%)`
                  : 'radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.35), transparent 70%)',
                filter: 'brightness(1.3) saturate(1.2)',
              }}
            />
            
            {/* Decorative patterns - only in upper area */}
            <div className="absolute inset-0 opacity-10">
              {/* Grid pattern */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                  opacity: 0.15,
                }}
              />
              
              {/* Floating circles - positioned in upper portion only */}
              <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute top-20 left-32 w-24 h-24 rounded-full bg-white/8 blur-xl" />
              <div className="absolute top-1/3 right-1/3 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
            </div>
          </div>
          
          {/* App info section */}
          <div className="relative p-8 md:p-10 -mt-12">
            <div className="flex flex-row items-end gap-6 md:gap-8 w-full">
              {/* App Icon */}
              <motion.div
                key={currentApp._id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-28 w-28 md:h-32 md:w-32 flex-shrink-0 rounded-[28%] overflow-hidden bg-white shadow-2xl ring-2 ring-white/30"
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
                    <span className="text-4xl font-bold text-primary">
                      {currentApp.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* App Info */}
              <motion.div
                key={`${currentApp._id}-info`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex-1 space-y-2 text-left max-w-3xl"
              >
                {/* App Name */}
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {currentApp.name}
                </h2>
                
                {/* Description - single line */}
                {currentApp.description && (
                  <p className="text-base md:text-lg line-clamp-1 text-white/90">
                    {currentApp.description}
                  </p>
                )}

                {/* Actions row */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => router.push(`/appstore/${currentApp._id}`)}
                    className="px-6 py-3 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl bg-white text-black hover:bg-white/90"
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
                            ? 'w-6 bg-white'
                            : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to app ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}

      {/* Navigation Arrows */}
      {apps.length > 1 && (
        <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <button
            onClick={handlePrevious}
            className={`p-2 rounded-full backdrop-blur-sm border shadow-lg hover:scale-110 transition-all ${
              hasCoverImage ? 'bg-white/90 hover:bg-white' : 'bg-background/90 hover:bg-background'
            }`}
            aria-label="Previous app"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className={`p-2 rounded-full backdrop-blur-sm border shadow-lg hover:scale-110 transition-all ${
              hasCoverImage ? 'bg-white/90 hover:bg-white' : 'bg-background/90 hover:bg-background'
            }`}
            aria-label="Next app"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
