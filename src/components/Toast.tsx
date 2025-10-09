'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'success',
  isOpen,
  onClose,
  duration = 3000
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const icons = {
    success: <Check className="w-5 h-5 text-green-600 dark:text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  };

  const backgrounds = {
    success: 'bg-card border-border',
    error: 'bg-card border-border',
    info: 'bg-card border-border',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${backgrounds[type]} backdrop-blur-sm`}
        >
          {icons[type]}
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}