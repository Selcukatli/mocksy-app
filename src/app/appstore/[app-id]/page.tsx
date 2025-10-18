import { Metadata } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import AppStorePageClient from './_components/AppStorePageClient';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const appId = resolvedParams['app-id'];

  try {
    const appPreview = await fetchQuery(api.apps.getPublicAppPreview, {
      appId: appId as Id<'apps'>,
    });

    if (!appPreview) {
      return {
        title: 'App Not Found | Mocksy',
        description: 'This app doesn\'t exist or is no longer available.',
      };
    }

    const { app, creator } = appPreview;
    const creatorName = creator?.username || 'a creator';
    const description = app.description 
      ? `${app.description.slice(0, 150)}${app.description.length > 150 ? '...' : ''}`
      : `Check out ${app.name} on Mocksy - created by ${creatorName}`;

    return {
      title: `${app.name} | Mocksy`,
      description,
      openGraph: {
        title: app.name,
        description,
        type: 'website',
        images: [
          {
            url: `/appstore/${appId}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: app.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: app.name,
        description,
        images: [`/appstore/${appId}/opengraph-image`],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Mocksy - Idea to concept in seconds',
      description: 'Turn your app or game idea into visual concepts instantly.',
    };
  }
}

export default function AppStorePage(props: PageProps) {
  return <AppStorePageClient params={props.params} />;
}
