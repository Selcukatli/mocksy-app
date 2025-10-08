'use client';

import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface RootLayoutContentProps {
  children: ReactNode;
}

interface PageContextValue {
  title: string;
  setTitle: (title: string) => void;
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const PageContext = createContext<PageContextValue | null>(null);

export function usePageHeader() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageHeader must be used within RootLayoutContent');
  }
  return context;
}

type SidebarMode = 'static' | 'overlay';

export default function RootLayoutContent({ children }: RootLayoutContentProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageActions, setPageActions] = useState<ReactNode>(null);
  const pathname = usePathname();

  // Don't show sidebar on mockstore routes or welcome page
  const shouldShowSidebar = !pathname?.startsWith('/mockstore') && !pathname?.startsWith('/welcome');

  // Determine sidebar mode based on route
  const staticRoutes = ['/create', '/explore', '/settings', '/profile'];
  const isStaticRoute = staticRoutes.includes(pathname || '');
  const sidebarMode: SidebarMode = isStaticRoute ? 'static' : 'overlay';

  // Collapse sidebar when navigating to overlay mode pages
  useEffect(() => {
    if (sidebarMode === 'overlay') {
      setIsSidebarExpanded(false);
    }
  }, [pathname, sidebarMode]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  // Static mode: sidebar always visible, no overlay
  if (sidebarMode === 'static') {
    return (
      <PageContext.Provider
        value={{
          title: pageTitle,
          setTitle: setPageTitle,
          actions: pageActions,
          setActions: setPageActions,
        }}
      >
        <div className="min-h-screen flex">
          <Sidebar
            mode="static"
            isExpanded={true}
            onExpandedChange={setIsSidebarExpanded}
          />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </PageContext.Provider>
    );
  }

  // Overlay mode: sidebar can collapse, has top header, pushes content
  return (
    <PageContext.Provider
      value={{
        title: pageTitle,
        setTitle: setPageTitle,
        actions: pageActions,
        setActions: setPageActions,
      }}
    >
      <div className="min-h-screen flex">
        <Sidebar
          mode="overlay"
          isExpanded={isSidebarExpanded}
          onExpandedChange={setIsSidebarExpanded}
        />

        <div className="flex-1 min-w-0">
          <TopHeader
            title={pageTitle}
            actions={pageActions}
            onMenuClick={toggleSidebar}
            isSidebarExpanded={isSidebarExpanded}
          />
          <div className="pt-12">
            {children}
          </div>
        </div>
      </div>
    </PageContext.Provider>
  );
}
