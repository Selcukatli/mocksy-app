'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';
import ModalWithMascot from './ModalWithMascot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'sign-in' | 'sign-up';
  title?: string;
  description?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode = 'sign-in',
  title,
}: AuthModalProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDarkMode(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const clerkAppearance = {
    baseTheme: isDarkMode ? dark : undefined,
    variables: isDarkMode
      ? {
          colorBackground: '#09090b', // zinc-950
          colorInputBackground: '#18181b', // zinc-900
          colorInputText: '#fafafa', // zinc-50 for text
          colorText: '#e4e4e7', // zinc-200
        }
      : undefined,
    elements: {
      formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
      footerActionLink: 'text-primary hover:text-primary/90 transition-colors',
      card: 'shadow-none border-0',
      headerTitle: 'text-foreground text-2xl font-bold',
      headerSubtitle: 'text-muted-foreground',
      socialButtonsBlockButton: 'border-border hover:bg-muted transition-colors',
      formFieldLabel: 'text-foreground',
      formFieldInput: 'bg-background border-border text-foreground',
      identityPreviewText: 'text-foreground',
      identityPreviewEditButtonIcon: 'text-muted-foreground',
      dividerLine: 'bg-border',
      dividerText: 'text-muted-foreground',
      formFieldAction: 'text-primary hover:text-primary/90',
      footerAction: 'text-center',
    },
  };

  return (
    <ModalWithMascot isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      {!mounted ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      ) : mode === 'sign-up' ? (
        <SignUp appearance={clerkAppearance} routing="hash" />
      ) : (
        <SignIn appearance={clerkAppearance} routing="hash" />
      )}
    </ModalWithMascot>
  );
}

