'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Menu,
  Home,
  Plus,
  Moon,
  Sun,
  User,
  ChevronLeft,
  Sparkles,
  Palette,
  Rocket,
} from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface SidebarProps {
  onExpandedChange?: (expanded: boolean) => void;
}

export default function Sidebar({ onExpandedChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  // Mock data for apps
  const apps: App[] = [
    { id: '1', name: 'Travel App', icon: <Sparkles className="w-5 h-5" />, color: 'bg-purple-500' },
    { id: '2', name: 'Photo Editor', icon: <Palette className="w-5 h-5" />, color: 'bg-pink-500' },
    { id: '3', name: 'Fitness Pro', icon: <Rocket className="w-5 h-5" />, color: 'bg-blue-500' },
  ];

  useEffect(() => {
    // Check initial theme
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const isActive = (path: string) => pathname === path;
  const isAppActive = (appId: string) => pathname === `/app/${appId}`;

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-50 flex flex-col shadow-xl",
      isExpanded ? "w-64" : "w-20"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
          aria-label="Toggle sidebar"
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-lg">Mocksy</span>
          </div>
        )}
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
                : "hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            {isExpanded && <span className="font-medium">Home</span>}
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
                : "hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            {isExpanded && <span className="font-medium">New App</span>}
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
          {isExpanded && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Apps
            </p>
          )}
          <div className="space-y-1">
            {apps.map((app) => (
              <Link
                key={app.id}
                href={`/app/${app.id}`}
                className={cn(
                  "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative group",
                  isAppActive(app.id)
                    ? "bg-primary/20 text-primary border border-primary/30 font-medium"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
                )}
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    app.color,
                    "text-white"
                  )}>
                    {app.icon}
                  </div>
                </div>
                {isExpanded && <span className="font-medium">{app.name}</span>}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
                    {app.name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t p-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full h-12 flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative mb-1 group",
            "hover:bg-secondary text-muted-foreground hover:text-foreground"
          )}
          aria-label="Toggle theme"
        >
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </div>
          {isExpanded && <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </div>
          )}
        </button>

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
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Free Plan</p>
            </div>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50 text-sm">
              Profile
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}