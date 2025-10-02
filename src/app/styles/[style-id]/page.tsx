'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useState, type MouseEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  TrendingUp,
  Palette,
  Type,
  Smartphone,
  Grid3x3
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function StyleDetailPage() {
  const params = useParams();
  const styleId = params['style-id'] as Id<'styles'>;
  const [hoverPreview, setHoverPreview] = useState<{
    imageUrl: string;
    width: number;
    height: number;
    alt: string;
  } | null>(null);
  const [hoverPreviewPosition, setHoverPreviewPosition] = useState({
    x: 0,
    y: 0
  });

  const positionHoverPreview = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    previewWidth: number,
    previewHeight: number
  ) => {
    const spacing = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let nextX = event.clientX + spacing;
    let nextY = event.clientY - previewHeight / 2;

    if (nextX + previewWidth > viewportWidth - spacing) {
      nextX = event.clientX - previewWidth - spacing;
    }

    if (nextY < spacing) {
      nextY = spacing;
    }

    if (nextY + previewHeight > viewportHeight - spacing) {
      nextY = viewportHeight - previewHeight - spacing;
    }

    setHoverPreviewPosition({ x: nextX, y: nextY });
  };

  // Fetch style data
  const style = useQuery(api.styles.getStyleById, { styleId });

  if (!style) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading style...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {/* Back Button */}
        <Link
          href="/styles"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Styles</span>
        </Link>

        {/* Style Header */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="flex items-start gap-6 p-6">
            {/* Style Preview Image */}
            <div
              className="relative w-40 h-40 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 overflow-hidden cursor-zoom-in"
              onMouseEnter={(event) => {
                if (!style.previewImageUrl) return;
                positionHoverPreview(event, 280, 280);
                setHoverPreview({
                  imageUrl: style.previewImageUrl,
                  width: 280,
                  height: 280,
                  alt: `${style.name} preview`
                });
              }}
              onMouseLeave={() => setHoverPreview(null)}
              onMouseMove={(event) => {
                if (!style.previewImageUrl) return;
                positionHoverPreview(event, 280, 280);
              }}
            >
              {style.previewImageUrl ? (
                <Image
                  src={style.previewImageUrl}
                  alt={style.name}
                  fill
                  className="object-cover scale-[1.15]"
                  sizes="160px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary/60" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold mb-3 tracking-tight">{style.name}</h1>
              {style.description && (
                <p className="text-muted-foreground text-lg mb-4">
                  {style.description}
                </p>
              )}

              {/* Tags */}
              {style.tags && style.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {style.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Style Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">{style.usageCount ?? 0} uses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Created {new Date(style.createdAt).toLocaleDateString()}</span>
                </div>
                {style.category && (
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span className="capitalize">{style.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Style Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Background Color */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-card rounded-xl border p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Background</h3>
            </div>
            <p className="text-muted-foreground text-sm">{style.backgroundColor}</p>
          </motion.div>

          {/* Text Style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="bg-card rounded-xl border p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Text Style</h3>
            </div>
            <p className="text-muted-foreground text-sm">{style.textStyle}</p>
          </motion.div>

          {/* Device Style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="bg-card rounded-xl border p-6"
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Device Style</h3>
                </div>
                <p className="text-muted-foreground text-sm">{style.deviceStyle}</p>
              </div>
              {style.deviceReferenceImageUrl && (
                <div
                  className="flex-shrink-0 cursor-zoom-in relative group"
                  onMouseEnter={(event) => {
                    positionHoverPreview(event, 240, 380);
                    setHoverPreview({
                      imageUrl: style.deviceReferenceImageUrl,
                      width: 240,
                      height: 380,
                      alt: 'Device reference preview'
                    });
                  }}
                  onMouseLeave={() => setHoverPreview(null)}
                  onMouseMove={(event) => {
                    positionHoverPreview(event, 240, 380);
                  }}
                >
                  <Image
                    src={style.deviceReferenceImageUrl}
                    alt="Device reference"
                    width={80}
                    height={120}
                    className="rounded-lg transition-opacity group-hover:opacity-80"
                    sizes="80px"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
            className="bg-card rounded-xl border p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Details</h3>
            </div>
            <p className="text-muted-foreground text-sm">{style.details}</p>
          </motion.div>
        </div>

        {/* Right Column - Screenshots */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="lg:col-span-2 bg-card rounded-xl border p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Grid3x3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Screenshots</h3>
            <span className="text-sm text-muted-foreground">(0)</span>
          </div>
          <div className="text-center py-12">
            <Grid3x3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No screenshots yet</p>
            <p className="text-sm text-muted-foreground">
              Screenshots created with this style will appear here
            </p>
          </div>
        </motion.div>
      </div>

      {/* Device Reference Hover Preview */}
      <AnimatePresence>
        {hoverPreview && (
          <motion.div
            key="device-reference-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-50"
            style={{
              top: hoverPreviewPosition.y,
              left: hoverPreviewPosition.x
            }}
          >
            <div className="rounded-xl border bg-background/95 shadow-2xl backdrop-blur-sm overflow-hidden">
              <Image
                src={hoverPreview.imageUrl}
                alt={hoverPreview.alt}
                width={hoverPreview.width}
                height={hoverPreview.height}
                className="object-cover"
                sizes={`${hoverPreview.width}px`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
