# Next.js Adaptive Sidebar Layout Pattern

## Overview

This document describes a production-ready, flexible two-mode sidebar layout system for Next.js applications (App Router) that adapts based on route depth and viewport size. The pattern provides optimal UX by showing a persistent sidebar on browse pages and a collapsible sidebar on deep/task-focused pages, with full mobile responsiveness via bottom tabs.

**Use this guide to recreate this exact system in any Next.js project.**

## Architecture

### Three-Layer System

This pattern consists of three coordinated layers:

1. **Desktop Sidebar** - Two-mode navigation (static or overlay)
2. **Mobile Bottom Tabs** - Persistent navigation on small screens
3. **Page Context System** - Dynamic header content for inner pages

### Two-Mode Desktop Sidebar

**Static Mode** (Browse/Root Pages)
- **Routes**: `/create`, `/appstore`, `/profile`, `/settings`
- **Behavior**: Sidebar always visible and expanded on desktop
- **Layout**: Takes dedicated flex space (256px width)
- **Mobile**: Hidden; bottom tabs provide navigation
- **Use Case**: Pages where browsing/navigation is primary

**Overlay Mode** (Task/Deep Pages)
- **Routes**: `/manage-app/[id]`, `/new-app`, nested routes
- **Behavior**: Sidebar starts collapsed; expands on demand
- **Layout**: Fixed positioning, slides in from left
- **Mobile**: Full-screen overlay with backdrop
- **Desktop**: Pushes content (no backdrop)
- **Use Case**: Task-focused pages where content is primary

### Mobile Strategy

- **Static pages**: Bottom tab bar only (no sidebar)
- **Overlay pages**: No bottom tabs (content-focused)
- **Breakpoint**: `md` (768px) for desktop/mobile switch

### Key Benefits

1. **Context-aware navigation**: Browse pages show full nav; task pages maximize content
2. **Mobile-first**: Bottom tabs for quick navigation on phones
3. **Smooth animations**: Spring physics for natural feel
4. **Auto-responsive**: Automatically adapts to route changes
5. **Production-tested**: Handles edge cases, accessibility, state management

## Implementation

### File Structure

```
src/
├── components/
│   ├── RootLayoutContent.tsx    # Main layout orchestrator + PageContext provider
│   └── layout/
│       ├── Sidebar.tsx          # Two-mode sidebar component
│       ├── TopHeader.tsx        # Header for overlay mode
│       └── BottomTabBar.tsx     # Mobile navigation
├── app/
│   └── layout.tsx               # Root layout using RootLayoutContent
```

### Complete System Diagram

```
┌─────────────────────────────────────────────────┐
│ RootLayoutContent (Client Component)            │
│ - Manages sidebar state                         │
│ - Provides PageContext                          │
│ - Determines mode based on route                │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   Static Mode            Overlay Mode
        │                       │
        ▼                       ▼
┌──────────────┐       ┌──────────────┐
│   Sidebar    │       │  TopHeader   │
│ (always on)  │       │  (page info) │
│              │       │      +       │
│      +       │       │   Sidebar    │
│   Content    │       │  (on demand) │
│              │       │      +       │
│      +       │       │   Content    │
│ BottomTabs   │       └──────────────┘
│  (mobile)    │
└──────────────┘
```

### Z-Index Strategy

**Critical for proper layering:**

```css
z-50: BottomTabBar (mobile)      /* Always on top on mobile */
z-50: Sidebar (overlay mode)     /* Above content but below modals */
z-40: TopHeader                  /* Below sidebar */
z-40: Mobile backdrop            /* Same layer as header */
z-10: Content (default)          /* Base layer */
```

### 1. Root Layout Content (`RootLayoutContent.tsx`)

This component is the brain of the entire system. It:
1. Manages sidebar expand/collapse state
2. Provides PageContext for inner pages
3. Determines which mode to use based on route
4. Auto-collapses sidebar when navigating
5. Handles mobile/desktop responsiveness

#### Core State Management

```tsx
const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
const [pageTitle, setPageTitle] = useState('');
const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Breadcrumb[]>([]);
const [pageActions, setPageActions] = useState<ReactNode>(null);
const [pageSidebarMode, setPageSidebarMode] = useState<SidebarMode>('overlay');
```

#### Route-Based Mode Detection

```tsx
// Define static (browse) pages - everything else defaults to overlay (dynamic)
const staticRoutes = ['/create', '/appstore', '/profile'];

const getDefaultMode = (path: string | null): SidebarMode => {
  if (!path) return 'overlay';
  // Exact match only (no sub-routes)
  return staticRoutes.includes(path) ? 'static' : 'overlay';
};

// Reset to default mode when pathname changes
useEffect(() => {
  setPageSidebarMode(getDefaultMode(pathname));
}, [pathname]);
```

**Why exact match?** Sub-routes like `/appstore/[app-id]` should be overlay mode for focus.

#### Auto-Collapse on Navigation

```tsx
// Collapse sidebar when navigating to overlay mode pages
useEffect(() => {
  if (pageSidebarMode === 'overlay') {
    setIsSidebarExpanded(false);
  }
}, [pathname, pageSidebarMode]);
```

This ensures clean transitions when navigating from browse → task pages.

#### PageContext Provider

**The PageContext System allows inner pages to control the top header dynamically.**

```tsx
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
```

**This is key:** Pages can now set their header content from anywhere in the component tree.

#### Static Mode Layout

```tsx
if (pageSidebarMode === 'static') {
  return (
    <PageContext.Provider value={{ /* context values */ }}>
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
```

**Key details:**
- Sidebar takes `w-64` (256px) of flex space
- Content takes `flex-1` (remaining space)
- `pb-20` adds bottom padding on mobile for tabs
- `md:pb-0` removes padding on desktop
- BottomTabBar is `md:hidden` (mobile only)

#### Overlay Mode Layout

```tsx
return (
  <PageContext.Provider value={{ /* context values */ }}>
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
```

**Key details:**
- Sidebar uses fixed positioning (doesn't take flex space)
- TopHeader is `fixed` with `h-16` height
- Content has `pt-16` to offset header
- No bottom tabs (task focus)

#### Critical CSS Classes

- `min-h-screen flex`: Full height + horizontal flex layout
- `flex-1 min-w-0`: **Critical!** Allows content to shrink below natural width (prevents overflow)
- `pb-20 md:pb-0`: Mobile bottom padding for tabs
- `pt-16`: Top padding to offset fixed header

### 2. Sidebar Component (`Sidebar.tsx`)

Single component that renders differently based on `mode` prop. Both modes share the same content structure.

#### Static Mode Implementation

**Used on browse pages where sidebar is always visible:**

```tsx
<motion.div
  initial={false}
  animate={{ width: 256 }}
  transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
  className="hidden md:flex h-screen flex-col bg-background sticky top-0 flex-shrink-0"
>
  {/* Logo Header */}
  <Link href="/create" className="h-16 flex items-center px-4">
    <Image src="/logo.png" alt="Logo" />
  </Link>

  {/* Main Content Area */}
  <div className="flex-1 flex flex-col min-h-0">
    {/* Fixed Navigation */}
    <nav className="pt-2 px-2 flex flex-col gap-1 flex-shrink-0">
      <Link href="/create">Create</Link>
      <Link href="/appstore">App Store</Link>
      <button onClick={() => setIsSearchOpen(true)}>Search</button>
    </nav>

    {/* Divider */}
    <div className="mx-12 my-4 border-t flex-shrink-0" />

    {/* My Apps Section - Scrollable */}
    <div className="flex-1 min-h-0 flex flex-col px-2">
      <div className="px-3 mb-2 flex-shrink-0">
        <span className="text-xs uppercase">My Apps</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {apps.map(app => <Link key={app.id} href={`/manage-app/${app.id}`}>...</Link>)}
      </div>
    </div>
  </div>

  {/* Bottom Section - Fixed */}
  <div className="p-2">
    <Link href="/settings">Settings</Link>
    <ThemeToggle />
    <UserProfile />
  </div>
</motion.div>
```

**Key Static Mode Details:**
- `hidden md:flex`: Hidden on mobile, flex on desktop
- `sticky top-0`: Sticks to top when scrolling (not fixed)
- `w-64` (256px): Takes dedicated flex space
- `flex-shrink-0`: Prevents sidebar from shrinking

#### Overlay Mode Implementation

**Used on task pages where sidebar slides in on demand:**

```tsx
<>
  {/* Mobile Backdrop */}
  {isExpanded && (
    <div 
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
      onClick={() => onExpandedChange?.(false)}
    />
  )}
  
  {/* Sidebar */}
  <motion.div
    initial={false}
    animate={{ 
      x: isExpanded ? 0 : -256,  // Slide from left
    }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }}
    className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-background border-r overflow-hidden z-50"
  >
    {/* Logo Header - Only when expanded */}
    {isExpanded && (
      <Link href="/create" className="h-16 flex items-center px-4">
        <Image src="/logo.png" alt="Logo" />
      </Link>
    )}

    {/* Navigation - Wrapped in AnimatePresence */}
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Same structure as static mode */}
          <nav>...</nav>
          <div className="mx-12 my-4 border-t" />
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-3 mb-2">My Apps</div>
            <div className="flex-1 overflow-y-auto">
              {apps.map(...)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Bottom Section */}
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-2"
        >
          <Link href="/settings">Settings</Link>
          <ThemeToggle />
          <UserProfile />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
</>
```

**Key Overlay Mode Details:**
- `fixed left-0 top-0`: Fixed positioning (true overlay, doesn't push content)
- `x: -256`: **Slides from left** (hidden state is off-screen to the left)
- `z-50`: Above content and header
- Mobile backdrop at `z-40` (below sidebar, above content)
- Desktop: No backdrop (just the sliding sidebar)
- `AnimatePresence`: Fades content in/out during slide
- `w-64`: Fixed 256px width (matches the translation distance)

**Important:** Unlike static mode, overlay sidebar truly overlays content (doesn't push it). This keeps task pages focused on the content while navigation is just a slide away.

#### Critical Internal Scrolling Pattern

**The "My Apps" section needs to scroll independently:**

```tsx
<div className="flex-1 flex flex-col min-h-0">
  {/* Fixed sections */}
  <nav className="flex-shrink-0">...</nav>
  <div className="mx-12 my-4 border-t flex-shrink-0" />

  {/* Scrollable section */}
  <div className="flex-1 min-h-0 flex flex-col px-2">
    <div className="px-3 mb-2 flex-shrink-0">
      {/* Section header */}
    </div>
    <div className="flex-1 overflow-y-auto">
      {/* Scrollable list */}
    </div>
  </div>
</div>
```

**Why `min-h-0` is CRITICAL:**
- By default, flex items have `min-height: auto`
- This prevents them from shrinking below their content height
- `min-h-0` overrides this, allowing the container to shrink
- This enables `overflow-y-auto` to work properly

Without `min-h-0`, the entire sidebar would grow to fit all apps instead of scrolling.

#### Animation Configuration

```tsx
transition={{
  type: "spring",        // Physics-based (not ease/linear)
  stiffness: 300,        // How "tight" the spring is
  damping: 30,           // How quickly motion settles
  mass: 0.8              // Weight of the animated object
}}
```

**Spring vs Ease:**
- Spring animations feel more natural
- They respond to interruptions (user can change direction mid-animation)
- Ease curves feel robotic

**Tuning guide:**
- Increase `stiffness` → faster animation
- Increase `damping` → less bounce
- Decrease `mass` → more responsive

#### Responsive Behavior

**Static Mode:**
- Desktop: Always visible (`hidden md:flex`)
- Mobile: Completely hidden, replaced by BottomTabBar

**Overlay Mode:**
- Desktop: Slides in from left, overlays content
- Mobile: Slides in from left with backdrop, full-screen feel
- Backdrop only on mobile: `md:hidden`

### 3. Top Header (`TopHeader.tsx`)

The header appears **only in overlay mode** and provides context about the current page plus quick access to the sidebar.

#### Full Implementation

```tsx
interface TopHeaderProps {
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  onMenuClick: () => void;
  isSidebarExpanded: boolean;
}

export default function TopHeader({
  title,
  breadcrumbs,
  actions,
  onMenuClick,
  isSidebarExpanded
}: TopHeaderProps) {
  const router = useRouter();

  const handleTitleClick = () => {
    // Map titles to routes for quick navigation
    const titleRouteMap: Record<string, string> = {
      'Create': '/create',
      'Appstore': '/appstore',
    };
    
    const route = titleRouteMap[title || ''];
    if (route) router.push(route);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Hamburger/Collapse + Title or Breadcrumbs */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="w-12 h-12 rounded-lg hover:bg-muted flex items-center justify-center transition-all flex-shrink-0 group"
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarExpanded ? (
              <PanelLeftClose className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              /* Custom hamburger icon - two horizontal lines */
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="9" width="20" height="2.5" rx="1.25" fill="currentColor" />
                <rect x="6" y="16.5" width="16" height="2.5" rx="1.25" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Breadcrumbs (if provided) OR Simple Title */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <div className="flex items-center gap-2 min-w-0">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2 min-w-0">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  {crumb.href ? (
                    <button
                      onClick={() => router.push(crumb.href)}
                      className="text-lg font-semibold transition-colors hover:text-primary cursor-pointer truncate"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-lg font-semibold text-foreground truncate">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : title ? (
            <button
              onClick={handleTitleClick}
              className="text-lg font-semibold truncate transition-colors hover:text-primary cursor-pointer"
            >
              {title}
            </button>
          ) : null}
        </div>

        {/* Right: Action Buttons */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### Key Features Explained

**1. Dual Title/Breadcrumb Support**
- Pages can provide either a simple `title` or `breadcrumbs` array
- Breadcrumbs show navigation hierarchy: `Create > App Name > Set Details`
- Clickable breadcrumbs for quick back-navigation

**2. Smart Hamburger Button**
- Shows hamburger icon (two lines) when collapsed
- Shows `PanelLeftClose` icon when expanded
- Icon morphs with smooth transition
- `flex-shrink-0` prevents icon from squishing

**3. Interactive Title**
- Title is clickable and routes to parent page
- Maps common titles to routes (extensible pattern)
- Helps with quick navigation without sidebar

**4. Action Buttons**
- Right-aligned buttons for page-specific actions
- Examples: "Save", "Export", "Settings"
- `flex-shrink-0` prevents buttons from shrinking
- Responsive: can hide labels on mobile

**5. Fixed Positioning**
- `fixed top-0 left-0 right-0`: Stays at top during scroll
- `h-16`: Fixed height (64px)
- `z-40`: Above content, below sidebar
- `bg-background/80 backdrop-blur-md`: Frosted glass effect

**6. Responsive Padding**
- Content area has `pt-16` to offset header
- Without this, header would overlap content

#### Custom Hamburger Icon

The two-line hamburger is intentional design:
```tsx
<svg width="28" height="28" viewBox="0 0 28 28">
  {/* Top line - wider */}
  <rect x="4" y="9" width="20" height="2.5" rx="1.25" fill="currentColor" />
  {/* Bottom line - narrower */}
  <rect x="6" y="16.5" width="16" height="2.5" rx="1.25" fill="currentColor" />
</svg>
```

- Top line starts at x=4, width=20
- Bottom line starts at x=6, width=16
- Creates visual hierarchy
- Rounded corners (`rx="1.25"`) for modern look

### 4. Page Context System

**This is the secret sauce that makes inner pages feel native.**

Pages in overlay mode can dynamically set their header content (title, breadcrumbs, actions) using React Context.

#### How It Works

```
┌─────────────────────────────────────────┐
│ RootLayoutContent                       │
│ - Creates PageContext                   │
│ - Provides: setTitle, setBreadcrumbs,   │
│             setActions, setSidebarMode  │
└─────────────────────────────────────────┘
           │
           ├──> TopHeader (receives title, breadcrumbs, actions)
           │
           └──> {children}
                    │
                    └──> Page Component
                         - Calls usePageHeader()
                         - Sets context values
                         - Context updates TopHeader
```

#### Complete Example: Task Page

```tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePageHeader } from '@/components/RootLayoutContent';
import { Settings, Download, Trash2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ 'app-id': string }>;
}

export default function ManageAppPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const router = useRouter();
  
  // Get context setters
  const { setBreadcrumbs, setSidebarMode } = usePageHeader();
  
  // Page state
  const [app, setApp] = useState(null);

  // Set page context on mount
  useEffect(() => {
    // Force overlay mode (though deep pages default to this)
    setSidebarMode('overlay');
    
    // Set breadcrumbs for navigation
    setBreadcrumbs([
      { label: 'Create', href: '/create' },
      { label: app?.name || 'Loading...' }  // Last crumb has no href (current page)
    ]);
  }, [setBreadcrumbs, setSidebarMode, app?.name]);

  return (
    <div className="p-6">
      <h1>{app?.name}</h1>
      {/* Page content */}
    </div>
  );
}
```

#### Setting Page Actions

```tsx
const { setTitle, setActions } = usePageHeader();

useEffect(() => {
  setTitle('App Settings');
  
  setActions(
    <>
      <button className="px-4 py-2 rounded-lg border hover:bg-muted/50">
        <Settings className="w-4 h-4" />
        <span className="ml-2 hidden md:inline">Settings</span>
      </button>
      
      <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">
        <Download className="w-4 h-4" />
        <span className="ml-2 hidden md:inline">Export</span>
      </button>
      
      <button className="px-4 py-2 rounded-lg border border-red-500/40 hover:bg-red-500/10 text-red-600">
        <Trash2 className="w-4 h-4" />
        <span className="ml-2 hidden md:inline">Delete</span>
      </button>
    </>
  );
  
  // Cleanup on unmount
  return () => {
    setTitle('');
    setActions(null);
  };
}, [setTitle, setActions]);
```

#### Pattern: Title vs Breadcrumbs

**Use `setTitle` for simple pages:**
```tsx
useEffect(() => {
  setTitle('Settings');
}, [setTitle]);
```
Result: `☰ Settings [Actions]`

**Use `setBreadcrumbs` for deep pages:**
```tsx
useEffect(() => {
  setBreadcrumbs([
    { label: 'Create', href: '/create' },
    { label: 'My App', href: '/manage-app/123' },
    { label: 'Screenshot Set' }
  ]);
}, [setBreadcrumbs]);
```
Result: `☰ Create > My App > Screenshot Set [Actions]`

#### Dynamic Updates

Context updates are reactive - change them anytime:

```tsx
const [isEditing, setIsEditing] = useState(false);

useEffect(() => {
  setActions(
    isEditing ? (
      <>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </>
    ) : (
      <button onClick={() => setIsEditing(true)}>Edit</button>
    )
  );
}, [isEditing]);
```

#### Force Sidebar Mode

Pages can override the default mode:

```tsx
// Force static mode on a deep page (rare)
useEffect(() => {
  setSidebarMode('static');
  return () => setSidebarMode('overlay');  // Reset on unmount
}, [setSidebarMode]);
```

Use cases:
- Browse page with nested routes
- Dashboard with persistent sidebar
- Admin panel

#### Context API Reference

```tsx
interface PageContextValue {
  // Title (simple, used when breadcrumbs is empty)
  title: string;
  setTitle: (title: string) => void;
  
  // Breadcrumbs (rich navigation, preferred for deep pages)
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  
  // Action buttons (right side of header)
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
  
  // Sidebar mode (rarely need to override)
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
}

interface Breadcrumb {
  label: string;
  href?: string;  // Omit for current page
}
```

#### Best Practices

1. **Always set context in `useEffect`**
   ```tsx
   // ✅ Correct
   useEffect(() => {
     setTitle('My Page');
   }, [setTitle]);
   
   // ❌ Wrong - runs on every render
   setTitle('My Page');
   ```

2. **Include setters in dependency array**
   ```tsx
   useEffect(() => {
     setTitle(dynamicTitle);
   }, [setTitle, dynamicTitle]);  // ✅ Include setTitle
   ```

3. **Clean up on unmount (optional but nice)**
   ```tsx
   useEffect(() => {
     setTitle('My Page');
     return () => setTitle('');  // Reset
   }, [setTitle]);
   ```

4. **Use breadcrumbs for deep pages**
   - 1 level deep: Use title
   - 2+ levels deep: Use breadcrumbs

5. **Make last breadcrumb non-clickable**
   ```tsx
   setBreadcrumbs([
     { label: 'Parent', href: '/parent' },
     { label: 'Current Page' }  // No href
   ]);
   ```

### 5. Bottom Tab Bar (`BottomTabBar.tsx`)

Mobile navigation that appears **only on static mode pages** (browse pages).

#### Implementation

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Pencil, Compass, Search, User } from 'lucide-react';
import { useState } from 'react';
import SearchModal from '@/components/SearchModal';

export default function BottomTabBar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const tabs = [
    {
      id: 'create',
      label: 'Create',
      icon: Pencil,
      href: '/create',
      isActive: pathname === '/create',
    },
    {
      id: 'appstore',
      label: 'App Store',
      icon: Compass,
      href: '/appstore',
      isActive: pathname === '/appstore',
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      onClick: () => setIsSearchOpen(true),
      isActive: false,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/profile',
      isActive: pathname === '/profile' || pathname === '/settings',
    },
  ];

  return (
    <>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
        <div className="flex items-center justify-around h-16 pb-safe">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            
            if (tab.onClick) {
              return (
                <button
                  key={tab.id}
                  onClick={tab.onClick}
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                    tab.isActive ? 'text-foreground' : 'text-muted-foreground active:text-foreground'
                  )}
                >
                  <Icon className="w-6 h-6" strokeWidth={tab.isActive ? 2.5 : 2} />
                  <span className={cn(
                    'text-xs',
                    tab.isActive ? 'font-semibold' : 'font-medium'
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.id}
                href={tab.href!}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  tab.isActive ? 'text-foreground' : 'text-muted-foreground active:text-foreground'
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={tab.isActive ? 2.5 : 2} />
                <span className={cn(
                  'text-xs',
                  tab.isActive ? 'font-semibold' : 'font-medium'
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
```

#### Key Features

**1. Mobile-Only Display**
- `md:hidden`: Only visible on screens < 768px
- `fixed bottom-0`: Always at bottom of viewport
- `z-50`: Highest z-index (above everything)

**2. Safe Area Support**
- `pb-safe`: Respects iOS safe areas (home indicator)
- Prevents tabs from being hidden behind home indicator

**3. Active State Styling**
- Thicker stroke on active icon (`strokeWidth={2.5}`)
- Bolder label (`font-semibold`)
- Full color vs muted

**4. Flexible Tab System**
- Supports both links (`href`) and buttons (`onClick`)
- Search tab triggers modal instead of navigation
- Easy to add/remove tabs

**5. Visual Polish**
- `active:text-foreground`: Instant feedback on tap
- `transition-colors`: Smooth color changes
- Centered layout with equal spacing

#### Responsive Strategy

```tsx
// In RootLayoutContent.tsx
if (pageSidebarMode === 'static') {
  return (
    <>
      <div className="min-h-screen flex">
        <Sidebar mode="static" isExpanded={true} />
        <div className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </div>
      </div>
      <BottomTabBar />  {/* Shows on mobile */}
    </>
  );
}
```

**Why `pb-20`?**
- Bottom tab bar is `h-16` (64px) + safe area
- `pb-20` (80px) gives buffer to prevent content from hiding
- `md:pb-0` removes padding on desktop (no tabs)

#### Customization

**Adding a new tab:**
```tsx
{
  id: 'explore',
  label: 'Explore',
  icon: Compass,
  href: '/explore',
  isActive: pathname === '/explore',
}
```

**Badge on tab:**
```tsx
<div className="relative">
  <Icon className="w-6 h-6" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</div>
```

#### When NOT to Show

Overlay mode pages (task-focused) don't show bottom tabs:
```tsx
// In RootLayoutContent.tsx - Overlay mode
return (
  <PageContext.Provider>
    <div className="min-h-screen flex">
      <Sidebar mode="overlay" isExpanded={isSidebarExpanded} />
      <div className="flex-1 min-w-0">
        <TopHeader />
        <div className="pt-16">{children}</div>
      </div>
    </div>
    {/* No BottomTabBar here! */}
  </PageContext.Provider>
);
```

**Why?** Task pages need maximum vertical space. Users can access navigation via hamburger menu.

## Design Patterns & Best Practices

### 1. Flexbox Scrolling Pattern

When you need a scrollable section within a flex container:

```tsx
<div className="flex flex-col h-[constraint]">
  <div className="flex-shrink-0">{/* Fixed header */}</div>

  <div className="flex-1 min-h-0 flex flex-col">
    <div className="flex-shrink-0">{/* Section header */}</div>
    <div className="flex-1 overflow-y-auto">
      {/* Scrollable content */}
    </div>
  </div>

  <div className="flex-shrink-0">{/* Fixed footer */}</div>
</div>
```

**Why `min-h-0`?**
By default, flex items have `min-height: auto`, which prevents them from shrinking below their content size. Setting `min-h-0` allows the flex item to shrink, enabling the `overflow-y-auto` to work properly.

### 2. Route-Based UI Switching

```tsx
// Define static routes
const staticRoutes = ['/create', '/explore', '/settings', '/profile'];

// Check current route
const isStaticRoute = staticRoutes.includes(pathname || '');

// Render appropriate layout
if (isStaticRoute) {
  return <StaticLayout />;
}
return <OverlayLayout />;
```

### 3. Animation Configuration

For smooth, natural animations:

```tsx
transition={{
  type: "spring",        // Use spring physics
  stiffness: 300,        // How "tight" the spring is
  damping: 30,           // How quickly motion settles
  mass: 0.8              // Weight of the animated object
}}
```

- Higher stiffness = faster animation
- Higher damping = less bounce
- Lower mass = more responsive

### 4. Preventing Sidebar Content Overflow

```tsx
// Sidebar in overlay mode
<motion.div
  animate={{ width: isExpanded ? 256 : 0 }}
  className="... overflow-hidden flex-shrink-0"
>
```

- `overflow-hidden`: Hides content during collapse animation
- `flex-shrink-0`: Prevents flex container from shrinking sidebar

## Common Pitfalls & Solutions

### Problem 1: Content Scrolls Entire Page
**Symptom:** When you have many items, the entire sidebar grows instead of scrolling internally.

**Solution:**
```tsx
// ❌ Wrong - no height constraint
<div className="flex-1 overflow-y-auto">

// ✅ Correct - constrain with min-h-0
<div className="flex-1 min-h-0 flex flex-col">
  <div className="flex-1 overflow-y-auto">
```

### Problem 2: Sidebar Doesn't Push Content
**Symptom:** Sidebar overlays content instead of pushing it.

**Solution:**
```tsx
// ❌ Wrong - fixed positioning
<div className="fixed left-0 top-0 ...">

// ✅ Correct - flex layout with width animation
<motion.div animate={{ width: isExpanded ? 256 : 0 }} className="flex-shrink-0">
```

### Problem 3: Content Visible During Collapse
**Symptom:** Sidebar content shows briefly while collapsing.

**Solution:**
```tsx
// Add overflow-hidden to animated container
<motion.div className="... overflow-hidden">
```

### Problem 4: Sidebar Expands on Route Change
**Symptom:** Navigating to deep pages shows expanded sidebar briefly.

**Solution:**
```tsx
// Auto-collapse on route change
useEffect(() => {
  if (sidebarMode === 'overlay') {
    setIsSidebarExpanded(false);
  }
}, [pathname, sidebarMode]);
```

## Customization Guide

### Adding New Static Routes

```tsx
// In RootLayoutContent.tsx
const staticRoutes = [
  '/create',
  '/explore',
  '/settings',
  '/profile',
  '/your-new-route'  // Add here
];
```

### Adjusting Sidebar Width

```tsx
// Change all instances of 256 (width in pixels)
<motion.div animate={{ width: isExpanded ? 320 : 0 }}>  // New width
<div className="w-80 ...">  // w-80 = 320px in Tailwind
```

### Customizing Animation Speed

```tsx
transition={{
  type: "spring",
  stiffness: 400,    // Increase for faster
  damping: 35,       // Increase for less bounce
  mass: 0.8
}}
```

### Changing Top Header Height

```tsx
// In TopHeader.tsx
<div className="... h-20">  // Change from h-16

// In RootLayoutContent.tsx (overlay mode)
<div className="pt-20">  // Match header height
```

## Testing Checklist

When implementing or modifying this pattern:

- [ ] Static routes show persistent sidebar
- [ ] Overlay routes start with collapsed sidebar
- [ ] Sidebar pushes content (not overlay)
- [ ] My Apps section scrolls internally when many apps
- [ ] Hamburger icon transitions smoothly
- [ ] Logo links to `/create`
- [ ] Title in header expands sidebar when clicked (only when collapsed)
- [ ] Page title/actions update correctly via context
- [ ] Sidebar auto-collapses when navigating to deep pages
- [ ] No content overflow during animations
- [ ] Smooth animation performance (60fps)

## Related Patterns

- **Route Navigation Patterns** (`route-navigation-patterns.mdc`) - How to structure routes
- **Clerk Convex Setup** (`clerk-convex-setup.mdc`) - User context in sidebar

## Step-by-Step Implementation Guide

### Prerequisites

```bash
npm install framer-motion lucide-react
npm install -D tailwindcss
```

### Step 1: Create the PageContext System

**File: `src/components/RootLayoutContent.tsx`**

```tsx
'use client';

import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import BottomTabBar from '@/components/layout/BottomTabBar';

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

// Define static routes
const staticRoutes = ['/create', '/appstore', '/profile'];
const getDefaultMode = (path: string | null): SidebarMode => {
  if (!path) return 'overlay';
  return staticRoutes.includes(path) ? 'static' : 'overlay';
};

export default function RootLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [pageActions, setPageActions] = useState<ReactNode>(null);
  const [pageSidebarMode, setPageSidebarMode] = useState<SidebarMode>(getDefaultMode(pathname));

  const shouldShowSidebar = !pathname?.startsWith('/welcome');

  useEffect(() => {
    setPageSidebarMode(getDefaultMode(pathname));
  }, [pathname]);

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

  const contextValue = {
    title: pageTitle,
    setTitle: setPageTitle,
    breadcrumbs: pageBreadcrumbs,
    setBreadcrumbs: setPageBreadcrumbs,
    actions: pageActions,
    setActions: setPageActions,
    sidebarMode: pageSidebarMode,
    setSidebarMode: setPageSidebarMode,
  };

  if (pageSidebarMode === 'static') {
    return (
      <PageContext.Provider value={contextValue}>
        <div className="min-h-screen flex">
          <Sidebar mode="static" isExpanded={true} onExpandedChange={setIsSidebarExpanded} />
          <div className="flex-1 min-w-0 pb-20 md:pb-0">{children}</div>
        </div>
        <BottomTabBar />
      </PageContext.Provider>
    );
  }

  return (
    <PageContext.Provider value={contextValue}>
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
          <div className="pt-16">{children}</div>
        </div>
      </div>
    </PageContext.Provider>
  );
}
```

### Step 2: Update Root Layout

**File: `src/app/layout.tsx`**

```tsx
import RootLayoutContent from '@/components/RootLayoutContent';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
```

### Step 3: Create Component Files

Create the three component files following the implementations detailed in sections 2, 3, and 5:
- `src/components/layout/Sidebar.tsx` 
- `src/components/layout/TopHeader.tsx`
- `src/components/layout/BottomTabBar.tsx`

### Step 4: Use in Pages

**Static page (browse mode):**
```tsx
// src/app/appstore/page.tsx
export default function AppStorePage() {
  // No usePageHeader needed - static mode
  return (
    <div className="p-6">
      <h1>App Store</h1>
      {/* Content */}
    </div>
  );
}
```

**Overlay page (task mode):**
```tsx
// src/app/manage-app/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { usePageHeader } from '@/components/RootLayoutContent';

export default function ManageAppPage({ params }) {
  const { setBreadcrumbs, setActions } = usePageHeader();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Create', href: '/create' },
      { label: 'My App' }
    ]);

    setActions(
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
        Save
      </button>
    );
  }, [setBreadcrumbs, setActions]);

  return (
    <div className="p-6">
      {/* Content */}
    </div>
  );
}
```

### Step 5: Test

1. Navigate to static pages (`/create`, `/appstore`) → See persistent sidebar on desktop
2. Navigate to deep pages → See collapsible sidebar with top header
3. Resize browser → Verify mobile bottom tabs appear
4. Click hamburger → Sidebar should slide in/out smoothly

## Quick Reference

### When to Use Each Mode

| Page Type | Mode | Has Header | Has Bottom Tabs | Example |
|-----------|------|------------|-----------------|---------|
| Browse/List | Static | No | Yes (mobile) | `/appstore`, `/create` |
| Task/Detail | Overlay | Yes | No | `/manage-app/[id]` |
| Auth/Onboarding | None | No | No | `/welcome` |

### CSS Classes Cheat Sheet

```css
/* Layout */
min-h-screen flex           /* Full height flex container */
flex-1 min-w-0             /* Flexible content that can shrink */
pb-20 md:pb-0              /* Mobile bottom padding for tabs */
pt-16                      /* Top padding for fixed header */

/* Sidebar */
w-64                       /* 256px width (16 * 4 = 64 * 4 = 256) */
h-screen                   /* Full viewport height */
sticky top-0               /* Static mode: sticks on scroll */
fixed left-0 top-0         /* Overlay mode: fixed overlay */

/* Scrolling */
flex-1 min-h-0             /* Critical for internal scrolling */
overflow-y-auto            /* Enable vertical scroll */

/* Z-index */
z-50                       /* Sidebar overlay, bottom tabs */
z-40                       /* Top header, mobile backdrop */
```

### Context Hook Usage

```tsx
// Import
import { usePageHeader } from '@/components/RootLayoutContent';

// In component
const { setTitle, setBreadcrumbs, setActions, setSidebarMode } = usePageHeader();

// Set title
useEffect(() => {
  setTitle('Page Title');
}, [setTitle]);

// Set breadcrumbs
useEffect(() => {
  setBreadcrumbs([
    { label: 'Home', href: '/' },
    { label: 'Current' }
  ]);
}, [setBreadcrumbs]);

// Set actions
useEffect(() => {
  setActions(<button>Action</button>);
  return () => setActions(null);  // Cleanup
}, [setActions]);
```

## Dependencies

- `framer-motion`: Animation library for sidebar collapse/expand
- `next/navigation`: `usePathname()` for route detection
- `lucide-react`: Icons (PanelLeftClose, etc.)
- `tailwindcss`: Utility classes for layout
- Next.js 14+ with App Router

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+ (safe area support)
- Android Chrome 90+
- Progressive enhancement: Works without JS (static links)

## Accessibility

- Keyboard navigation: Tab through all interactive elements
- ARIA labels: Hamburger button has `aria-label`
- Focus indicators: Visible focus rings on all buttons
- Screen readers: Semantic HTML with proper landmarks
- Reduced motion: Respects `prefers-reduced-motion` (recommended addition)

## Performance Considerations

1. **Sidebar content**: Lazy load user apps list if > 50 items
2. **Animations**: Use `transform` and `opacity` (GPU-accelerated)
3. **Re-renders**: Context updates only affect TopHeader, not children
4. **Image optimization**: Use Next.js `<Image>` for logos and icons

## Version History

- **v1.0** (Oct 2024) - Initial implementation with two-mode system
  - Static mode for root pages with persistent sidebar
  - Overlay mode for deep pages with collapsible sidebar
  - PageContext system for dynamic headers
  - Mobile bottom tabs for browse pages
  - Internal scrolling for dynamic lists
  - Spring physics animations
  - Full TypeScript support
