import { db } from '@/lib/db';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let settings = {
    siteName: 'BrineTube',
    tagline: 'Stream & Download Media Directly',
    logoUrl: '',
    platformsLabel: 'Supported Platforms',
  };

  try {
    const dbSettings = await db.siteSettings.findUnique({ where: { id: 1 } });
    if (dbSettings) {
      settings = {
        siteName: dbSettings.siteName || 'BrineTube',
        tagline: dbSettings.tagline || 'Stream & Download Media Directly',
        logoUrl: dbSettings.logoUrl || '',
        platformsLabel: 'Supported Platforms',
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return <HomeClient settings={settings} />;
}
