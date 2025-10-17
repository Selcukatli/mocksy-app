'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function LoginDialog({
  isOpen,
  onClose,
  title = 'Login Required',
  message = 'Please sign in to continue with this action.',
}: LoginDialogProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/welcome?mode=sign-in');
  };

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

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border shadow-xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <LogIn className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-muted-foreground">{message}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

