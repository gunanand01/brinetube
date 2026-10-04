import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { detectPlatform, buildEmbedUrl } from '@/lib/resolver';
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const video = await db.video.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const platform = await detectPlatform(video.url);
    const embedUrl = await buildEmbedUrl(video.url, platform);
    return NextResponse.json({ video: { ...video, embedUrl } });
  }
  const videos = await db.video.findMany({ orderBy: { createdAt: 'desc' }, take: 60 });
  return NextResponse.json({ videos });
}
export async function POST(req: NextRequest) {
  const { url, title } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });
  const platform = await detectPlatform(url);
  const video = await db.video.create({ data: { url, title: title || url.slice(0, 80), platform: platform?.name || 'unknown' } });
  return NextResponse.json({ video });
}
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.video.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}