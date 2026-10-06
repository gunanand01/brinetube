import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookies = await db.cookie.findMany({
      orderBy: { platform: 'asc' },
    });
    return NextResponse.json(cookies);
  } catch (error) {
    console.error('Error fetching cookies:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, cookies, validityDays } = body;

    if (!platform || !cookies) {
      return NextResponse.json({ error: 'platform and cookies required' }, { status: 400 });
    }

    const days = Number(validityDays) || 14;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const cookie = await db.cookie.upsert({
      where: { platform },
      update: {
        cookies,
        expiresAt,
        pastedAt: new Date(),
        active: true,
      },
      create: {
        platform,
        cookies,
        expiresAt,
        active: true,
      },
    });

    return NextResponse.json({ success: true, cookie });
  } catch (error) {
    console.error('Error saving cookies:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.cookie.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting cookie:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
