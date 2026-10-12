import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.POOL_INJECTION_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { platform, username, cookiesEncrypted, proxyAssigned, userAgent, expiresAt } = body;
    if (!platform || !username || !cookiesEncrypted || !expiresAt) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const account = await db.accountPool.upsert({
      where: { username },
      update: { cookiesEncrypted, proxyAssigned: proxyAssigned || null, userAgent: userAgent || null, status: 'active', healthScore: 100, failCount: 0, expiresAt: new Date(expiresAt) },
      create: { platform, username, cookiesEncrypted, proxyAssigned: proxyAssigned || null, userAgent: userAgent || null, expiresAt: new Date(expiresAt) },
    });
    return NextResponse.json({ success: true, id: account.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
