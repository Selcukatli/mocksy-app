'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Sparkles, PenSquare, ArrowRight, Wand2, Layers, ListChecks } from 'lucide-react';

const options = [
  {
    title: 'Generate with AI',
    description: 'Share a few details and let Mocksy draft the app profile, visuals, and copy for you.',
    href: '/generate',
    icon: Wand2,
    accent: 'from-purple-500/80 via-purple-500/50 to-indigo-500/80',
    pill: 'Fastest',
    callout: {
      icon: Sparkles,
      text: "We'll suggest a name, description, and language defaults you can tweak before publishing.",
    },
  },
  {
    title: 'Set Up Existing App',
    description: 'Already have the details? Capture your existing app metadata manually at your own pace.',
    href: '/new-app/setup-existing-app',
    icon: PenSquare,
    accent: 'from-primary/70 via-primary/40 to-primary/70',
    pill: 'Most control',
    callout: {
      icon: ListChecks,
      text: 'Work through a clear manual checklist and add assets you already have—Mocksy keeps everything organized.',
    },
  },
];

export default function NewAppEntryPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/welcome?mode=sign-in&context=new-app');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || (isLoaded && !isSignedIn)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            App workspace setup
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            How would you like to create your app?
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            You can let Mocksy generate the basics from a short brief, or build every detail yourself. Pick the workflow that matches how you work.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {options.map((option, index) => {
            const Icon = option.icon;
            const CalloutIcon = option.callout?.icon;
            return (
              <motion.div
                key={option.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 * index }}
                className="group h-full"
              >
                <Link
                  href={option.href}
                  className="relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute inset-0 -z-10 rounded-2xl opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-75 bg-gradient-to-br ${option.accent}`} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{option.title}</h2>
                        <p className="text-xs uppercase text-muted-foreground tracking-wide">{option.pill}</p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="h-9 w-9 rounded-full border bg-background/80 flex items-center justify-center"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                  {option.callout && CalloutIcon && (
                    <div className="mt-6 rounded-lg border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
                      <CalloutIcon className="mr-2 inline h-4 w-4 text-primary" />
                      {option.callout.text}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="mt-12 flex flex-col gap-3 rounded-2xl border bg-card p-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="font-medium text-foreground">Need to migrate an existing catalog?</p>
            <p>Import spreadsheets or existing metadata later from the app settings panel.</p>
          </div>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/70"
          >
            Back to dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
