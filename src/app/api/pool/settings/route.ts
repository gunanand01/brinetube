import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const s = await db.cookiePoolSettings.upsert({ where: { id: 'global_config' }, update: {}, create: {} });
    return NextResponse.json(s);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const b = await req.json();
    const s = await db.cookiePoolSettings.upsert({
      where: { id: 'global_config' },
      update: { healthCheckInterval: b.healthCheckInterval, youtubeTestUrl: b.youtubeTestUrl, instagramTestUrl: b.instagramTestUrl, failThreshold: b.failThreshold, minCookiesRequired: b.minCookiesRequired, generatorActive: b.generatorActive, proxyConfig: b.proxyConfig },
      create: { healthCheckInterval: b.healthCheckInterval ?? 6, youtubeTestUrl: b.youtubeTestUrl ?? 'https://youtube.com', instagramTestUrl: b.instagramTestUrl ?? 'https://instagram.com', failThreshold: b.failThreshold ?? 5, minCookiesRequired: b.minCookiesRequired ?? 3, generatorActive: b.generatorActive ?? false, proxyConfig: b.proxyConfig },
    });
    return NextResponse.json({ success: true, data: s });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
