'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';

interface AppScreenPreviewProps {
  appId: Id<'apps'>;
  screenId: Id<'appScreens'>;
}

const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
};

export default function AppScreenPreview({ appId, screenId }: AppScreenPreviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const appScreensQuery = useQuery(api.appScreens.getAppScreens, { appId });
  const appScreens = appScreensQuery ?? [];

  const [currentId, setCurrentId] = useState(screenId);

  useEffect(() => {
    setCurrentId(screenId);
  }, [screenId]);

  const searchTerm = searchParams.get('search')?.toLowerCase() ?? '';
  const sortParam = searchParams.get('sort') === 'name' ? 'name' : 'date';
  const returnToParam = searchParams.get('returnTo');

  const filteredImages = useMemo(() => {
    if (!searchTerm) return appScreens;
    return appScreens.filter((img) => img.name.toLowerCase().includes(searchTerm));
  }, [appScreens, searchTerm]);

  const sortedImages = useMemo(() => {
    const sorted = [...filteredImages].sort((a, b) => {
      if (sortParam === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.createdAt - a.createdAt;
    });
    return sorted;
  }, [filteredImages, sortParam]);

  const currentIndex = useMemo(
    () => sortedImages.findIndex((img) => img._id === currentId),
    [sortedImages, currentId],
  );

  const activeScreen = currentIndex >= 0 ? sortedImages[currentIndex] : null;

  const buildBasePath = useCallback(() => `/app/${appId}/app-screens`, [appId]);

  const buildUrlForId = useCallback(
    (id: Id<'appScreens'>) => {
      const params = new URLSearchParams(searchParams.toString());
      const basePath = `/app/${appId}/app-screens/preview/${id}`;
      return params.toString() ? `${basePath}?${params.toString()}` : basePath;
    },
    [appId, searchParams],
  );

  const closePreview = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const returnTo = returnToParam || buildBasePath();
    params.delete('returnTo');

    const queryString = params.toString();
    const url = queryString ? `${returnTo}?${queryString}` : returnTo;

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(url, { scroll: false });
  }, [buildBasePath, returnToParam, router, searchParams]);

  const goToImageAtIndex = useCallback(
    (index: number) => {
      const next = sortedImages[index];
      if (!next) return;
      setCurrentId(next._id as Id<'appScreens'>);
    },
    [sortedImages],
  );

  const goToPreviousImage = useCallback(() => {
    if (currentIndex > 0) {
      goToImageAtIndex(currentIndex - 1);
    }
  }, [currentIndex, goToImageAtIndex]);

  const goToNextImage = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < sortedImages.length - 1) {
      goToImageAtIndex(currentIndex + 1);
    }
  }, [currentIndex, goToImageAtIndex, sortedImages.length]);

  useEffect(() => {
    if (!activeScreen && sortedImages.length > 0) {
      closePreview();
    }
  }, [activeScreen, closePreview, sortedImages.length]);

  useEffect(() => {
    if (!currentId) return;
    const url = buildUrlForId(currentId);
    window.history.replaceState(null, '', url);
  }, [buildUrlForId, currentId]);

  useEffect(() => {
    if (!activeScreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextImage();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, closePreview, goToNextImage, goToPreviousImage]);

  if (!activeScreen) {
    return null;
  }

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < sortedImages.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onClick={closePreview}
    >
      <div className="flex flex-1 flex-col pointer-events-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pointer-events-auto">
          <span className="h-10 w-10" aria-hidden="true" />
          <div className="flex-1 text-center text-white">
            <h3 className="text-lg font-medium">{activeScreen.name}</h3>
            <p className="text-white/70 text-sm">
              {activeScreen.dimensions.width} × {activeScreen.dimensions.height} • {formatFileSize(activeScreen.size)}
            </p>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              closePreview();
            }}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Main Image */}
        <div
          className="flex-1 flex items-center justify-center px-4 py-2 min-h-0 pointer-events-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative flex items-center gap-4 max-w-full h-full">
            {/* Previous Button */}
            <button
              onClick={goToPreviousImage}
              className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all ${
                !canGoPrevious ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            {activeScreen.screenUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeScreen.screenUrl}
                alt={activeScreen.name}
                className="max-w-[calc(100vw-160px)] max-h-[calc(100vh-220px)] object-contain rounded-lg"
              />
            ) : (
              <div className="w-96 h-[calc(100vh-220px)] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={goToNextImage}
              className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all ${
                !canGoNext ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canGoNext}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="bg-black/50 p-3 pointer-events-auto" onClick={(event) => event.stopPropagation()}>
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto max-w-full px-2">
              {sortedImages.map((image) => (
                <button
                  key={image._id}
                  onClick={() => setCurrentId(image._id as Id<'appScreens'>)}
                  className={`flex-shrink-0 relative rounded overflow-hidden transition-all duration-200 ${
                    image._id === activeScreen._id
                      ? 'opacity-100 border-2 border-white'
                      : 'opacity-50 hover:opacity-80 border-2 border-transparent'
                  }`}
                >
                  {image.screenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.screenUrl}
                      alt={image.name}
                      className="w-14 h-24 object-cover"
                    />
                  ) : (
                    <div className="w-14 h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
