'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

interface UIProvidersProps {
  children: ReactNode;
}

export default function UIProviders({ children }: UIProvidersProps) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
