import { db } from './db';

const EXTRACTOR_URL =
  process.env.EXTRACTOR_URL ||
  'https://brinetube-cf-proxy.brinetube.workers.dev/extract';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

async function getCookiesForPlatform(platform: string): Promise<string> {
  try {
    const cookie = await db.cookie.findUnique({
      where: { platform },
    });
    if (cookie && cookie.active && new Date() < cookie.expiresAt) {
      return cookie.cookies;
    }
  } catch (err) {
    console.error('Cookie fetch error:', err);
  }
  return '';
}

export async function getOrFetchExtraction(url: string, platform: string) {
  try {
    // 1. Check Turso Cache
    const cached = await db.extractionCache.findUnique({
      where: { originalUrl: url },
    });

    if (cached && new Date() < cached.expiresAt) {
      return {
        title: cached.title,
        thumbnails: JSON.parse(cached.thumbnails),
        formats: JSON.parse(cached.formats),
        source: 'cache',
      };
    }

    let extractedData;

    // 2. Route to Render server (with cookies)
    const cookies = await getCookiesForPlatform(platform);

    const res = await fetch(EXTRACTOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, cookies }),
    });

    if (!res.ok) throw new Error('Extraction failed');

    extractedData = await res.json();

    // 3. Failsafe
    if (
      !extractedData ||
      !extractedData.formats ||
      extractedData.formats.length === 0
    ) {
      throw new Error('No playable formats found');
    }

    // 4. Save to Turso Cache (2 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    await db.extractionCache.upsert({
      where: { originalUrl: url },
      update: {
        title: extractedData.title || 'Video',
        thumbnails: JSON.stringify(extractedData.thumbnails || []),
        formats: JSON.stringify(extractedData.formats || []),
        expiresAt,
      },
      create: {
        originalUrl: url,
        platform: platform,
        title: extractedData.title || 'Video',
        thumbnails: JSON.stringify(extractedData.thumbnails || []),
        formats: JSON.stringify(extractedData.formats || []),
        expiresAt,
      },
    });

    return { ...extractedData, source: 'live' };
  } catch (error) {
    console.error('Extractor Helper Error:', error);
    throw error;
  }
}
