'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppStore } from '@/stores/appStore';
import {
  Menu,
  Home,
  Plus,
  Moon,
  Sun,
  User,
  X,
  Monitor,
  Check,
  HelpCircle,
  Package,
} from 'lucide-react';

interface SidebarProps {
  onExpandedChange?: (expanded: boolean) => void;
}

export default function Sidebar({ onExpandedChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { apps } = useAppStore();

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  const isActive = (path: string) => pathname === path;
  const isAppActive = (appId: string) => pathname === `/app/${appId}`;

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 256 : 80 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className="fixed left-0 top-0 h-full bg-card border-r z-50 flex flex-col shadow-xl"
    >
      {/* Header */}
      <div
        className={cn(
          "h-16 flex items-center border-b transition-all duration-300",
          isExpanded ? "px-4 justify-start" : "justify-center"
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
          aria-label="Toggle sidebar"
        >
          <div className="relative w-5 h-5">
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Menu className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="ml-3 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-semibold text-lg">Mocksy</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Navigation */}
        <nav className="p-2">
          <Link
            href="/home"
            className={cn(
              "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative mb-1 group",
              isActive('/home')
                ? "bg-primary/20 text-primary border border-primary/30 font-medium"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            >
              <Home className="w-5 h-5" />
            </motion.div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium overflow-hidden whitespace-nowrap"
                >
                  Home
                </motion.span>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
                Home
              </div>
            )}
          </Link>

          <Link
            href="/new-app"
            className={cn(
              "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative group",
              isActive('/new-app')
                ? "bg-primary/20 text-primary border border-primary/30 font-medium"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
            </motion.div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium overflow-hidden whitespace-nowrap"
                >
                  New App
                </motion.span>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
                New App
              </div>
            )}
          </Link>
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t" />

        {/* Apps List */}
        <div className="flex-1 overflow-y-auto p-2">
          <AnimatePresence>
            {isExpanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider overflow-hidden"
              >
                Your Apps
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-1">
            {apps.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No apps yet</p>
              </div>
            ) : (
              apps.map((app) => {
                // Generate a gradient color based on the app name (deterministic)
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
                    key={app.id}
                    href={`/app/${app.id}`}
                    className={cn(
                      "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative group",
                      isAppActive(app.id)
                        ? "bg-primary/20 text-primary border border-primary/30 font-medium"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                        appColor
                      )}>
                        {app.icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.icon} alt={app.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-sm font-bold">
                            {app.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium overflow-hidden whitespace-nowrap"
                        >
                          {app.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!isExpanded && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
                        {app.name}
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t p-2">
        {/* Help Button */}
        <button
          onClick={() => {
            // Dispatch a custom event that the app page can listen to
            window.dispatchEvent(new CustomEvent('show-onboarding'));
          }}
          className={cn(
            "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative mb-1 group",
            "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          )}
          aria-label="Help"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center flex-shrink-0"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium overflow-hidden whitespace-nowrap"
              >
                Help
              </motion.span>
            )}
          </AnimatePresence>
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
              Help
            </div>
          )}
        </button>

        {/* Theme Toggle */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative mb-1 group",
                "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
              aria-label="Toggle theme"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              >
                {theme === 'system' ? (
                  <Monitor className="w-5 h-5" />
                ) : theme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </motion.div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium overflow-hidden whitespace-nowrap"
                  >
                    {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'} Mode
                  </motion.span>
                )}
              </AnimatePresence>
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
                  Theme: {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                </div>
              )}
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
        <Link
          href="/profile"
          className={cn(
            "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative group",
            isActive('/profile')
              ? "bg-primary/20 text-primary border border-primary/30 font-medium"
              : "hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
          )}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 flex items-center justify-center flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 overflow-hidden"
              >
                <p className="font-medium text-sm truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">Free Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
              Profile
            </div>
          )}
        </Link>
      </div>
    </motion.div>
  );
}