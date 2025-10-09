'use client';

import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';

interface RootLayoutContentProps {
  children: ReactNode;
}

type SidebarMode = 'static' | 'overlay';

interface PageContextValue {
  title: string;
  setTitle: (title: string) => void;
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
}

const PageContext = createContext<PageContextValue | null>(null);

export function usePageHeader() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageHeader must be used within RootLayoutContent');
  }
  return context;
}

export default function RootLayoutContent({ children }: RootLayoutContentProps) {
  const pathname = usePathname();

  // Define static (browse) pages - everything else defaults to overlay (dynamic)
  const staticRoutes = ['/create', '/appstore', '/settings', '/profile'];
  const getDefaultMode = (path: string | null): SidebarMode => {
    return staticRoutes.includes(path || '') ? 'static' : 'overlay';
  };

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageActions, setPageActions] = useState<ReactNode>(null);
  const [pageSidebarMode, setPageSidebarMode] = useState<SidebarMode>(getDefaultMode(pathname));

  // Don't show sidebar only on welcome page (onboarding)
  const shouldShowSidebar = !pathname?.startsWith('/welcome');

  // Reset to default mode when pathname changes
  useEffect(() => {
    setPageSidebarMode(getDefaultMode(pathname));
  }, [pathname]);

  // Collapse sidebar when navigating to overlay mode pages
  useEffect(() => {
    if (pageSidebarMode === 'overlay') {
      setIsSidebarExpanded(false);
    }
  }, [pathname, pageSidebarMode]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  // Static mode: sidebar always visible, no overlay
  if (pageSidebarMode === 'static') {
    return (
      <PageContext.Provider
        value={{
          title: pageTitle,
          setTitle: setPageTitle,
          actions: pageActions,
          setActions: setPageActions,
          sidebarMode: pageSidebarMode,
          setSidebarMode: setPageSidebarMode,
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
        sidebarMode: pageSidebarMode,
        setSidebarMode: setPageSidebarMode,
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
