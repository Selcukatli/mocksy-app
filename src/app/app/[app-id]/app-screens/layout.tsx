import type { ReactNode } from 'react';

interface AppScreensLayoutProps {
  children: ReactNode;
  preview: ReactNode;
}

export default function AppScreensLayout({ children, preview }: AppScreensLayoutProps) {
  return (
    <>
      {children}
      {preview}
    </>
  );
}
