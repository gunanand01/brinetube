import { db } from './db';

interface ExtractedMedia {
  title: string;
  thumbnails: { url: string }[];
  formats: {
    quality: string;
    url: string;
    ext: string;
    hasAudio: boolean;
    hasVideo: boolean;
  }[];
}

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// ==========================================
// HANDLERS
// ==========================================

async function handleCobalt(url: string, config: any): Promise<ExtractedMedia> {
  const apiUrl = config.apiUrl || 'https://co.wuk.sh/api/json';
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ url, videoQuality: '1080' }),
  });

  if (!res.ok) throw new Error('Cobalt API failed');
  const data = await res.json();

  if (data.status !== 'redirect' && data.status !== 'stream') {
    throw new Error('Cobalt did not return a direct link');
  }

  return {
    title: 'Cobalt Extracted Video',
    thumbnails: [],
    formats: [
      {
        quality: 'Best Available',
        url: data.url,
        ext: 'mp4',
        hasAudio: true,
        hasVideo: true,
      },
    ],
  };
}

async function handlePiped(url: string, config: any): Promise<ExtractedMedia> {
  const videoId = getYoutubeId(url);
  if (!videoId) throw new Error('Invalid YouTube URL for Piped');

  const instances = (config.instance || 'https://pipedapi.kavin.rocks')
    .split(',')
    .map((s: string) => s.trim());

  let lastError: any = null;

  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`);
      if (!res.ok) throw new Error(`Piped instance ${instance} failed`);

      const data = await res.json();

      const formats = [
        ...(data.videoStreams || []).map((s: any) => ({
          quality: s.quality || 'unknown',
          url: s.url,
          ext: s.mimeType ? s.mimeType.split(';')[0].split('/')[1] : 'mp4',
          hasAudio: !s.videoOnly,
          hasVideo: true,
        })),
        ...(data.audioStreams || []).map((s: any) => ({
          quality: 'audio',
          url: s.url,
          ext: s.mimeType ? s.mimeType.split(';')[0].split('/')[1] : 'm4a',
          hasAudio: true,
          hasVideo: false,
        })),
      ].filter((f: any) => f.url);

      if (formats.length === 0) throw new Error('No formats from Piped');

      return {
        title: data.title || 'YouTube Video',
        thumbnails: data.thumbnailUrl ? [{ url: data.thumbnailUrl }] : [],
        formats,
      };
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All Piped instances failed');
}

async function handleRapidAPI(url: string, config: any): Promise<ExtractedMedia> {
  const videoId = getYoutubeId(url);
  if (!videoId) throw new Error('Invalid YouTube URL for RapidAPI');
  if (!config.apiKey) throw new Error('RapidAPI key not configured');

  const res = await fetch(
    `https://${config.apiHost || 'yt-api.p.rapidapi.com'}/dl?id=${videoId}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': config.apiKey,
        'x-rapidapi-host': config.apiHost || 'yt-api.p.rapidapi.com',
      },
    }
  );

  if (!res.ok) throw new Error('RapidAPI extraction failed');
  const data = await res.json();

  const formats = (data.formats || [])
    .map((f: any) => ({
      quality: f.qualityLabel || f.quality || 'unknown',
      url: f.url,
      ext: f.mimeType?.split(';')[0]?.split('/')[1] || 'mp4',
      hasAudio: !!f.audioBitrate,
      hasVideo: !!f.qualityLabel,
    }))
    .filter((f: any) => f.url);

  if (formats.length === 0) throw new Error('No formats from RapidAPI');

  return {
    title: data.title || 'YouTube Video',
    thumbnails: [
      {
        url:
          data.thumbnail ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      },
    ],
    formats,
  };
}

async function handleRenderExtractor(
  url: string,
  config: any,
  platform: string
): Promise<ExtractedMedia> {
  const extractorUrl =
    process.env.EXTRACTOR_URL ||
    'https://brinetube-cf-proxy.brinetube.workers.dev/extract';

  const payload: any = { url };

  // Fetch cookies from Turso if available
  try {
    const cookie = await db.cookie.findFirst({
      where: {
        platform,
        active: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: [{ priority: 'asc' }, { lastUsedAt: 'asc' }],
    });

    if (cookie) {
      payload.cookies = cookie.cookies;
      await db.cookie
        .update({
          where: { id: cookie.id },
          data: { lastUsedAt: new Date() },
        })
        .catch(console.error);
    }
  } catch (err) {
    console.error('Cookie fetch error:', err);
  }

  if (config.proxy) payload.proxy = config.proxy;

  const res = await fetch(extractorUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Render extractor failed');
  const data = await res.json();

  if (!data.formats || data.formats.length === 0) {
    throw new Error('No formats from Render extractor');
  }

  return {
    title: data.title || 'Video',
    thumbnails: data.thumbnails || [],
    formats: data.formats || [],
  };
}

// ==========================================
// MAIN EXTRACTION
// ==========================================

export async function getOrFetchExtraction(url: string, platform: string) {
  try {
    // 1. Cache check
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

    // 2. Get providers by priority
    const providers = await db.extractionProvider.findMany({
      where: { enabled: true },
      orderBy: { priority: 'asc' },
    });

    let extractedData: ExtractedMedia | null = null;
    let successfulProvider = 'none';

    // 3. Fallback loop
    for (const provider of providers) {
      // Platform check
      try {
        const supportedPlatforms = JSON.parse(provider.platforms || '[]');
        if (
          !supportedPlatforms.includes(platform) &&
          !supportedPlatforms.includes('all')
        ) {
          continue;
        }
      } catch {
        continue;
      }

      const config = provider.config ? JSON.parse(provider.config) : {};

      try {
        let result: ExtractedMedia | null = null;

        if (provider.type === 'cobalt') {
          result = await handleCobalt(url, config);
        } else if (provider.type === 'piped' || provider.type === 'invidious') {
          result = await handlePiped(url, config);
        } else if (provider.type.startsWith('rapidapi')) {
          result = await handleRapidAPI(url, config);
        } else if (
          provider.type === 'ytdlp_cookie' ||
          provider.type === 'ytdlp_proxy' ||
          provider.type === 'ytdlp'
        ) {
          result = await handleRenderExtractor(url, config, platform);
        }

        if (result && result.formats && result.formats.length > 0) {
          extractedData = result;
          successfulProvider = provider.name;

          // Success analytics
          db.extractionProvider
            .update({
              where: { id: provider.id },
              data: {
                successCount: { increment: 1 },
                lastStatus: 'success',
                lastTestAt: new Date(),
              },
            })
            .catch(console.error);

          break;
        }
      } catch (error: any) {
        console.error(
          `[Fallback] Provider ${provider.name} failed:`,
          error.message
        );

        // Fail analytics
        const updated = await db.extractionProvider
          .update({
            where: { id: provider.id },
            data: {
              failCount: { increment: 1 },
              lastStatus: 'failed',
              lastError: error.message,
              lastTestAt: new Date(),
            },
          })
          .catch(() => null);

        // Auto-disable if 5+ consecutive fails
        if (updated && updated.failCount >= 5 && updated.successCount === 0) {
          await db.extractionProvider
            .update({
              where: { id: provider.id },
              data: { enabled: false },
            })
            .catch(console.error);
        }

        continue;
      }
    }

    // 4. All failed
    if (!extractedData) {
      throw new Error('All extraction providers failed');
    }

    // 5. Cache success
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

    return { ...extractedData, source: successfulProvider };
  } catch (error) {
    console.error('Extractor Helper Error:', error);
    throw error;
  }
}
