'use client';

import AuthModal from './AuthModal';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

/**
 * LoginDialog - A wrapper around AuthModal for backward compatibility
 * Shows an authentication modal to prompt users to sign in
 */
export default function LoginDialog({
  isOpen,
  onClose,
  title = 'Login Required',
  message = 'Please sign in to continue with this action.',
}: LoginDialogProps) {
  return (
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      mode="sign-in"
      title={title}
      description={message}
    />
  );
}

