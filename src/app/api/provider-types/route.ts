import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const types = await db.providerType.findMany({
      orderBy: { label: 'asc' },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching provider types:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.slug || !body.label) {
      return NextResponse.json(
        { error: 'slug and label required' },
        { status: 400 }
      );
    }

    const configFields = Array.isArray(body.configFields)
      ? body.configFields
      : [];

    const type = await db.providerType.create({
      data: {
        slug: body.slug.toLowerCase().trim(),
        label: body.label,
        description: body.description || null,
        configFields: JSON.stringify(configFields),
        enabled: body.enabled ?? true,
      },
    });

    return NextResponse.json({ success: true, type });
  } catch (error: any) {
    console.error('Error creating provider type:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const configFields = Array.isArray(body.configFields)
      ? body.configFields
      : [];

    const type = await db.providerType.update({
      where: { id: body.id },
      data: {
        slug: body.slug,
        label: body.label,
        description: body.description || null,
        configFields: JSON.stringify(configFields),
        enabled: body.enabled,
      },
    });

    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error('Error updating provider type:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    await db.providerType.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting provider type:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
