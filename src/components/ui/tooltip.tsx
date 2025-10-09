'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  show?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, show = false, side = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => !show && setIsVisible(false)}
      >
        {children}
      </div>
      {(isVisible || show) && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap',
            'animate-in fade-in-0 zoom-in-95',
            sideClasses[side]
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 rotate-45',
              side === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
              side === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
              side === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
              side === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
            )}
          />
        </div>
      )}
    </div>
  );
}
