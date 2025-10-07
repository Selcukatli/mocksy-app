'use client';

import { useState, ReactNode } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface UIProvidersProps {
  children: ReactNode;
}

export default function UIProviders({ children }: UIProvidersProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen flex">
        <Sidebar onExpandedChange={setIsSidebarExpanded} />
        <div
          className={cn(
            "flex-1 min-w-0 transition-all duration-300",
            isSidebarExpanded ? "ml-64" : "ml-20"
          )}
        >
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
