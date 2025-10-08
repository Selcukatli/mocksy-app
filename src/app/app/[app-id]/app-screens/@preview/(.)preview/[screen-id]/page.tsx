'use client';

import { use } from 'react';
import AppScreenPreview from '../../../components/AppScreenPreview';
import { Id } from '@convex/_generated/dataModel';

interface PageProps {
  params: Promise<{
    'app-id': string;
    'screen-id': string;
  }>;
}

export default function PreviewInterceptPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'] as Id<'apps'>;
  const screenId = resolvedParams['screen-id'] as Id<'appScreens'>;

  return <AppScreenPreview appId={appId} screenId={screenId} />;
}
