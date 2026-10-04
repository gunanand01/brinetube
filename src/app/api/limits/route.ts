import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
function getIp(req: NextRequest) { return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'; }
export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const s = await db.setting.findUnique({ where: { key: 'dailyLimit' } });
  const limit = s ? parseInt(s.value) : 5;
  const now = new Date();
  const resetAt = new Date(now); resetAt.setHours(24, 0, 0, 0);
  let r = await db.dailyLimit.findUnique({ where: { ip } });
  if (!r || r.resetAt < now) r = await db.dailyLimit.upsert({ where: { ip }, update: { count: 0, resetAt }, create: { ip, count: 0, resetAt } });
  if (r.count >= limit) {
    const m = await db.setting.findUnique({ where: { key: 'blockMessage' } });
    return NextResponse.json({ blocked: true, message: m?.value || 'Daily limit reached.', count: r.count, limit });
  }
  await db.dailyLimit.update({ where: { ip }, data: { count: r.count + 1 } });
  return NextResponse.json({ blocked: false, count: r.count + 1, limit });
}
export async function GET(req: NextRequest) {
  const ip = getIp(req);
  const s = await db.setting.findUnique({ where: { key: 'dailyLimit' } });
  const r = await db.dailyLimit.findUnique({ where: { ip } });
  return NextResponse.json({ ip, limit: s ? parseInt(s.value) : 5, count: r?.count || 0 });
}