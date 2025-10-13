'use client';

import { X, Check, Palette, Type, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useDominantColor } from '@/hooks/useDominantColor';
import { Button } from '@/components/ui/button';

type StyleColors = {
  primary: string;
  background: string;
  text: string;
  accent: string;
};

type StyleTypography = {
  headlineFont: string;
  headlineSize: string;
  headlineWeight: string;
  bodyFont: string;
  bodySize: string;
  bodyWeight: string;
};

type StyleEffects = {
  cornerRadius: string;
  shadowStyle: string;
  designPhilosophy: string;
};

type AppConcept = {
  app_name: string;
  app_subtitle: string;
  app_description: string;
  app_category?: string; // Optional for backward compatibility
  
  // Structured design system
  colors?: StyleColors;
  typography?: StyleTypography;
  effects?: StyleEffects;
  
  // Legacy text description (fallback)
  style_description: string;
  icon_url?: string;
  cover_url?: string;
};

interface AppConceptDetailModalProps {
  concept: AppConcept;
  isSelected: boolean;
  onSelect: (editedConcept?: Partial<AppConcept>) => void;
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
  font?: string;
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
  
  // Editable fields state
  const [editedName, setEditedName] = useState(concept.app_name);
  const [editedSubtitle, setEditedSubtitle] = useState(concept.app_subtitle);
  const [editedDescription, setEditedDescription] = useState(concept.app_description);
  
  // Extract dominant color from cover image
  const { color: dominantColor, isLight: isLightBackground } = useDominantColor(concept.cover_url);
  
  // Make the color fully opaque for modal (override 0.85 opacity from hook)
  const opaqueColor = dominantColor ? dominantColor.replace(/rgba\(([^)]+),\s*[\d.]+\)/, 'rgba($1, 1)') : undefined;
  
  // Use structured data if available, otherwise parse from text (legacy support)
  const colors = concept.colors 
    ? [
        { hex: concept.colors.primary, label: 'Primary' },
        { hex: concept.colors.background, label: 'Background' },
        { hex: concept.colors.text, label: 'Text' },
        { hex: concept.colors.accent, label: 'Accent' },
      ]
    : parseColors(concept.style_description);
  
  const typography = concept.typography
    ? [
        {
          label: 'Headline',
          size: concept.typography.headlineSize,
          weight: concept.typography.headlineWeight,
          font: concept.typography.headlineFont,
          sample: 'The quick brown fox',
        },
        {
          label: 'Body',
          size: concept.typography.bodySize,
          weight: concept.typography.bodyWeight,
          font: concept.typography.bodyFont,
          sample: 'The quick brown fox jumps over the lazy dog',
        },
      ]
    : parseTypography(concept.style_description).map(t => ({ ...t, font: undefined }));
  
  const effects = concept.effects
    ? { corners: concept.effects.cornerRadius, shadows: concept.effects.shadowStyle }
    : parseDesignEffects(concept.style_description);
  
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
              <div className="absolute inset-0 image-mask-fade">
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
            
            {/* Name + Subtitle (Editable on hover) */}
            <div className="flex-1 min-w-0 pt-2 space-y-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className={`w-full text-3xl md:text-4xl font-bold drop-shadow-lg bg-transparent hover:bg-white/10 focus:bg-white/15 outline-none rounded-lg px-3 py-2 -mx-3 -my-2 transition-all cursor-text ${
                  dominantColor 
                    ? (isLightBackground ? 'text-gray-900 placeholder:text-gray-400' : 'text-white placeholder:text-gray-300')
                    : 'text-foreground'
                }`}
                placeholder="App name"
              />
              <input
                type="text"
                value={editedSubtitle}
                onChange={(e) => setEditedSubtitle(e.target.value)}
                className={`w-full text-base md:text-lg font-medium drop-shadow bg-transparent hover:bg-white/10 focus:bg-white/15 outline-none rounded-lg px-3 py-1.5 -mx-3 -my-1.5 transition-all cursor-text ${
                  dominantColor
                    ? (isLightBackground ? 'text-gray-800 placeholder:text-gray-400' : 'text-gray-100 placeholder:text-gray-300')
                    : 'text-muted-foreground'
                }`}
                placeholder="App subtitle"
                maxLength={30}
              />
            </div>
          </div>
        </div>
        
        {/* Description (Editable on hover) */}
        <div className="p-6">
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={8}
            className={`w-full leading-relaxed resize-none bg-transparent hover:bg-white/5 focus:bg-white/10 outline-none rounded-lg px-4 py-3 transition-all cursor-text ${
              dominantColor 
                ? (isLightBackground ? 'text-gray-900 placeholder:text-gray-500' : 'text-white placeholder:text-gray-400')
                : 'text-foreground placeholder:text-muted-foreground'
            }`}
            placeholder="App description"
          />
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
            
            {/* Color Palette - Full Width */}
            {colors.length > 0 && (
              <div>
                <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                  dominantColor 
                    ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                    : 'text-muted-foreground'
                }`}>
                  <Palette className="h-4 w-4" />
                  Color Palette
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {colors.map((color, index) => (
                    <div key={index} className="flex flex-col items-stretch gap-2">
                      <div
                        className="h-20 w-full rounded-lg shadow-md transition-transform hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-center">
                        <div className={`text-sm font-medium ${
                          dominantColor 
                            ? (isLightBackground ? 'text-gray-900' : 'text-white')
                            : 'text-foreground'
                        }`}>{color.label}</div>
                        <div className={`text-xs font-mono ${
                          dominantColor 
                            ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                            : 'text-muted-foreground'
                        }`}>{color.hex.toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Two Column Layout for Typography and Effects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Typography - Live Preview with actual fonts and colors */}
              {typography.length > 0 && (
                <div>
                  <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                    dominantColor 
                      ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                      : 'text-muted-foreground'
                  }`}>
                    <Type className="h-4 w-4" />
                    Typography
                  </h4>
                  <div className="space-y-4">
                    {typography.map((typo, index) => (
                      <div key={index}>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className={`text-xs font-medium ${
                            dominantColor 
                              ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                              : 'text-muted-foreground'
                          }`}>{typo.label}</span>
                          <span className={`text-xs font-mono ${
                            dominantColor 
                              ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                              : 'text-muted-foreground'
                          }`}>
                            {typo.font && `${typo.font}, `}{typo.size} / {typo.weight}
                          </span>
                        </div>
                        {/* Live Preview Box with actual app colors */}
                        <div 
                          className="rounded-lg p-4 shadow-sm"
                          style={{
                            backgroundColor: concept.colors?.background || '#FFFFFF',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: typo.font || 'inherit',
                              fontSize: typo.size,
                              fontWeight: typo.weight,
                              color: concept.colors?.text || '#000000',
                            }}
                          >
                            {typo.sample}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Design Effects - Live Preview */}
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
                  
                  {/* Visual samples of effects */}
                  <div className="space-y-4">
                    {effects.corners && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium ${
                            dominantColor 
                              ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                              : 'text-muted-foreground'
                          }`}>Corner Radius</span>
                          <span className={`text-xs font-mono ${
                            dominantColor 
                              ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                              : 'text-muted-foreground'
                          }`}>{effects.corners}</span>
                        </div>
                        {/* Sample element with corner radius */}
                        <div 
                          className="h-16 flex items-center justify-center text-sm font-medium"
                          style={{
                            backgroundColor: concept.colors?.primary || '#7EC8B8',
                            color: '#FFFFFF',
                            borderRadius: effects.corners,
                          }}
                        >
                          Sample Button
                        </div>
                      </div>
                    )}
                    
                    {effects.shadows && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium ${
                            dominantColor 
                              ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                              : 'text-muted-foreground'
                          }`}>Shadow Style</span>
                          <span className={`text-xs font-mono ${
                            dominantColor 
                              ? (isLightBackground ? 'text-gray-600' : 'text-gray-300')
                              : 'text-muted-foreground'
                          }`}>{effects.shadows}</span>
                        </div>
                        {/* Sample card with shadow */}
                        <div 
                          className="p-4 flex items-center justify-center text-sm font-medium"
                          style={{
                            backgroundColor: concept.colors?.background || '#FFFFFF',
                            color: concept.colors?.text || '#000000',
                            borderRadius: effects.corners || '12px',
                            boxShadow: effects.shadows,
                          }}
                        >
                          Sample Card
                        </div>
                      </div>
                    )}
                    
                    {/* Design Philosophy */}
                    {concept.effects?.designPhilosophy && (
                      <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed italic ${
                        dominantColor 
                          ? (isLightBackground ? 'bg-gray-50 text-gray-600' : 'bg-gray-800 text-gray-300')
                          : 'bg-muted/30 text-muted-foreground'
                      }`}>
                        {concept.effects.designPhilosophy}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
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
          <div className="absolute inset-0 backdrop-blur-xl mask-fade-top" />
          
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
            onClick={() => onSelect({
              app_name: editedName,
              app_subtitle: editedSubtitle,
              app_description: editedDescription,
            })}
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

