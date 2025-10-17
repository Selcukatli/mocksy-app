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
      href: '/generate',
      isActive: pathname === '/generate',
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
                    tab.isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground active:text-foreground'
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
                  tab.isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground active:text-foreground'
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

