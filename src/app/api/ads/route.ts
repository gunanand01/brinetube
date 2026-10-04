import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(req: NextRequest) {
  const placement = req.nextUrl.searchParams.get('placement');
  const pattern = req.nextUrl.searchParams.get('pattern');
  if (pattern === 'all') {
    const ps = await db.adPattern.findMany();
    const cfg: any = {};
    ps.forEach(p => cfg[`pattern${p.pattern}`] = { enabled: p.enabled, ...JSON.parse(p.config || '{}') });
    return NextResponse.json(cfg);
  }
  if (placement) {
    const ads = await db.ad.findMany({ where: { placement, enabled: true } });
    return NextResponse.json({ ads });
  }
  return NextResponse.json({ ads: await db.ad.findMany({ orderBy: { createdAt: 'desc' } }) });
}
export async function POST(req: NextRequest) {
  const b = await req.json();
  if (b.type === 'pattern') {
    const existing = await db.adPattern.findUnique({ where: { pattern: b.pattern } });
    const data = { enabled: b.enabled, config: JSON.stringify(b.config || {}) };
    const p = existing ? await db.adPattern.update({ where: { pattern: b.pattern }, data }) : await db.adPattern.create({ data: { pattern: b.pattern, ...data } });
    return NextResponse.json({ pattern: p });
  }
  const ad = await db.ad.create({ data: { name: b.name || 'Untitled', code: b.code, placement: b.placement, enabled: b.enabled ?? true } });
  return NextResponse.json({ ad });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const ad = await db.ad.update({ where: { id: b.id }, data: { name: b.name, code: b.code, placement: b.placement, enabled: b.enabled } });
  return NextResponse.json({ ad });
}
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.ad.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}