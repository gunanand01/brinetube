import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET() {
  const s = await db.setting.findMany();
  const m: any = {}; s.forEach(x => m[x.key] = x.value);
  return NextResponse.json({ settings: m });
}
export async function POST(req: NextRequest) {
  const b = await req.json();
  for (const [k, v] of Object.entries(b)) {
    await db.setting.upsert({ where: { key: k }, update: { value: String(v) }, create: { key: k, value: String(v) } });
  }
  return NextResponse.json({ ok: true });
}