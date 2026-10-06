import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const providers = await db.extractionProvider.findMany({
      orderBy: { priority: 'asc' },
    });
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const provider = await db.extractionProvider.create({
      data: {
        name: body.name,
        type: body.type,
        priority: Number(body.priority) || 0,
        enabled: body.enabled ?? true,
        platforms: JSON.stringify(body.platforms || []),
        config: JSON.stringify(body.config || {}),
      },
    });
    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const provider = await db.extractionProvider.update({
      where: { id: body.id },
      data: {
        name: body.name,
        type: body.type,
        priority: Number(body.priority),
        enabled: body.enabled,
        platforms: JSON.stringify(body.platforms || []),
        config: JSON.stringify(body.config || {}),
      },
    });
    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.extractionProvider.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
