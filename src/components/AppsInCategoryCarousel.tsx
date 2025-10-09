'use client';

import Link from 'next/link';
import AppListCarousel from '@/components/AppListCarousel';
import { Id } from '@convex/_generated/dataModel';

interface App {
  _id: Id<'apps'>;
  name: string;
  description?: string;
  category?: string;
  iconUrl?: string;
}

interface AppsInCategoryCarouselProps {
  category: string;
  apps: App[];
}

export default function AppsInCategoryCarousel({ category, apps }: AppsInCategoryCarouselProps) {
  return (
    <AppListCarousel
      title={category}
      apps={apps}
      headerAction={
        apps.length > 1 ? (
          <Link
            href={`/appstore/category/${encodeURIComponent(category)}`}
            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            See All
          </Link>
        ) : undefined
      }
    />
  );
}
