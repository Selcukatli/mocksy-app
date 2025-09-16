'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar onExpandedChange={setIsSidebarExpanded} />
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarExpanded ? "ml-64" : "ml-20"
        )}
      >
        {children}
      </div>
    </div>
  );
}