'use client';

import { ReactNode } from 'react';
import { ConvexClientProvider } from './convex-provider';
import { ProfileProvider } from './profile-provider';
import UIProviders from './ui-providers';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ConvexClientProvider>
      <ProfileProvider>
        <UIProviders>
          {children}
        </UIProviders>
      </ProfileProvider>
    </ConvexClientProvider>
  );
}