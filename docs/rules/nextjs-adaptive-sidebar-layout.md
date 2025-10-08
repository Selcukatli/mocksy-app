# Next.js Adaptive Sidebar Layout Pattern

## Overview

This document describes a flexible two-mode sidebar layout system specifically for Next.js applications (App Router) that adapts based on route depth. The pattern provides an optimal UX by showing a persistent sidebar on root pages and a collapsible sidebar on deep pages.

## Architecture

### Two-Mode System

**Static Mode** (Root Pages)
- Used for: `/create`, `/explore`, `/settings`, `/profile`
- Sidebar is always expanded and visible
- No top header needed (sidebar contains all navigation)
- Takes up dedicated flex space (256px width)
- Cannot be collapsed

**Overlay Mode** (Deep Pages)
- Used for: `/app/[id]`, `/new-app`, nested routes
- Sidebar starts collapsed by default
- Top header with hamburger button and page title
- When expanded, sidebar pushes content (not overlay)
- Animates smoothly with spring physics

### Key Benefits

1. **Context-aware navigation**: Root pages show full navigation; deep pages maximize content space
2. **Consistent behavior**: Sidebar always pushes content (never overlays or creates backdrop)
3. **Smooth animations**: Spring physics for natural feel
4. **Responsive to route changes**: Auto-collapses when navigating to deep pages

## Implementation

### File Structure

```
src/
├── components/
│   ├── RootLayoutContent.tsx    # Main layout orchestrator
│   └── layout/
│       ├── Sidebar.tsx          # Two-mode sidebar component
│       └── TopHeader.tsx        # Header for overlay mode
```

### 1. Root Layout Content (`RootLayoutContent.tsx`)

This component orchestrates the entire layout and determines which mode to use.

**Key Implementation Details:**

```tsx
// Determine mode based on route
const staticRoutes = ['/create', '/explore', '/settings', '/profile'];
const isStaticRoute = staticRoutes.includes(pathname || '');
const sidebarMode: SidebarMode = isStaticRoute ? 'static' : 'overlay';

// Auto-collapse sidebar when navigating to overlay mode pages
useEffect(() => {
  if (sidebarMode === 'overlay') {
    setIsSidebarExpanded(false);
  }
}, [pathname, sidebarMode]);
```

**Static Mode Layout:**
```tsx
<div className="min-h-screen flex">
  <Sidebar mode="static" isExpanded={true} />
  <div className="flex-1 min-w-0">{children}</div>
</div>
```

**Overlay Mode Layout:**
```tsx
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
    <div className="pt-12">{children}</div>
  </div>
</div>
```

**Critical CSS Classes:**
- `min-h-screen flex`: Ensures full height and flex layout
- `flex-1 min-w-0`: Allows content to shrink below minimum width (prevents overflow)

### 2. Sidebar Component (`Sidebar.tsx`)

Single component with two rendering modes.

**Static Mode:**
```tsx
<div className="w-64 h-screen flex flex-col bg-background">
  <Link href="/create" className="h-16 flex items-center px-4">
    {/* Logo */}
  </Link>

  <div className="flex-1 flex flex-col min-h-0">
    <nav className="flex-shrink-0">
      {/* Main navigation items */}
    </nav>

    <div className="mx-12 my-4 border-t flex-shrink-0" />

    {/* My Apps Section - Scrollable */}
    <div className="flex-1 min-h-0 flex flex-col px-2">
      <div className="flex-shrink-0">MY APPS</div>
      <div className="flex-1 overflow-y-auto">
        {/* App list */}
      </div>
    </div>
  </div>

  <div className="p-2">
    {/* Settings, theme, profile */}
  </div>
</div>
```

**Overlay Mode:**
```tsx
<motion.div
  animate={{ width: isExpanded ? 256 : 0 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8
  }}
  className="h-screen flex flex-col bg-background border-r overflow-hidden flex-shrink-0"
>
  {/* Same content as static mode, wrapped in AnimatePresence */}
</motion.div>
```

**Critical Implementation Notes:**

1. **Internal Scrolling for My Apps:**
```tsx
// Parent container with flex layout
<div className="flex-1 flex flex-col min-h-0">

  // Fixed-height sections
  <nav className="flex-shrink-0">...</nav>
  <div className="flex-shrink-0">...</div>

  // Scrollable section
  <div className="flex-1 min-h-0 flex flex-col px-2">
    <div className="flex-shrink-0">{/* Header */}</div>
    <div className="flex-1 overflow-y-auto">
      {/* Scrollable content */}
    </div>
  </div>
</div>
```

The `min-h-0` is **critical** - it allows flex children to shrink below their content size, enabling internal scrolling.

2. **Animation Configuration:**
   - Use `width` animation (not `x` translation) so content pushes naturally
   - Spring physics provides natural, fluid motion
   - `overflow-hidden` prevents content from showing during collapse

3. **Height Management:**
   - Use `h-screen` (not `h-full`) to constrain to viewport height
   - This ensures sidebar doesn't expand beyond screen bounds

### 3. Top Header (`TopHeader.tsx`)

Simple header for overlay mode with hamburger button and page title.

**Implementation:**

```tsx
<div className="fixed top-0 left-0 right-0 z-40 h-16 bg-background/95 backdrop-blur">
  <div className="flex h-full items-center justify-between px-6">
    {/* Left: Hamburger + Title */}
    <div className="flex items-center gap-4 min-w-0">
      <button
        onClick={onMenuClick}
        className="w-12 h-12 rounded-lg hover:bg-muted flex items-center justify-center transition-all group"
      >
        {isSidebarExpanded ? (
          <PanelLeftClose className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
        ) : (
          {/* Custom hamburger SVG */}
        )}
      </button>

      {title && (
        <button
          onClick={!isSidebarExpanded ? onMenuClick : undefined}
          className={cn(
            "text-lg font-semibold truncate transition-colors",
            !isSidebarExpanded && "hover:text-muted-foreground cursor-pointer"
          )}
        >
          {title}
        </button>
      )}
    </div>

    {/* Right: Actions */}
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
</div>
```

**Key Features:**
- Title is clickable and expands sidebar when collapsed
- Custom hamburger icon (two dashes, top dash wider)
- Smooth icon transition between hamburger and collapse states
- Hover effects for better UX

### 4. Page Context System

Allows pages to set their header title and actions dynamically.

```tsx
// In RootLayoutContent.tsx
const PageContext = createContext<PageContextValue | null>(null);

export function usePageHeader() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageHeader must be used within RootLayoutContent');
  }
  return context;
}

// In any page component
const { setTitle, setActions } = usePageHeader();

useEffect(() => {
  setTitle('My Page Title');
  setActions(
    <>
      <Button>Action 1</Button>
      <Button>Action 2</Button>
    </>
  );
}, [setTitle, setActions]);
```

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

## Dependencies

- `framer-motion`: Animation library for sidebar collapse/expand
- `next/navigation`: `usePathname()` for route detection
- `lucide-react`: Icons (PanelLeftClose, etc.)
- `tailwindcss`: Utility classes for layout

## Version History

- **v1.0** (Oct 2024) - Initial implementation with two-mode system
  - Static mode for root pages
  - Overlay mode (push, not overlay) for deep pages
  - Internal scrolling for My Apps
  - Spring physics animations
