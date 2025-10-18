'use client';

import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import BottomTabBar from '@/components/layout/BottomTabBar';
import { cn } from '@/lib/utils';

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
  showLogo: boolean;
  setShowLogo: (showLogo: boolean) => void;
  centerInFullViewport: boolean;
  setCenterInFullViewport: (center: boolean) => void;
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
const staticRoutes = ['/generate', '/appstore', '/profile'];
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
  // Set initial mode based on pathname to avoid hydration mismatch
  const [pageSidebarMode, setPageSidebarMode] = useState<SidebarMode>(() => getDefaultMode(pathname));
  const [pageShowLogo, setPageShowLogo] = useState(false);
  const [pageCenterInFullViewport, setPageCenterInFullViewport] = useState(false);

  // Don't show sidebar only on welcome page (onboarding)
  const shouldShowSidebar = !pathname?.startsWith('/welcome');

  // Update mode when pathname changes
  useEffect(() => {
    setPageSidebarMode(getDefaultMode(pathname));
  }, [pathname]);

  // Collapse sidebar when navigating to overlay mode pages
  useEffect(() => {
    if (pageSidebarMode === 'overlay') {
      setIsSidebarExpanded(false);
    }
  }, [pageSidebarMode]);

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

  // Render static mode for browse pages (App Store, Profile)
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
          showLogo: pageShowLogo,
          setShowLogo: setPageShowLogo,
          centerInFullViewport: pageCenterInFullViewport,
          setCenterInFullViewport: setPageCenterInFullViewport,
        }}
      >
        <div className="h-screen flex overflow-hidden" suppressHydrationWarning>
          <Sidebar
            mode="static"
            isExpanded={true}
            onExpandedChange={setIsSidebarExpanded}
          />
          <div 
            className={cn(
              "flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0",
              pageCenterInFullViewport && "md:pr-64"
            )}
            suppressHydrationWarning
          >
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
        showLogo: pageShowLogo,
        setShowLogo: setPageShowLogo,
        centerInFullViewport: pageCenterInFullViewport,
        setCenterInFullViewport: setPageCenterInFullViewport,
      }}
    >
      <div className="min-h-screen" suppressHydrationWarning>
        <Sidebar
          mode="overlay"
          isExpanded={isSidebarExpanded}
          onExpandedChange={setIsSidebarExpanded}
        />

        <div className="flex flex-col min-h-screen" suppressHydrationWarning>
          <TopHeader
            title={pageTitle}
            breadcrumbs={pageBreadcrumbs}
            actions={pageActions}
            onMenuClick={toggleSidebar}
            isSidebarExpanded={isSidebarExpanded}
            showLogo={pageShowLogo}
          />
          {/* 
            Content area with pt-16 to offset the fixed header.
            For pages that need full viewport height without scroll, use:
            min-h-[calc(100vh-4rem)] instead of min-h-screen
          */}
          <div className="pt-16 flex-1" suppressHydrationWarning>
            {children}
          </div>
        </div>
      </div>
      {/* No bottom tabs on overlay mode pages */}
    </PageContext.Provider>
  );
}
