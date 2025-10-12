'use client';

import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always render the layout - let the page handle showing different content
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Admin Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Admin Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold">Apps Management</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
