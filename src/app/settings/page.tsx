'use client';

import { useEffect } from 'react';
import { usePageHeader } from '@/components/RootLayoutContent';

export default function SettingsPage() {
  const { setBreadcrumbs, setSidebarMode } = usePageHeader();

  useEffect(() => {
    setSidebarMode('overlay');
    setBreadcrumbs([
      { label: 'Profile', href: '/profile' },
      { label: 'Settings' }
    ]);
  }, [setBreadcrumbs, setSidebarMode]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account and preferences
        </p>
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center">
          <p className="text-muted-foreground">Settings coming soon...</p>
        </div>
      </div>
    </div>
  );
}
