import { db } from '@/lib/db';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let settings = {
    siteName: 'BrineTube',
    tagline: 'Stream & Download Media Directly',
    logoUrl: '',
    platformsLabel: 'Supported platforms',
  };

  let platforms: any[] = [];
  let videos: any[] = [];

  try {
    const dbSettings = await db.siteSettings.findUnique({ where: { id: 1 } });
    if (dbSettings) {
      settings = {
        siteName: dbSettings.siteName || 'BrineTube',
        tagline: dbSettings.tagline || 'Stream & Download Media Directly',
        logoUrl: dbSettings.logoUrl || '',
        platformsLabel: 'Supported platforms',
      };
    }

    platforms = await db.platform.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });

    videos = await db.video.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
    });
  } catch (error) {
    console.error('Failed to load homepage data:', error);
  }

  return (
    <HomeClient
      settings={settings}
      platforms={platforms}
      videos={videos}
    />
  );
}
