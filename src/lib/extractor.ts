import { db } from './db';

export async function getOrFetchExtraction(url: string, platform: string = 'youtube') {
  const cached = await db.extractionCache.findUnique({
    where: { originalUrl: url }
  });

  if (cached && cached.expiresAt > new Date()) {
    return {
      title: cached.title,
      thumbnails: JSON.parse(cached.thumbnails as string),
      formats: JSON.parse(cached.formats as string)
    };
  }

  const providers = await db.extractionProvider.findMany({
    where: { enabled: true },
    orderBy: { priority: 'asc' }
  });

  let lastError = "No active providers found for this platform.";

  for (const provider of providers) {
    try {
      const platformsList = JSON.parse(provider.platforms as string);
      if (!platformsList.includes(platform)) continue;

      const config = JSON.parse(provider.config as string);
      let result;

      switch (provider.type) {
        case 'ytdlp_cookie':
        case 'ytdlp_proxy':
          result = await handleRenderExtractor(url, config, platform, provider.type);
          break;
        case 'cobalt':
          result = await handleCobalt(url, config);
          break;
        case 'piped':
          result = await handlePiped(url, config);
          break;
        case 'rapidapi_yt':
        case 'rapidapi_ig':
          result = await handleRapidAPI(url, config);
          break;
        default:
          throw new Error(`Unknown provider type: ${provider.type}`);
      }

      if (result && result.formats && result.formats.length > 0) {
        await db.extractionProvider.update({
          where: { id: provider.id },
          data: { successCount: { increment: 1 }, lastStatus: 'success', lastTestAt: new Date() }
        });

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2);
        
        await db.extractionCache.upsert({
          where: { originalUrl: url },
          update: { title: result.title, thumbnails: JSON.stringify(result.thumbnails), formats: JSON.stringify(result.formats), expiresAt, platform },
          create: { originalUrl: url, title: result.title, thumbnails: JSON.stringify(result.thumbnails), formats: JSON.stringify(result.formats), expiresAt, platform }
        });

        return result;
      }
    } catch (error: any) {
      lastError = error.message;
      
      const updatedProvider = await db.extractionProvider.update({
        where: { id: provider.id },
        data: { failCount: { increment: 1 }, lastError: error.message, lastStatus: 'failed', lastTestAt: new Date() }
      });

      if (updatedProvider.failCount >= 5 && updatedProvider.successCount === 0) {
        await db.extractionProvider.update({
          where: { id: provider.id },
          data: { enabled: false }
        });
      }
    }
  }

  throw new Error(lastError);
}

async function handleRenderExtractor(url: string, config: any, platform: string, type: string) {
  const extractorUrl = config.extractorUrl || process.env.EXTRACTOR_URL || 'https://brinetube-cf-proxy.brinetube.workers.dev/extract';
  let payload: any = { url };

  if (type === 'ytdlp_cookie') {
    const activeCookie = await db.cookie.findFirst({
      where: { platform: platform, active: true, expiresAt: { gt: new Date() } },
      orderBy: [{ priority: 'asc' }, { lastUsedAt: 'asc' }]
    });

    if (activeCookie) {
      payload.cookies = activeCookie.cookies;
      await db.cookie.update({
        where: { id: activeCookie.id },
        data: { lastUsedAt: new Date() }
      });
    } else {
      throw new Error('No active cookies found in the pool.');
    }
  }

  if (type === 'ytdlp_proxy' && config.proxy) {
    payload.proxy = config.proxy;
  }

  const response = await fetch(extractorUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(`Render extraction failed: ${response.status}`);
  const data = await response.json();
  if (!data.formats || data.formats.length === 0) throw new Error('Blocked by IP or Invalid Cookie.');

  return data;
}

async function handleCobalt(url: string, config: any) {
  const apiUrl = config.apiUrl || 'https://co.wuk.sh/api/json';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ url, videoQuality: "1080" })
  });
  if (!response.ok) throw new Error('Cobalt API failed');
  const data = await response.json();
  if (data.status === 'error') throw new Error(data.text);
  
  return { title: 'Extracted Video', thumbnails: [], formats: [{ url: data.url, quality: '1080p', ext: 'mp4', hasAudio: true, hasVideo: true }] };
}

async function handlePiped(url: string, config: any) {
  const instance = config.instance || 'https://pipedapi.kavin.rocks';
  const videoId = url.split('v=')[1]?.split('&')[0];
  if (!videoId) throw new Error('Invalid YouTube URL');

  const response = await fetch(`${instance}/streams/${videoId}`);
  if (!response.ok) throw new Error('Piped API failed');
  const data = await response.json();

  const formats = data.videoStreams.map((stream: any) => ({ url: stream.url, quality: stream.quality, ext: stream.format, hasAudio: !stream.videoOnly, hasVideo: true }));
  return { title: data.title, thumbnails: [{ url: data.thumbnailUrl }], formats };
}

async function handleRapidAPI(url: string, config: any) {
  const videoId = url.split('v=')[1]?.split('&')[0];
  if (!videoId) throw new Error('Invalid URL');

  const response = await fetch(`https://${config.apiHost}/dl?id=${videoId}`, { headers: { 'x-rapidapi-key': config.apiKey, 'x-rapidapi-host': config.apiHost } });
  if (!response.ok) throw new Error('RapidAPI failed');
  const data = await response.json();
  
  return { title: data.title || 'Video', thumbnails: [], formats: [{ url: data.link, quality: '720p', ext: 'mp4', hasAudio: true, hasVideo: true }] };
}

