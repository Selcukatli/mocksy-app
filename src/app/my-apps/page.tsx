'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Plus, ArrowLeft, ArrowRight, Sparkles, PenSquare, Clock } from 'lucide-react';

export default function MyAppsPage() {
  const { isSignedIn } = useUser();
  const apps = useQuery(api.apps.getApps) || [];

  const getAppIcon = (app: (typeof apps)[number]) => {
    if (!app) return null;
    if (app.iconUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover rounded-xl" />
      );
    }
    return (
      <span className="text-xl font-bold text-primary">
        {app.name.charAt(0).toUpperCase()}
      </span>
    );
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  if (!isSignedIn) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-2">Sign in to manage your apps</h1>
          <p className="text-muted-foreground">
            You need to be signed in to view and manage your app library.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold"
          >
            My Apps
          </motion.h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/new-app/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/new-app/setup-existing-app"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
          >
            <PenSquare className="h-4 w-4" />
            Set Up Existing App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {apps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-dashed bg-card/60 p-10 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No apps yet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start by creating your first app to organize screenshot sets for your launches.
          </p>
          <Link
            href="/new-app"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Create your first app
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {apps.map((app) => (
            <Link key={app._id} href={`/app/${app._id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="h-full rounded-xl border bg-card p-4 shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    {getAppIcon(app)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{app.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {app.description || 'No description'}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {getRelativeTime(new Date(app.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
