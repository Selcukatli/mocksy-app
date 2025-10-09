'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Id } from '@convex/_generated/dataModel';

interface AppCardProps {
  app: {
    _id: Id<'apps'>;
    name: string;
    description?: string;
    category?: string;
    iconUrl?: string;
  };
}

export default function AppCard({ app }: AppCardProps) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => router.push(`/appstore/${app._id}`)}
      className="group relative w-full h-full min-h-[240px] rounded-2xl border bg-card p-6 text-left shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex flex-col h-full space-y-4">
        {/* App Icon */}
        <div className="relative h-20 w-20 flex-shrink-0 rounded-[22%] overflow-hidden bg-muted/15 shadow-md group-hover:shadow-lg transition-shadow">
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
        <div className="flex-1 flex flex-col space-y-2">
          <div className="flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {app.name}
            </h3>
            {app.category && (
              <p className="text-xs text-primary/80 font-medium uppercase tracking-wide mt-1">
                {app.category}
              </p>
            )}
          </div>

          {app.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
              {app.description}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
