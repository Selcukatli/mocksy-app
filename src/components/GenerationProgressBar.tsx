'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface GenerationProgressBarProps {
  message: string;
  progress?: number; // Optional: if provided, shows percentage and determinate progress
  showMocksybot?: boolean; // Default true
}

export default function GenerationProgressBar({
  message,
  progress,
  showMocksybot = true,
}: GenerationProgressBarProps) {
  const [isSafari, setIsSafari] = useState(false);

  // Detect Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua);
    setIsSafari(isSafariBrowser);
  }, []);

  const showPercentage = progress !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
        <div className="flex items-center gap-5 md:gap-6">
          {/* Mocksybot animation - breaks out of container */}
          {showMocksybot && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="flex-shrink-0 relative -my-8 md:-my-12"
            >
              {isSafari ? (
                <Image
                  src="/mocksy-study.gif"
                  alt="Mocksy studying"
                  width={160}
                  height={160}
                  unoptimized
                  className="w-32 h-32 md:w-40 md:h-40"
                />
              ) : (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-32 h-32 md:w-40 md:h-40"
                >
                  <source src="/mocksy-study.webm" type="video/webm" />
                </video>
              )}
            </motion.div>
          )}
          
          {/* Progress content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm md:text-base font-medium text-primary">
                {message}
              </p>
              {showPercentage && (
                <span className="text-xs md:text-sm text-muted-foreground font-mono flex-shrink-0">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              {showPercentage ? (
                /* Determinate progress bar */
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              ) : (
                /* Indeterminate progress bar */
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ width: "50%" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

