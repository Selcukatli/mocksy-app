'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useState, type MouseEvent, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  TrendingUp,
  Palette,
  Type,
  Smartphone,
  Grid3x3,
  ChevronDown,
  Heart,
  Wand2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function StyleDetailPage() {
  const params = useParams();
  const styleId = params['style-id'] as Id<'styles'>;
  const router = useRouter();
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
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null);

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

  const handleTagClick = (tag: string) => {
    router.push(`/styles?tag=${encodeURIComponent(tag)}`);
  };

  const handleStartWithStyle = () => {
    router.push(`/templates?style=${styleId}`);
  };

  // Fetch style data
  const style = useQuery(api.styles.getStyleById, { styleId });
  const isLoading = style === undefined;

  const designDetails = useMemo(
    () =>
      style
        ? [
            {
              key: 'background',
              label: 'Background',
              description: style.backgroundColor,
              icon: Palette
            },
            {
              key: 'textStyle',
              label: 'Text Style',
              description: style.textStyle,
              icon: Type
            },
            {
              key: 'deviceStyle',
              label: 'Device Treatment',
              description: style.deviceStyle,
              icon: Smartphone
            },
            {
              key: 'details',
              label: 'Style Details',
              description: style.details,
              icon: Sparkles
            }
          ]
        : [],
    [style]
  );

  const screenshotCount = (style as { screenshotCount?: number })?.screenshotCount ?? 0;

  useEffect(() => {
    if (!style) return;
    if (expandedDetail) return;
    if (!designDetails.length) return;
    const firstWithDescription = designDetails.find(({ description }) => description);
    const fallback = firstWithDescription?.key ?? designDetails[0]?.key ?? null;
    if (fallback) {
      setExpandedDetail(fallback);
    }
  }, [style, designDetails, expandedDetail]);

  const createdLabel = useMemo(() => {
    if (!style?.createdAt) {
      return '';
    }

    const createdDate = new Date(style.createdAt);
    const now = new Date();
    const diffMs = createdDate.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const units: Array<{ limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }> = [
      { limit: 60, divisor: 1, unit: 'second' },
      { limit: 3600, divisor: 60, unit: 'minute' },
      { limit: 86400, divisor: 3600, unit: 'hour' },
      { limit: 604800, divisor: 86400, unit: 'day' },
      { limit: 2629800, divisor: 604800, unit: 'week' },
      { limit: 31557600, divisor: 2629800, unit: 'month' }
    ];

    const absDiff = Math.abs(diffSec);
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    for (const { limit, divisor, unit } of units) {
      if (absDiff < limit) {
        const value = Math.round(diffSec / divisor);
        return formatter.format(value, unit);
      }
    }

    const years = Math.round(diffSec / 31557600);
    return formatter.format(years, 'year');
  }, [style?.createdAt]);

  if (!style) {
    return (
      <div className="flex-1 p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="h-9 w-36 animate-pulse rounded-full bg-muted" />
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-primary/60" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="h-32 w-32 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-48 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-56 rounded bg-muted animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                    <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border bg-card p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-dashed border-border/60 p-4">
                  <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 lg:col-span-2">
            <div className="h-6 w-40 rounded bg-muted animate-pulse mb-6" />
            <div className="h-64 rounded-xl border border-dashed bg-muted/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6 border-b border-border/60 pb-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/styles"
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Styles</span>
            </Link>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              {style?.usageCount ?? 0} uses
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Wand2 className="h-4 w-4" />
              Remix Style
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Heart className="h-4 w-4" />
              Favorite Style
            </button>
            <button
              type="button"
              onClick={handleStartWithStyle}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Sparkles className="h-4 w-4" />
              Use this Style
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Style Details */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="bg-card rounded-xl border p-6 space-y-5"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div
                  className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 cursor-zoom-in"
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
                      className="object-cover rounded-[inherit]"
                      style={{ borderRadius: 'inherit' }}
                      sizes="128px"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-9 w-9 text-primary/60" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight">{style.name}</h1>
                  {style.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {style.description}
                    </p>
                  )}
                  {style.tags && style.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {style.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{style.usageCount ?? 0} uses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created {createdLabel}</span>
                </div>
                {style.category && (
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="capitalize">{style.category}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-card rounded-xl border p-6 space-y-5"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Style recipe</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              See the prompts that drove this look and expand each ingredient to understand the vibe.
            </p>
            <div className="space-y-3">
              {designDetails.map(({ key, label, description, icon: Icon }) => {
                const isExpanded = expandedDetail === key;
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-border/60 bg-background/60 transition hover:border-primary/40"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDetail((prev) => (prev === key ? null : key))
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{label}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key={`${key}-content`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 px-4 pb-4 pt-2 text-sm text-muted-foreground">
                            <p>{description || 'Add guidance in the style editor.'}</p>
                            {key === 'deviceStyle' && style.deviceReferenceImageUrl && (
                              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground/90">
                                <p className="mb-3 font-medium text-primary/80">
                                  Reference mock
                                </p>
                                <div className="flex items-center gap-4">
                                  <div
                                    className="flex-shrink-0 cursor-zoom-in"
                                    onMouseEnter={(event) => {
                                      positionHoverPreview(event, 240, 380);
                                      setHoverPreview({
                                        imageUrl: style.deviceReferenceImageUrl as string,
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
                                      className="rounded-md border border-primary/30 shadow-sm"
                                      sizes="80px"
                                    />
                                  </div>
                                  <p className="leading-relaxed">
                                    Hover to inspect the full-resolution frame. Use it as a visual reference when
                                    generating new screenshots or refining this style.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>

        {/* Right Column - Screenshots */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="lg:col-span-2 bg-card rounded-xl border p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Screenshots</h3>
              <span className="text-sm text-muted-foreground">({screenshotCount})</span>
            </div>
            <button
              type="button"
              onClick={handleStartWithStyle}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Sparkles className="w-4 h-4" />
              Start a set
            </button>
          </div>

          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 text-center">
            <Grid3x3 className="w-10 h-10 text-muted-foreground/60 mb-4" />
            <div className="space-y-1">
              <p className="font-medium">No screenshots yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Kick off a new screenshot set to see how {style.name} comes to life across devices.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartWithStyle}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Sparkles className="w-4 h-4" />
              Generate with this style
            </button>
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
