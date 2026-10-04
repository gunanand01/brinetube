import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET() {
  const platforms = await db.platform.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ platforms });
}
export async function POST(req: NextRequest) {
  const b = await req.json();
  const p = await db.platform.create({ data: { name: b.name, pattern: b.pattern, embedType: b.embedType || 'iframe', embedTemplate: b.embedTemplate || null, needsProxy: b.needsProxy || false, enabled: b.enabled ?? true, order: b.order || 0 } });
  return NextResponse.json({ platform: p });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const p = await db.platform.update({ where: { id: b.id }, data: b });
  return NextResponse.json({ platform: p });
}
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.platform.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}