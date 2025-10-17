'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useEffect } from 'react';

import GenerationProgress from './components/GenerationProgress';

export default function GenerationPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params['app-id'] as Id<'apps'>;

  const appStatus = useQuery(api.apps.getAppGenerationStatus, { appId });
  const jobStatus = useQuery(api.appGenerationJobs.getAppGenerationJobByAppId, { appId });

  // If app doesn't exist or user doesn't have access, redirect
  useEffect(() => {
    if (appStatus === null) {
      router.push('/');
    }
  }, [appStatus, router]);

  if (!appStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <GenerationProgress appStatus={appStatus} jobStatus={jobStatus} appId={appId} />
    </div>
  );
}
