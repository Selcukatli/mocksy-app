'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PanelLeftClose } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
  actions?: ReactNode;
  onMenuClick: () => void;
  isSidebarExpanded: boolean;
}

export default function TopHeader({
  title,
  actions,
  onMenuClick,
  isSidebarExpanded
}: TopHeaderProps) {
  const router = useRouter();

  const handleTitleClick = () => {
    // Map title to route
    const titleRouteMap: Record<string, string> = {
      'Create': '/create',
      'Appstore': '/appstore',
      'AppStore': '/appstore',
      'App Store': '/appstore',
    };

    const route = titleRouteMap[title || ''];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Hamburger/Collapse + Title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="w-12 h-12 rounded-lg hover:bg-muted flex items-center justify-center transition-all flex-shrink-0 group"
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarExpanded ? (
              <PanelLeftClose className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={2} />
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-foreground transition-transform group-hover:scale-105"
              >
                <rect x="4" y="9" width="20" height="2.5" rx="1.25" fill="currentColor" />
                <rect x="6" y="16.5" width="16" height="2.5" rx="1.25" fill="currentColor" />
              </svg>
            )}
          </button>

          {title && (
            <button
              onClick={handleTitleClick}
              className="text-lg font-semibold truncate transition-colors hover:text-primary cursor-pointer"
            >
              {title}
            </button>
          )}
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
