'use client';

import { X, Check, Palette, Type, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useDominantColor } from '@/hooks/useDominantColor';
import { Button } from '@/components/ui/button';

type AppConcept = {
  app_name: string;
  app_subtitle: string;
  app_description: string;
  app_category?: string; // Optional for backward compatibility
  style_description: string;
  icon_url?: string;
  cover_url?: string;
};

interface AppConceptDetailModalProps {
  concept: AppConcept;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

interface ColorSwatch {
  hex: string;
  label: string;
}

interface TypographyStyle {
  label: string;
  size: string;
  weight: string;
  sample: string;
}

/**
 * Parse hex color codes from style description
 */
function parseColors(styleDescription: string): ColorSwatch[] {
  const colors: ColorSwatch[] = [];
  const hexPattern = /#[0-9A-Fa-f]{6}/g;
  const matches = styleDescription.match(hexPattern);
  
  if (!matches) return colors;
  
  // Try to extract labels for colors
  const lines = styleDescription.split(/[.,;]/);
  
  matches.forEach((hex, index) => {
    // Find which part of the description contains this hex
    const containingLine = lines.find(line => line.includes(hex));
    let label = `Color ${index + 1}`;
    
    if (containingLine) {
      // Try to extract label (e.g., "Primary: #7EC8B8" -> "Primary")
      const labelMatch = containingLine.match(/(\w+):\s*#[0-9A-Fa-f]{6}/);
      if (labelMatch) {
        label = labelMatch[1];
      } else if (containingLine.toLowerCase().includes('primary')) {
        label = 'Primary';
      } else if (containingLine.toLowerCase().includes('background')) {
        label = 'Background';
      } else if (containingLine.toLowerCase().includes('text')) {
        label = 'Text';
      } else if (containingLine.toLowerCase().includes('accent') || containingLine.toLowerCase().includes('secondary')) {
        label = 'Accent';
      }
    }
    
    colors.push({ hex, label });
  });
  
  return colors;
}

/**
 * Parse typography information from style description
 */
function parseTypography(styleDescription: string): TypographyStyle[] {
  const styles: TypographyStyle[] = [];
  
  // Look for headline/title patterns
  const headlineMatch = styleDescription.match(/headlines?\s*:?\s*(\d+)px[\/\s]+(\d+)\s*weight/i);
  if (headlineMatch) {
    styles.push({
      label: 'Headline',
      size: `${headlineMatch[1]}px`,
      weight: headlineMatch[2],
      sample: 'The quick brown fox',
    });
  }
  
  // Look for body text patterns
  const bodyMatch = styleDescription.match(/body\s*(?:text)?\s*:?\s*(\d+)px[\/\s]+(\d+)\s*weight/i);
  if (bodyMatch) {
    styles.push({
      label: 'Body',
      size: `${bodyMatch[1]}px`,
      weight: bodyMatch[2],
      sample: 'The quick brown fox jumps over the lazy dog',
    });
  }
  
  return styles;
}

/**
 * Parse design effects (corner radius, shadows) from style description
 */
function parseDesignEffects(styleDescription: string): { corners?: string; shadows?: string } {
  const effects: { corners?: string; shadows?: string } = {};
  
  // Look for corner radius
  const cornerMatch = styleDescription.match(/(?:corner|radius)\s*:?\s*(\d+)px/i);
  if (cornerMatch) {
    effects.corners = `${cornerMatch[1]}px`;
  }
  
  // Look for shadow
  const shadowMatch = styleDescription.match(/shadows?\s*:?\s*([^.]+)/i);
  if (shadowMatch) {
    effects.shadows = shadowMatch[1].trim();
  }
  
  return effects;
}

export default function AppConceptDetailModal({
  concept,
  isSelected,
  onSelect,
  onClose,
}: AppConceptDetailModalProps) {
  const [iconLoaded, setIconLoaded] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  
  // Extract dominant color from cover image
  const { color: dominantColor, isLight: isLightBackground } = useDominantColor(concept.cover_url);
  
  // Make the color fully opaque for modal (override 0.85 opacity from hook)
  const opaqueColor = dominantColor ? dominantColor.replace(/rgba\(([^)]+),\s*[\d.]+\)/, 'rgba($1, 1)') : undefined;
  
  // Parse style guide
  const colors = parseColors(concept.style_description);
  const typography = parseTypography(concept.style_description);
  const effects = parseDesignEffects(concept.style_description);
  
  // Reset loaded states when URLs change
  useEffect(() => {
    setIconLoaded(false);
    setCoverLoaded(false);
  }, [concept.icon_url, concept.cover_url]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
        style={{
          background: opaqueColor || undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Cover Image Section with overlaid info */}
        <div className="relative overflow-hidden">
          {/* Cover Image */}
          <div className="relative w-full aspect-[2/1]">
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
              </div>
            ) : null}
          </div>
          
          {/* App Icon + Name + Subtitle (overlaid) */}
          <div className="relative px-6 pb-6 flex items-start gap-4 -mt-16">
            {/* App Icon */}
            <div className="relative h-24 w-24 flex-shrink-0 rounded-[18%] overflow-hidden bg-white shadow-2xl ring-4 ring-white/30">
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
            
            {/* Name + Subtitle */}
            <div className="flex-1 min-w-0 pt-2">
              <h2 className={`text-3xl md:text-4xl font-bold drop-shadow-lg ${
                dominantColor 
                  ? (isLightBackground ? 'text-gray-900' : 'text-white')
                  : 'text-foreground'
              }`}>
                {concept.app_name}
              </h2>
              <p className={`text-base md:text-lg font-medium drop-shadow mt-1 ${
                dominantColor
                  ? (isLightBackground ? 'text-gray-800' : 'text-gray-100')
                  : 'text-muted-foreground'
              }`}>
                {concept.app_subtitle}
              </p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="p-6">
          <p className={`leading-relaxed ${
            dominantColor 
              ? (isLightBackground ? 'text-gray-900' : 'text-white')
              : 'text-foreground'
          }`}>
            {concept.app_description}
          </p>
        </div>
        
        {/* Design System Section - Card */}
        <div className="p-6">
          <div className={`rounded-xl p-6 space-y-6 ${
            dominantColor 
              ? (isLightBackground ? 'bg-white shadow-lg' : 'bg-gray-900 shadow-lg')
              : 'bg-card border'
          }`}>
            <h3 className={`text-lg font-semibold ${
              dominantColor 
                ? (isLightBackground ? 'text-gray-900' : 'text-white')
                : 'text-foreground'
            }`}>Design System</h3>
            
            {/* Color Palette */}
            {colors.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                  dominantColor 
                    ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                    : 'text-muted-foreground'
                }`}>
                  <Palette className="h-4 w-4" />
                  Color Palette
                </h4>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div
                        className="h-12 w-12 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-center">
                        <div className={`text-xs font-medium ${
                          dominantColor 
                            ? (isLightBackground ? 'text-gray-900' : 'text-white')
                            : 'text-foreground'
                        }`}>{color.label}</div>
                        <div className={`text-xs font-mono ${
                          dominantColor 
                            ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                            : 'text-muted-foreground'
                        }`}>{color.hex}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Typography */}
            {typography.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                  dominantColor 
                    ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                    : 'text-muted-foreground'
                }`}>
                  <Type className="h-4 w-4" />
                  Typography
                </h4>
                <div className="space-y-3">
                  {typography.map((typo, index) => (
                    <div key={index} className={`rounded-lg border p-3 ${
                      dominantColor 
                        ? (isLightBackground ? 'bg-gray-50 border-gray-900/20' : 'bg-gray-800 border-white/20')
                        : 'bg-muted/30 border-border'
                    }`}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          dominantColor 
                            ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                            : 'text-muted-foreground'
                        }`}>{typo.label}</span>
                        <span className={`text-xs ${
                          dominantColor 
                            ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                            : 'text-muted-foreground'
                        }`}>{typo.size} / {typo.weight}</span>
                      </div>
                      <div
                        className={dominantColor 
                          ? (isLightBackground ? 'text-gray-900' : 'text-white')
                          : 'text-foreground'
                        }
                        style={{
                          fontSize: typo.size,
                          fontWeight: typo.weight,
                        }}
                      >
                        {typo.sample}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Design Effects */}
            {(effects.corners || effects.shadows) && (
              <div>
                <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                  dominantColor 
                    ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                    : 'text-muted-foreground'
                }`}>
                  <Box className="h-4 w-4" />
                  Design Effects
                </h4>
                <div className="space-y-2 text-sm">
                  {effects.corners && (
                    <div className="flex items-center justify-between">
                      <span className={dominantColor 
                        ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                        : 'text-muted-foreground'
                      }>Corner Radius:</span>
                      <span className={`font-mono ${
                        dominantColor 
                          ? (isLightBackground ? 'text-gray-900' : 'text-white')
                          : 'text-foreground'
                      }`}>{effects.corners}</span>
                    </div>
                  )}
                  {effects.shadows && (
                    <div className="flex items-start justify-between gap-4">
                      <span className={dominantColor 
                        ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                        : 'text-muted-foreground'
                      }>Shadows:</span>
                      <span className={`font-mono text-right flex-1 ${
                        dominantColor 
                          ? (isLightBackground ? 'text-gray-900' : 'text-white')
                          : 'text-foreground'
                      }`}>{effects.shadows}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Full Style Description */}
            <div className={`mt-4 rounded-lg p-4 ${
              dominantColor 
                ? (isLightBackground ? 'bg-gray-50 border border-gray-900/20' : 'bg-gray-800 border border-white/20')
                : 'bg-muted/30'
            }`}>
              <p className={`text-xs leading-relaxed ${
                dominantColor 
                  ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                  : 'text-muted-foreground'
              }`}>
                {concept.style_description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer with Select Button - with gradient fade and gradient blur */}
        <div 
          className={`sticky bottom-0 ${
            dominantColor 
              ? ''
              : 'bg-card'
          }`}
        >
          {/* Blur layer with gradient mask */}
          <div 
            className="absolute inset-0 backdrop-blur-xl"
            style={{
              maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            }}
          />
          
          {/* Color gradient layer */}
          <div 
            className="relative p-6"
            style={{
              background: opaqueColor 
                ? `linear-gradient(to top, ${opaqueColor} 0%, transparent 100%)`
                : undefined,
            }}
          >
          <Button
            onClick={onSelect}
            size="lg"
            className="w-full"
            disabled={isSelected}
          >
            {isSelected ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Selected
              </>
            ) : (
              <>
                Select this concept
              </>
            )}
          </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

