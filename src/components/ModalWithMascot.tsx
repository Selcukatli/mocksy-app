'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { ReactNode } from 'react';

interface ModalWithMascotProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  mascotSrc?: string;
  showCloseButton?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function ModalWithMascot({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  mascotSrc = '/mocksy-buzzed.gif',
  showCloseButton = true,
}: ModalWithMascotProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`bg-card rounded-2xl shadow-xl w-full ${maxWidthClasses[maxWidth]} overflow-hidden relative my-8`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Header with Mocksy Robot and Speech Bubble */}
              {title && (
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3">
                    {/* Mocksy Robot - Left */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                      className="flex-shrink-0"
                    >
                      <Image
                        src={mascotSrc}
                        alt="Mocksy"
                        width={64}
                        height={64}
                        unoptimized
                        className="w-16 h-16 object-contain"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                    </motion.div>

                    {/* Speech Bubble with Title */}
                    <div className="relative">
                      {/* Speech bubble */}
                      <div className="relative bg-muted text-foreground px-6 py-3 rounded-xl shadow-lg border border-border">
                        <h2 className="text-lg font-semibold whitespace-nowrap">{title}</h2>
                      </div>
                      {/* Speech bubble tail - pointing left from bottom-left side */}
                      <div
                        className="absolute left-0 bottom-2 -translate-x-[11px] z-10"
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: '10px solid transparent',
                          borderBottom: '10px solid transparent',
                          borderRight: '12px solid hsl(var(--muted))',
                        }}
                      />
                      {/* Speech bubble tail border */}
                      <div
                        className="absolute left-0 bottom-2 -translate-x-[13px]"
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: '11px solid transparent',
                          borderBottom: '11px solid transparent',
                          borderRight: '14px solid hsl(var(--border))',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className={title ? 'px-6 pb-6' : 'p-6'}>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

