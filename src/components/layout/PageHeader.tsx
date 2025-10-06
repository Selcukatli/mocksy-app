'use client';

import { ReactNode, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  iconContainerClassName?: string;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
  showBackButton?: boolean;
  actionsClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const DEFAULT_ICON_CONTAINER =
  'w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0';

export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
  iconContainerClassName,
  className,
  contentClassName,
  children,
  onBack,
  backHref,
  backLabel = 'Go back',
  showBackButton,
  actionsClassName,
  titleClassName,
  subtitleClassName,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    if (backHref) {
      router.push(backHref);
      return;
    }

    router.push('/');
  }, [onBack, router, backHref]);

  const shouldShowBackButton = showBackButton ?? Boolean(onBack || backHref);

  return (
    <div className={cn('pt-6 pb-4 border-b', className)}>
      <div className={cn('flex flex-wrap items-center justify-between gap-4', contentClassName)}>
        <div className="flex items-center gap-4 min-w-0">
          {shouldShowBackButton ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/60"
              aria-label={backLabel}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}

          {icon ? (
            <div className={cn(DEFAULT_ICON_CONTAINER, iconContainerClassName)}>
              {icon}
            </div>
          ) : null}

          <div className="min-w-0">
            <div className={cn('text-3xl font-semibold tracking-tight leading-tight', titleClassName)}>
              {title}
            </div>
            {subtitle ? (
              <div className={cn('mt-1 text-sm text-muted-foreground', subtitleClassName)}>{subtitle}</div>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className={cn('flex flex-wrap items-center gap-2', actionsClassName)}>
            {actions}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export default PageHeader;
