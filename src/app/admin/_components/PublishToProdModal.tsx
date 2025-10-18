'use client';

import { motion } from 'framer-motion';
import { X, CloudUpload, Loader2, AlertTriangle } from 'lucide-react';
import { Id } from '@convex/_generated/dataModel';

interface PublishToProdModalProps {
  isOpen: boolean;
  app: {
    _id: Id<'apps'>;
    name: string;
    description?: string;
    iconUrl?: string;
    category?: string;
  } | null;
  screenCount?: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isPublishing: boolean;
}

export default function PublishToProdModal({
  isOpen,
  app,
  screenCount = 0,
  onConfirm,
  onClose,
  isPublishing,
}: PublishToProdModalProps) {
  if (!isOpen || !app) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-xl border shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CloudUpload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Publish to Production</h2>
              <p className="text-sm text-muted-foreground">Confirm app deployment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-600">Production Deployment</p>
              <p className="text-sm text-yellow-600/80 mt-1">
                This will make the app publicly available in production.
              </p>
            </div>
          </div>

          {/* App Preview */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-background flex-shrink-0">
                {app.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={app.iconUrl}
                    alt={app.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                    <span className="text-xl font-bold text-primary">
                      {app.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{app.name}</h3>
                {app.category && (
                  <p className="text-sm text-muted-foreground">{app.category}</p>
                )}
                {app.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {app.description}
                  </p>
                )}
              </div>
            </div>

            {/* Publishing Details */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">App Screens:</span>
                <span className="font-medium">{screenCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-medium">Production</span>
              </div>
            </div>
          </div>

          {/* What will be published */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">What will be published:</p>
            <ul className="space-y-1 ml-4">
              <li>• App metadata and description</li>
              <li>• App icon and cover image</li>
              <li>• {screenCount} app screen{screenCount !== 1 ? 's' : ''}</li>
              <li>• Style guide and settings</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPublishing}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                Publish to Prod
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

