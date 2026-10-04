import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
  const s = await db.setting.findMany({ where: { key: { in: ['resolverTemplate', 'resolverEnabled'] } } });
  const map: any = {}; s.forEach(x => map[x.key] = x.value);
  if (map.resolverEnabled === 'false') return NextResponse.json({ error: 'Resolver disabled by admin' }, { status: 503 });
  if (!map.resolverTemplate) return NextResponse.json({ error: 'Resolver template not configured in admin panel' }, { status: 500 });
  const target = map.resolverTemplate.replace('{url}', encodeURIComponent(url));
  try {
    const r = await fetch(target, { signal: AbortSignal.timeout(15000) });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: 'Resolve failed', detail: e.message }, { status: 502 });
  }
}