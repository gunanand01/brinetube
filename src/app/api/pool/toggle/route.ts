import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const { id, currentStatus } = await req.json();
    const target = currentStatus === 'active' ? 'disabled' : 'active';
    const account = await db.accountPool.update({ where: { id }, data: { status: target, failCount: 0 } });
    return NextResponse.json({ success: true, status: account.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
