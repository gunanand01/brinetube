import { db } from './db';
export async function detectPlatform(url: string) {
  const platforms = await db.platform.findMany({ where: { enabled: true }, orderBy: { order: 'asc' } });
  const u = url.toLowerCase();
  for (const p of platforms) {
    if (u.includes(p.pattern.toLowerCase())) return p;
  }
  return null;
}
export async function buildEmbedUrl(url: string, platform: any): Promise<string> {
  if (!platform) return url;
  if (platform.needsProxy) return `/api/resolve?url=${encodeURIComponent(url)}`;
  if (!platform.embedTemplate) return url;
  const id = url.split('/').filter(Boolean).pop() || '';
  return platform.embedTemplate.replace('{id}', id).replace('{url}', url);
}