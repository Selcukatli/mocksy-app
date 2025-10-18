'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Id } from '@convex/_generated/dataModel';

interface AppListItemProps {
  app: {
    _id: Id<'apps'>;
    name: string;
    description?: string;
    category?: string;
    iconUrl?: string;
  };
  index?: number;
}

export default function AppListItem({ app, index = 0 }: AppListItemProps) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => router.push(`/appstore/${app._id}`)}
      className="group w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/30 dark:hover:bg-muted/10 transition-all text-left"
    >
      {/* App Icon */}
      <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-[22%] overflow-hidden bg-muted/15 dark:bg-muted/5 shadow-md">
        {app.iconUrl ? (
          <Image
            src={app.iconUrl}
            alt={`${app.name} icon`}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
            <span className="text-2xl font-bold text-primary">
              {app.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {app.name}
        </h3>
        {app.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {app.description}
          </p>
        )}
      </div>

      {/* View Button */}
      <div className="flex-shrink-0">
        <div className="px-6 py-2 rounded-full bg-muted/50 dark:bg-muted/20 border dark:border-muted/20 text-sm font-semibold text-primary hover:bg-muted dark:hover:bg-muted/30 transition-colors">
          View
        </div>
      </div>
    </motion.button>
  );
}
