'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface RootLayoutContentProps {
  children: ReactNode;
}

export default function RootLayoutContent({ children }: RootLayoutContentProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const pathname = usePathname();

  // Don't show sidebar on mockstore routes or welcome page
  const shouldShowSidebar = !pathname?.startsWith('/mockstore') && !pathname?.startsWith('/welcome');

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar onExpandedChange={setIsSidebarExpanded} />
      <div
        className={cn(
          "flex-1 min-w-0 transition-all duration-300",
          isSidebarExpanded ? "ml-64" : "ml-[72px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
