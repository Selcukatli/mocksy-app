'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Moon,
  Sun,
  User,
  Monitor,
  Check,
  Compass,
  Settings,
  Pencil,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  onExpandedChange?: (expanded: boolean) => void;
}

export default function Sidebar({ onExpandedChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isSignedIn, user } = useUser();
  const apps = useQuery(api.apps.getApps) || [];

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  const isActive = (path: string) => pathname === path;
  const isAppActive = (appId: string) => pathname === `/app/${appId}`;

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 256 : 72 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className="fixed left-0 top-0 h-full z-50 flex flex-col"
    >
      {/* Header */}
      <div
        className={cn(
          "h-16 flex items-center justify-between transition-all duration-300",
          isExpanded ? "px-4" : "px-4"
        )}
      >
        {isExpanded ? (
          <>
            <div className="relative w-36 h-9 flex-shrink-0">
              <Image
                src={theme === 'dark' ? '/mocksy-logo-dark-mode.png' : '/mocksy-logo-light-mode.png'}
                alt="Mocksy"
                fill
                className="object-contain object-left"
                sizes="144px"
                priority
              />
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-11 h-11 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors flex-shrink-0 group"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-5.5 h-5.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" strokeWidth={2} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors flex-shrink-0 mx-auto group"
            aria-label="Expand sidebar"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-muted-foreground/60 group-hover:text-foreground transition-colors"
            >
              <rect x="6" y="11" width="20" height="2.5" rx="1.25" fill="currentColor" />
              <rect x="8" y="18.5" width="16" height="2.5" rx="1.25" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Main Navigation */}
            <nav className="pt-2 px-2 flex flex-col items-start gap-1">
              <Link
                href="/create"
                className={cn(
                  "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
                  isActive('/create')
                    ? "text-foreground font-medium bg-muted shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Pencil className="w-5 h-5 flex-shrink-0" />
                <span>Create</span>
              </Link>

              <Link
                href="/explore"
                className={cn(
                  "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
                  isActive('/explore')
                    ? "text-foreground font-medium bg-muted shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Compass className="w-5 h-5 flex-shrink-0" />
                <span>Explore</span>
              </Link>
            </nav>

            {/* Divider */}
            <div className="mx-12 my-4 border-t" />

            {/* My Apps Section */}
            <div className="flex-1 overflow-y-auto px-2">
              <div className="px-3 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  My Apps
                </span>
              </div>
              <div className="flex flex-col items-start gap-1">
                  {apps.length > 0 ? (
                    apps.map((app) => {
                      const colors = [
                        'bg-gradient-to-br from-blue-500 to-purple-600',
                        'bg-gradient-to-br from-green-500 to-teal-600',
                        'bg-gradient-to-br from-pink-500 to-orange-500',
                        'bg-gradient-to-br from-purple-500 to-indigo-600',
                        'bg-gradient-to-br from-red-500 to-pink-600',
                        'bg-gradient-to-br from-yellow-500 to-orange-600',
                      ];
                      const colorIndex = app.name.charCodeAt(0) % colors.length;
                      const appColor = colors[colorIndex];

                      return (
                        <Link
                          key={app._id}
                          href={`/app/${app._id}`}
                          className={cn(
                            "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
                            isAppActive(app._id)
                              ? "text-foreground font-medium bg-muted shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0",
                            appColor
                          )}>
                            {app.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="text-sm font-bold">
                                {app.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="font-medium truncate">{app.name}</span>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                      No apps yet
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-2"
          >
            {/* Divider */}
            <div className="mx-12 mb-2 border-t" />
            {/* Settings */}
            <Link
              href="/settings"
              className="w-full h-10 flex items-center gap-3 px-3 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Settings</span>
            </Link>

            {/* Theme Toggle */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-full h-10 flex items-center gap-3 px-3 transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  {theme === 'system' ? (
                    <Monitor className="w-5 h-5 flex-shrink-0" />
                  ) : theme === 'dark' ? (
                    <Moon className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <Sun className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">
                    {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>
              </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-48 p-1">
            <div className="space-y-1">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  theme === 'light'
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <Sun className="w-4 h-4" />
                <span className="flex-1 text-left">Light</span>
                {theme === 'light' && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  theme === 'dark'
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <Moon className="w-4 h-4" />
                <span className="flex-1 text-left">Dark</span>
                {theme === 'dark' && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  theme === 'system'
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <Monitor className="w-4 h-4" />
                <span className="flex-1 text-left">System</span>
                {theme === 'system' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </PopoverContent>
        </Popover>

            {/* Profile */}
            {isSignedIn ? (
              <Link
                href="/profile"
                className="w-full h-10 flex items-center gap-3 px-3 transition-colors text-muted-foreground hover:text-foreground"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="text-sm truncate">
                    {user?.firstName || user?.username || 'User'}
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                href="/welcome?mode=sign-in&context=app-access"
                className="w-full h-10 flex items-center gap-3 px-3 transition-colors text-muted-foreground hover:text-foreground"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3" />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="text-sm truncate">Sign In</p>
                </div>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}