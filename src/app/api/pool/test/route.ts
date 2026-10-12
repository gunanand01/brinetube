import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decryptCookies } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const account = await db.accountPool.findUnique({ where: { id } });
    if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const extractorUrl = process.env.EXTRACTOR_URL;
    if (!extractorUrl) return NextResponse.json({ error: 'EXTRACTOR_URL missing' }, { status: 500 });

    let cookies = '';
    try { cookies = decryptCookies(account.cookiesEncrypted); }
    catch { return NextResponse.json({ success: false, message: 'Decryption failed' }); }

    const testUrl = account.platform === 'youtube'
      ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      : 'https://www.instagram.com/reel/DeFHfLPzJYk/';

    const res = await fetch(extractorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl, cookies, proxy: account.proxyAssigned || undefined }),
      signal: AbortSignal.timeout(60000),
    });

    const ok = res.ok;
    await db.accountPool.update({
      where: { id },
      data: { lastHealthCheck: new Date(), healthScore: ok ? Math.min(account.healthScore + 5, 100) : Math.max(account.healthScore - 15, 0), failCount: ok ? account.failCount : account.failCount + 1 },
    });

    return NextResponse.json({ success: ok, message: ok ? 'Working' : 'Failed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
