import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const accounts = await db.accountPool.findMany({
      orderBy: [{ platform: 'asc' }, { healthScore: 'desc' }],
      select: { id: true, platform: true, username: true, status: true, healthScore: true, priority: true, successCount: true, failCount: true, lastUsedAt: true, lastHealthCheck: true, expiresAt: true, createdAt: true },
    });
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
