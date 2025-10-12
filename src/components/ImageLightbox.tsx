'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ImageLightboxProps {
  imageUrl: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({
  imageUrl,
  alt,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);

  // Reset scale when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
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

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Content */}
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out"
                >
                  <ZoomOut className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in"
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </button>
                <span className="text-white text-sm ml-2">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Image Container */}
            <div className={`flex-1 p-4 flex items-center justify-center min-h-0 ${scale > 1 ? 'overflow-auto' : 'overflow-hidden'}`}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative flex items-center justify-center"
                style={{
                  transform: `scale(${scale})`,
                  transition: 'transform 0.2s ease-out',
                  transformOrigin: 'center center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={alt}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
                  style={{
                    maxHeight: 'calc(100vh - 200px)',
                    maxWidth: 'calc(100vw - 32px)',
                  }}
                />
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/50 text-center">
              <p className="text-white text-sm">{alt}</p>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

