import { SignJWT, jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-change-me');
export async function createToken() {
  return await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(secret);
}
export async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, secret); return payload.role === 'admin'; }
  catch { return false; }
}
export const COOKIE_NAME = 'vidnest_admin';