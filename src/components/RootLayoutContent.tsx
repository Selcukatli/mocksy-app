'use client';

import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import BottomTabBar from '@/components/layout/BottomTabBar';

interface RootLayoutContentProps {
  children: ReactNode;
}

type SidebarMode = 'static' | 'overlay';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageContextValue {
  title: string;
  setTitle: (title: string) => void;
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
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

// Define static (browse) pages - everything else defaults to overlay (dynamic)
const staticRoutes = ['/create', '/appstore', '/profile'];
const getDefaultMode = (path: string | null): SidebarMode => {
  if (!path) return 'overlay';
  
  // Check for exact match only (no sub-routes)
  return staticRoutes.includes(path) ? 'static' : 'overlay';
};

export default function RootLayoutContent({ children }: RootLayoutContentProps) {
  const pathname = usePathname();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Breadcrumb[]>([]);
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
    return (
      <>
        {children}
        <BottomTabBar />
      </>
    );
  }

  // Static mode: sidebar always visible on desktop, bottom tabs on mobile
  if (pageSidebarMode === 'static') {
    return (
      <PageContext.Provider
        value={{
          title: pageTitle,
          setTitle: setPageTitle,
          breadcrumbs: pageBreadcrumbs,
          setBreadcrumbs: setPageBreadcrumbs,
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
          <div className="flex-1 min-w-0 pb-20 md:pb-0">
            {children}
          </div>
        </div>
        {/* Show bottom tabs only on mobile for static pages */}
        <BottomTabBar />
      </PageContext.Provider>
    );
  }

  // Overlay mode: has top header + hamburger on mobile, collapsible sidebar on desktop
  return (
    <PageContext.Provider
      value={{
        title: pageTitle,
        setTitle: setPageTitle,
        breadcrumbs: pageBreadcrumbs,
        setBreadcrumbs: setPageBreadcrumbs,
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
            breadcrumbs={pageBreadcrumbs}
            actions={pageActions}
            onMenuClick={toggleSidebar}
            isSidebarExpanded={isSidebarExpanded}
          />
          <div className="pt-16">
            {children}
          </div>
        </div>
      </div>
      {/* No bottom tabs on overlay mode pages */}
    </PageContext.Provider>
  );
}
