import { NextRequest, NextResponse } from 'next/server';
import { createToken, verifyToken, COOKIE_NAME } from '@/lib/auth';
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== (process.env.ADMIN_PASSWORD || 'admin123'))
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  const token = await createToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*30, path: '/' });
  return res;
}
export async function GET(req: NextRequest) {
  const t = req.cookies.get(COOKIE_NAME)?.value;
  if (!t) return NextResponse.json({ authed: false });
  return NextResponse.json({ authed: await verifyToken(t) });
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}