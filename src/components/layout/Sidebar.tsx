'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser, useClerk } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState } from 'react';
import SearchModal from '@/components/SearchModal';
import {
  Moon,
  Sun,
  User,
  Monitor,
  Check,
  Compass,
  Pencil,
  Search,
  ShieldCheck,
  ArrowLeftToLine,
  LogOut,
  UserCircle,
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  mode: 'static' | 'overlay';
  isExpanded: boolean;
  onExpandedChange?: (_expanded: boolean) => void;
}

export default function Sidebar({ mode, isExpanded, onExpandedChange }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const apps = useQuery(api.data.apps.getApps) || [];
  const isAdmin = useQuery(api.data.profiles.isCurrentUserAdmin);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const isAppActive = (appId: string) => pathname === `/appstore/${appId}`;

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/welcome' });
  };

  // Render static mode
  const renderStaticMode = () => {
    return (
      <>
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <motion.div
          initial={false}
          animate={{ width: 256 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          className="hidden md:flex h-screen flex-col bg-background sticky top-0 flex-shrink-0"
        >
          {/* Header */}
          <Link href="/generate" className="h-16 flex items-center px-4 justify-start transition-all duration-300">
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
          </Link>

          {/* Navigation */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Main Navigation */}
            <nav className="pt-2 px-2 flex flex-col items-start gap-1 flex-shrink-0">
              <Link
                href="/generate"
                className={cn(
                  "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
                  isActive('/generate')
                    ? "text-foreground font-medium bg-muted shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Pencil className="w-5 h-5 flex-shrink-0" />
                <span>Create</span>
              </Link>

              <Link
                href="/appstore"
                className={cn(
                  "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
                  isActive('/appstore')
                    ? "text-foreground font-medium bg-muted shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Compass className="w-5 h-5 flex-shrink-0" />
                <span>App Store</span>
              </Link>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full"
              >
                <Search className="w-5 h-5 flex-shrink-0" />
                <span>Search</span>
              </button>
            </nav>

          {/* Divider */}
          <div className="mx-12 my-4 border-t flex-shrink-0" />

          {/* My Apps Section */}
          <div className="flex-1 min-h-0 flex flex-col px-2">
            <div className="px-3 mb-2 flex-shrink-0">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                My Apps
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-start gap-1 pb-2">
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
                        href={`/appstore/${app._id}`}
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
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-2">
          {/* Divider */}
          <div className="mx-12 mb-2 border-t" />
          
          {/* Admin Link (only for admins) */}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "w-full h-10 flex items-center gap-3 px-3 transition-colors rounded-lg",
                isActive('/admin')
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Admin</span>
            </Link>
          )}
          
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
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full h-10 flex items-center gap-3 px-3 transition-colors text-muted-foreground hover:text-foreground">
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
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-48 p-1">
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span className="flex-1 text-left">Profile Details</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="flex-1 text-left">Sign Out</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
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
        </div>
        </motion.div>
      </>
    );
  };

  // Render overlay mode
  const renderOverlayMode = () => (
    <>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Mobile overlay sidebar */}
      {isExpanded && (
        <>
          {/* Backdrop overlay for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => onExpandedChange?.(false)}
          />
          
          {/* Mobile sidebar panel */}
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-background border-r z-50 md:hidden"
          >
            {/* Mobile Header with Collapse Button */}
            <div className="h-16 flex items-center px-4 justify-between flex-shrink-0">
              <Link href="/generate" className="flex items-center">
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
              </Link>
              <button
                onClick={() => onExpandedChange?.(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Collapse sidebar"
              >
                <ArrowLeftToLine className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {/* Main Navigation */}
              <nav className="pt-2 px-2 flex flex-col items-start gap-1 flex-shrink-0">
                <Link
                  href="/generate"
                  onClick={() => onExpandedChange?.(false)}
                  className={cn(
                    "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full w-full",
                    isActive('/generate')
                      ? "text-foreground font-medium bg-muted shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Pencil className="w-5 h-5 flex-shrink-0" />
                  <span>Create</span>
                </Link>

                <Link
                  href="/appstore"
                  onClick={() => onExpandedChange?.(false)}
                  className={cn(
                    "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full w-full",
                    isActive('/appstore')
                      ? "text-foreground font-medium bg-muted shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Compass className="w-5 h-5 flex-shrink-0" />
                  <span>App Store</span>
                </Link>

                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    onExpandedChange?.(false);
                  }}
                  className="inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full"
                >
                  <Search className="w-5 h-5 flex-shrink-0" />
                  <span>Search</span>
                </button>
              </nav>
            </div>

            {/* Mobile Bottom Section */}
            <div className="p-2 flex-shrink-0">
              {/* Divider */}
              <div className="mx-12 mb-2 border-t" />
              
              {/* Admin Link (only for admins) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => onExpandedChange?.(false)}
                  className={cn(
                    "w-full h-10 flex items-center gap-3 px-3 transition-colors rounded-lg",
                    isActive('/admin')
                      ? "text-primary font-medium bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Admin</span>
              </Link>
            )}
            
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
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full h-10 flex items-center gap-3 px-3 transition-colors text-muted-foreground hover:text-foreground">
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
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-48 p-1">
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => onExpandedChange?.(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50"
                      >
                        <UserCircle className="w-4 h-4" />
                        <span className="flex-1 text-left">Profile Details</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="flex-1 text-left">Sign Out</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  href="/welcome?mode=sign-in&context=app-access"
                  onClick={() => onExpandedChange?.(false)}
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
            </div>
          </motion.div>
        </>
      )}
      
      {/* Desktop sidebar - only visible on md+ screens */}
      <motion.div
        initial={false}
        animate={{ 
          width: isExpanded ? 256 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
        className="hidden md:flex h-screen flex-col bg-background border-r overflow-hidden flex-shrink-0 fixed left-0 top-0 z-50"
      >
      {/* Header with Collapse Button */}
      {isExpanded && (
        <div className="h-16 flex items-center px-4 justify-between flex-shrink-0">
          <Link href="/generate" className="flex items-center">
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
          </Link>
          <button
            onClick={() => onExpandedChange?.(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Collapse sidebar"
          >
            <ArrowLeftToLine className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Main Navigation */}
            <nav className="pt-2 px-2 flex flex-col items-start gap-1 flex-shrink-0">
              <Link
                href="/generate"
                className={cn(
                  "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
                  isActive('/generate')
                    ? "text-foreground font-medium bg-muted shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Pencil className="w-5 h-5 flex-shrink-0" />
                <span>Create</span>
              </Link>

              <Link
                href="/appstore"
                className={cn(
                  "inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full",
                  isActive('/appstore')
                    ? "text-foreground font-medium bg-muted shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Compass className="w-5 h-5 flex-shrink-0" />
                <span>App Store</span>
              </Link>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center gap-3 px-4 h-10 transition-all rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full"
              >
                <Search className="w-5 h-5 flex-shrink-0" />
                <span>Search</span>
              </button>
            </nav>

            {/* Divider */}
            <div className="mx-12 my-4 border-t flex-shrink-0 hidden md:block" />

            {/* My Apps Section - Hidden on mobile */}
            <div className="flex-1 min-h-0 flex-col px-2 hidden md:flex">
              <div className="px-3 mb-2 flex-shrink-0">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  My Apps
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col items-start gap-1 pb-2">
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
                            href={`/appstore/${app._id}`}
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
            
            {/* Admin Link (only for admins) */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "w-full h-10 flex items-center gap-3 px-3 transition-colors rounded-lg",
                  isActive('/admin')
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Admin</span>
            </Link>
          )}
          
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
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full h-10 flex items-center gap-3 px-3 transition-colors text-muted-foreground hover:text-foreground">
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
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-48 p-1">
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span className="flex-1 text-left">Profile Details</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="flex-1 text-left">Sign Out</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
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
    </>
  );

  // Return appropriate mode
  return mode === 'static' ? renderStaticMode() : renderOverlayMode();
}