import { ImageResponse } from 'next/og';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

export const runtime = 'edge';
export const alt = 'App Preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ 'app-id': string }> }) {
  const resolvedParams = await params;
  const appId = resolvedParams['app-id'];

  try {
    // Fetch app data from Convex
    const appPreview = await fetchQuery(api.data.apps.getPublicAppPreview, {
      appId: appId as Id<'apps'>,
    });

    if (!appPreview) {
      // Return fallback image if app not found
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 20,
                }}
              >
                Mocksy
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Idea to concept in seconds
              </div>
            </div>
          </div>
        ),
        {
          ...size,
        }
      );
    }

    const { app } = appPreview;

    // Generate OG image with app details
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            position: 'relative',
          }}
        >
          {/* Background orbs */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              left: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.3)',
              filter: 'blur(80px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -100,
              right: -100,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'rgba(236, 72, 153, 0.3)',
              filter: 'blur(80px)',
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              padding: '80px',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            {/* Left side - App Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '600px',
              }}
            >
              {/* App Icon */}
              {app.iconUrl && (
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  width={120}
                  height={120}
                  style={{
                    borderRadius: 28,
                    marginBottom: 32,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  }}
                />
              )}

              {/* App Name */}
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 1.2,
                  marginBottom: 16,
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                {app.name}
              </div>

              {/* App Description */}
              {app.description && (
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.4,
                    marginBottom: 24,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {app.description}
                </div>
              )}

              {/* Category Tag */}
              {app.category && (
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 999,
                    fontSize: 20,
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {app.category}
                </div>
              )}
            </div>

            {/* Right side - Mocksy branding */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: 'white',
                  opacity: 0.9,
                }}
              >
                Mocksy
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Idea to concept in seconds
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Return fallback image on error
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 20,
              }}
            >
              Mocksy
            </div>
            <div
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              Idea to concept in seconds
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
}

