'use client';

import { Sparkles, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDominantColor } from '@/hooks/useDominantColor';

type AppConcept = {
  app_name: string;
  app_subtitle: string;
  app_description: string;
  app_category?: string; // Optional for backward compatibility
  style_description: string;
  icon_url?: string;
  cover_url?: string;
};

interface AppConceptCardProps {
  concept: AppConcept;
  isSelected: boolean;
  onClick: () => void; // Opens modal to view details
}

export default function AppConceptCard({ concept, isSelected, onClick }: AppConceptCardProps) {
  const [iconLoaded, setIconLoaded] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  
  // Extract dominant color from cover image (used for both header and description)
  const { color: dominantColor, isLight: isLightBackground } = useDominantColor(concept.cover_url);

  // Reset loaded states when URLs change
  useEffect(() => {
    setIconLoaded(false);
    setCoverLoaded(false);
  }, [concept.icon_url, concept.cover_url]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 hover:shadow-xl text-left ${
        isSelected
          ? 'border-primary shadow-lg ring-2 ring-primary/20'
          : 'border-border hover:border-muted-foreground/40'
      }`}
    >
      {/* Cover Image Section */}
      <div
        className={`relative rounded-t-xl overflow-hidden ${dominantColor ? '' : 'bg-muted-foreground/10'}`}
        style={{
          background: dominantColor || undefined,
        }}
      >
        {/* Selection Indicator - Top Right */}
        {isSelected && (
          <div className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Check className="h-5 w-5" />
          </div>
        )}

        {/* Layer 2-3: Cover Image (with gradient mask when loaded) */}
        <div className="relative w-full aspect-[2/1] rounded-t-xl overflow-hidden">
          {concept.cover_url ? (
            <div 
              className="absolute inset-0"
              style={{
                maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={concept.cover_url}
                alt={`${concept.app_name} cover`}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  coverLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setCoverLoaded(true)}
              />
              {!coverLoaded && (
                <div className="absolute inset-0 bg-muted-foreground/15 animate-pulse" />
              )}
            </div>
          ) : (
            /* Cover loading placeholder */
            <div className="absolute inset-0 bg-muted-foreground/15 animate-pulse" />
          )}
        </div>

        {/* Layer 4-5: App Info (always shown, overlaps with negative margin) */}
        <div className="relative p-5 flex items-start gap-4 -mt-12 text-left">
          {/* App Icon - Larger */}
          <div className="relative h-20 w-20 flex-shrink-0 rounded-[18%] overflow-hidden bg-white shadow-xl ring-2 ring-white/20">
            {concept.icon_url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={concept.icon_url}
                  alt={`${concept.app_name} icon`}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    iconLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setIconLoaded(true)}
                />
                {!iconLoaded && (
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
                )}
              </>
            ) : (
              <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            )}
          </div>

          {/* App Name + Subtitle (always shown, left-aligned, adaptive text colors when cover loaded) */}
          <div className="flex-1 min-w-0 text-left">
            <h3 className={`text-2xl md:text-3xl font-bold drop-shadow-lg truncate ${
              dominantColor 
                ? (isLightBackground ? 'text-gray-900' : 'text-white')
                : 'text-foreground'
            }`}>
              {concept.app_name}
            </h3>
            <p className={`text-sm md:text-base font-medium drop-shadow truncate mt-1 ${
              dominantColor
                ? (isLightBackground ? 'text-gray-800' : 'text-white/90')
                : 'text-muted-foreground'
            }`}>
              {concept.app_subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Description Section (with cover image color background when loaded) */}
      <div 
        className={`flex flex-1 flex-col gap-3 p-5 text-left ${dominantColor ? '' : 'bg-muted-foreground/5'}`}
        style={{
          background: dominantColor || undefined,
        }}
      >
        <p className={`line-clamp-3 text-sm leading-relaxed text-left ${
          dominantColor 
            ? (isLightBackground ? 'text-gray-900' : 'text-white/95')
            : 'text-foreground'
        }`}>
          {concept.app_description}
        </p>

        {/* Style Tag */}
        <div className="mt-auto pt-2">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            dominantColor
              ? (isLightBackground 
                  ? 'bg-white/80 border-gray-900/20 text-gray-900' 
                  : 'bg-black/40 border-white/20 text-white')
              : 'bg-background border-border text-foreground'
          }`}>
            <Sparkles className={`h-3 w-3 ${dominantColor ? (isLightBackground ? 'text-gray-900' : 'text-white') : 'text-primary'}`} />
            {getStyleLabel(concept.style_description)}
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      {!isSelected && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-2xl" />
      )}
    </button>
  );
}

/**
 * Extract a short style label from the full style description
 */
function getStyleLabel(styleDescription: string): string {
  // Try to extract the first descriptive phrase (before the first period or "with")
  const firstSentence = styleDescription.split(/[.;]|with /i)[0].trim();
  
  // Common patterns to extract style keywords
  const patterns = [
    /^(.*?) (interface|palette|design|aesthetic)/i,
    /^(.*?) and /i,
    /^([A-Z][a-z]+\s[a-z]+)/,
  ];

  for (const pattern of patterns) {
    const match = firstSentence.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback: take first 3-4 words
  const words = firstSentence.split(' ').slice(0, 4);
  if (words.length > 3) {
    return words.slice(0, 3).join(' ') + '...';
  }
  return words.join(' ') || 'Custom Style';
}

