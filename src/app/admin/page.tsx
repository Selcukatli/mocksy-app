'use client';

import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Id } from '@convex/_generated/dataModel';
import AppsTable from './_components/AppsTable';
import PublishToProdModal from './_components/PublishToProdModal';
import Toast from '@/components/Toast';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { usePageHeader } from '@/components/RootLayoutContent';
import AdminSkeleton from './_components/AdminSkeleton';
import TableSkeleton from './_components/TableSkeleton';

export default function AdminPage() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded } = useUser();
  const { setBreadcrumbs, setSidebarMode } = usePageHeader();

  // Check if we're on dev deployment (only dev needs to publish to prod)
  const isDevDeployment = useMemo(() => {
    const currentUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';
    return currentUrl.includes('localhost') || 
           currentUrl.includes('squid') || // Dev pattern (e.g., fantastic-squid-750)
           !currentUrl.includes('orca'); // Prod pattern (e.g., energized-orca-703)
  }, []);

  useEffect(() => {
    setSidebarMode('overlay');
    setBreadcrumbs([{ label: 'Admin' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - setting static values
  
  // ALWAYS call all hooks - no conditional logic
  const isAdmin = useQuery(api.features.profiles.queries.isCurrentUserAdmin);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [appToPublish, setAppToPublish] = useState<Id<'apps'> | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Debounce search query to avoid excessive queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only query apps after Clerk is loaded AND user is confirmed admin
  const shouldQueryApps = isClerkLoaded && isAdmin === true;
  
  // Memoize query args to prevent unnecessary re-queries
  const queryArgs = useMemo(() => {
    if (!shouldQueryApps) return "skip" as const;
    
    return {
      searchQuery: debouncedSearchQuery || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      featuredFilter: featuredFilter !== 'all' ? featuredFilter : undefined,
    };
  }, [shouldQueryApps, debouncedSearchQuery, categoryFilter, statusFilter, featuredFilter]);
  
  const apps = useQuery(api.adminActions.getAllAppsForAdmin, queryArgs);
  
  // Keep track of the last successful data to avoid showing skeleton on refetch
  const [lastApps, setLastApps] = useState<typeof apps>(undefined);
  
  useEffect(() => {
    if (apps !== undefined) {
      setLastApps(apps);
    }
  }, [apps]);
  
  // Use lastApps to display while refetching to avoid flickering
  const displayApps = apps !== undefined ? apps : lastApps;
  
  const featureAppMutation = useMutation(api.adminActions.featureApp);
  const unfeatureAppMutation = useMutation(api.adminActions.unfeatureApp);
  const deleteAppMutation = useMutation(api.apps.deleteApp);
  const updateAppStatusMutation = useMutation(api.adminActions.updateAppStatus);
  const publishToProdAction = useAction(api.adminActions.publishAppToProd);

  // Get unique categories including from all apps (not just published)
  const allCategories = useMemo(() => {
    if (!displayApps) return [];
    const categorySet = new Set<string>();
    displayApps.forEach((app: typeof displayApps[number]) => {
      if (app.category) categorySet.add(app.category);
    });
    return Array.from(categorySet).sort();
  }, [displayApps]);


  const handleFeature = useCallback(async (appId: Id<'apps'>) => {
    try {
      const result = await featureAppMutation({ appId });
      setToastMessage(result.message);
      setToastType(result.success ? 'success' : 'error');
      setShowToast(true);
    } catch (error) {
      console.error('Error featuring app:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to feature app';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  }, [featureAppMutation]);

  const handleUnfeature = useCallback(async (appId: Id<'apps'>) => {
    try {
      const result = await unfeatureAppMutation({ appId });
      setToastMessage(result.message);
      setToastType(result.success ? 'success' : 'error');
      setShowToast(true);
    } catch (error) {
      console.error('Error unfeaturing app:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unfeature app';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  }, [unfeatureAppMutation]);

  const handleDelete = useCallback(async (appId: Id<'apps'>) => {
    try {
      await deleteAppMutation({ appId });
      setToastMessage('App deleted successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting app:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete app';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  }, [deleteAppMutation]);

  const handleView = useCallback((appId: Id<'apps'>) => {
    window.open(`/appstore/${appId}`, '_blank');
  }, []);

  const handleStatusChange = useCallback(async (appId: Id<'apps'>, status: 'draft' | 'published') => {
    try {
      const result = await updateAppStatusMutation({ appId, status });
      setToastMessage(result.message);
      setToastType(result.success ? 'success' : 'error');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating app status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update app status';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  }, [updateAppStatusMutation]);

  const handlePublishToProd = useCallback(async (appId: Id<'apps'>) => {
    // Show the confirmation modal
    setAppToPublish(appId);
  }, []);

  const confirmPublishToProd = useCallback(async () => {
    if (!appToPublish) return;

    setIsPublishing(true);
    try {
      const result = await publishToProdAction({ appId: appToPublish });
      setToastMessage(result.message);
      setToastType(result.success ? 'success' : 'error');
      setShowToast(true);
      setAppToPublish(null);
    } catch (error) {
      console.error('Error publishing to prod:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish to production';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsPublishing(false);
    }
  }, [appToPublish, publishToProdAction]);

  // Show initial loading only when we don't know if user is admin yet
  // Don't unmount the component when refetching data (filter changes)
  const isInitialLoading = !isClerkLoaded || isAdmin === undefined;
  const hasFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || featuredFilter !== 'all';

  // Initial loading state - show full skeleton
  if (isInitialLoading) {
    return <AdminSkeleton />;
  }

  // Not admin state
  if (isAdmin === false) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access the admin dashboard.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Admin content
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold">Apps Management</h1>
        </div>

        {/* Stats */}
        {displayApps && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Total Apps</p>
              <p className="text-2xl font-bold mt-1">{displayApps.length}</p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Featured Apps</p>
              <p className="text-2xl font-bold mt-1">
                {displayApps.filter((a: typeof displayApps[number]) => a.isFeatured).length}
              </p>
            </div>
            <div className="bg-card rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Published Apps</p>
              <p className="text-2xl font-bold mt-1">
                {displayApps.filter((a: typeof displayApps[number]) => a.status === 'published' || !a.status).length}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Filters</h2>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setFeaturedFilter('all');
                }}
                className="ml-auto text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Featured Filter */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'featured' | 'not-featured')}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Apps</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>
        </div>

        {/* Apps Table */}
        {displayApps === undefined ? (
          <TableSkeleton />
        ) : displayApps.length > 0 ? (
          <AppsTable
            apps={displayApps}
            onFeature={handleFeature}
            onUnfeature={handleUnfeature}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
            onPublishToProd={isDevDeployment ? handlePublishToProd : undefined}
          />
        ) : (
          <div className="bg-card rounded-xl border p-12 text-center">
            <p className="text-muted-foreground">
              {hasFilters ? 'No apps found matching your filters.' : 'No apps yet.'}
            </p>
          </div>
        )}
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />

      <PublishToProdModal
        isOpen={appToPublish !== null}
        app={appToPublish ? displayApps?.find((a: { _id: Id<'apps'> }) => a._id === appToPublish) || null : null}
        onConfirm={confirmPublishToProd}
        onClose={() => setAppToPublish(null)}
        isPublishing={isPublishing}
      />
    </>
  );
}
