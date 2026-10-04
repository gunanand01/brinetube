const fs = require('fs');
const path = require('path');

const files = {

'package.json': `{
  "name": "vidnest",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "jose": "^5.9.6",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.3"
  }
}`,

'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;`,

'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};`,

'postcss.config.js': `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`,

'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,

'.env.example': `ADMIN_PASSWORD=admin123
JWT_SECRET=change-this-to-a-long-random-string-please
DATABASE_URL="file:./dev.db"
RESOLVER_PROXY_URL=""`,

'.gitignore': `node_modules
.next
.env
*.db
.DS_Store`,

'prisma/schema.prisma': `generator client { provider = "prisma-client-js" }
datasource db { provider = "sqlite"; url = env("DATABASE_URL") }

model Video {
  id        String   @id @default(cuid())
  title     String
  url       String
  platform  String   @default("unknown")
  views     Int      @default(0)
  createdAt DateTime @default(now())
}
model Ad {
  id        String   @id @default(cuid())
  name      String
  code      String
  placement String
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
}
model Setting { key String @id; value String }
model AdPattern {
  id      String  @id @default(cuid())
  pattern String  @unique
  enabled Boolean @default(false)
  config  String
}
model Platform {
  id        String  @id @default(cuid())
  name      String
  pattern   String
  embedType String
  embedTemplate String?
  needsProxy Boolean @default(false)
  enabled   Boolean @default(true)
  order     Int     @default(0)
}
model DailyLimit { ip String @id; count Int @default(0); resetAt DateTime }`,

'src/lib/db.ts': `import { PrismaClient } from '@prisma/client';
const g = globalThis as any;
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = db;`,

'src/lib/auth.ts': `import { SignJWT, jwtVerify } from 'jose';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-change-me');
export async function createToken() {
  return await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(secret);
}
export async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, secret); return payload.role === 'admin'; }
  catch { return false; }
}
export const COOKIE_NAME = 'vidnest_admin';`,

'src/lib/resolver.ts': `import { db } from './db';
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
  if (platform.needsProxy) return \`/api/resolve?url=\${encodeURIComponent(url)}\`;
  if (!platform.embedTemplate) return url;
  const id = url.split('/').filter(Boolean).pop() || '';
  return platform.embedTemplate.replace('{id}', id).replace('{url}', url);
}`,

'src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;
body { background: #0a0a0a; color: #e5e5e5; }
.btn { @apply px-4 py-2 rounded-lg font-medium transition; }
.btn-primary { @apply bg-blue-600 hover:bg-blue-700 text-white; }
.btn-secondary { @apply bg-neutral-800 hover:bg-neutral-700 text-neutral-200; }
.btn-danger { @apply bg-red-600/20 hover:bg-red-600/40 text-red-400; }
.input { @apply w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-blue-600; }
.card { @apply bg-neutral-900 border border-neutral-800 rounded-xl p-4; }
.tag { @apply inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium; }`,

'src/app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'VidNest', description: 'Stream from any platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}`,

'src/app/page.tsx': `'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdSlot from '@/components/AdSlot';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/videos').then(r => r.json()).then(d => setVideos(d.videos || []));
    fetch('/api/platforms').then(r => r.json()).then(d => setPlatforms(d.platforms || []));
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d.settings || {}));
  }, []);

  async function add() {
    if (!url.trim()) return;
    setLoading(true);
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const d = await res.json();
    setLoading(false);
    if (d.video) { setUrl(''); router.push(\`/watch/\${d.video.id}\`); }
    else alert(d.error || 'Failed');
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{settings.siteName || 'VidNest'}</h1>
      <p className="text-neutral-400 text-sm mb-6">{settings.tagline || 'Paste any video link — play instantly.'}</p>
      <AdSlot placement="header" />
      <div className="card mb-8">
        <div className="flex gap-2">
          <input className="input" placeholder="Paste video link here..." value={url}
            onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
          <button className="btn btn-primary" onClick={add} disabled={loading}>{loading ? '...' : 'Play'}</button>
        </div>
      </div>
      {platforms.length > 0 && (
        <div className="mb-8 text-center">
          <p className="text-sm text-neutral-500 mb-3">{settings.platformsLabel || 'Supported platforms'}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {platforms.map(p => (<span key={p.id} className="tag">{p.name}</span>))}
          </div>
        </div>
      )}
      <AdSlot placement="grid" />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {videos.map(v => (
          <a key={v.id} href={\`/watch/\${v.id}\`} className="card hover:border-blue-600 transition">
            <div className="aspect-video bg-neutral-800 rounded-lg mb-3 flex items-center justify-center text-neutral-600">{v.platform}</div>
            <h3 className="font-medium truncate">{v.title}</h3>
            <p className="text-xs text-neutral-500 mt-1">{v.views} views</p>
          </a>
        ))}
      </section>
      <AdSlot placement="footer" />
    </main>
  );
}`,

'src/app/watch/[id]/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import AdGate from '@/components/AdGate';

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState<any>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    fetch(\`/api/videos?id=\${id}\`).then(r => r.json()).then(d => d.video && setVideo(d.video));
    fetch('/api/limits', { method: 'POST' }).then(r => r.json()).then(d => {
      if (d.blocked) setBlocked(d.message); else setUnlocked(true);
    });
  }, [id]);

  if (blocked) return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Limit reached</h1>
      <p className="text-neutral-400">{blocked}</p>
    </main>
  );

  if (!video) return <main className="p-8">Loading...</main>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <AdSlot placement="header" />
      {!unlocked ? <AdGate onComplete={() => setUnlocked(true)} /> : (
        <>
          <AdSlot placement="before_player" />
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
            <iframe src={video.embedUrl || video.url} className="w-full h-full" allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture" />
          </div>
          <AdSlot placement="after_player" />
          <h1 className="text-xl font-bold mb-2">{video.title}</h1>
          <p className="text-sm text-neutral-400">{video.platform} • {video.views} views</p>
        </>
      )}
      <AdSlot placement="footer" />
    </main>
  );
}`,

'src/components/AdSlot.tsx': `'use client';
import { useEffect, useState } from 'react';
export default function AdSlot({ placement }: { placement: string }) {
  const [ads, setAds] = useState<any[]>([]);
  useEffect(() => {
    fetch(\`/api/ads?placement=\${placement}\`).then(r => r.json()).then(d => setAds(d.ads || []));
  }, [placement]);
  useEffect(() => {
    ads.forEach(ad => {
      const c = document.getElementById(\`ad-\${ad.id}\`);
      if (!c) return;
      c.innerHTML = '';
      const div = document.createElement('div');
      div.innerHTML = ad.code;
      c.appendChild(div);
      c.querySelectorAll('script').forEach((old: any) => {
        const s = document.createElement('script');
        Array.from(old.attributes).forEach((a: any) => s.setAttribute(a.name, a.value));
        s.text = old.text;
        old.replaceWith(s);
      });
    });
  }, [ads]);
  if (!ads.length) return null;
  return <div className={\`my-4 ad-slot ad-\${placement}\`}>{ads.map(ad => <div key={ad.id} id={\`ad-\${ad.id}\`} />)}</div>;
}`,

'src/components/AdGate.tsx': `'use client';
import { useEffect, useState } from 'react';
import PopupAd from './PopupAd';
import InterstitialAd from './InterstitialAd';
export default function AdGate({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'modal'|'popup'|'interstitial'|'done'>('modal');
  const [config, setConfig] = useState<any>(null);
  useEffect(() => { fetch('/api/ads?pattern=all').then(r => r.json()).then(setConfig); }, []);
  useEffect(() => { if (stage === 'done') onComplete(); }, [stage]);
  if (!config) return <div className="card text-center py-12">Loading...</div>;
  if (stage === 'modal') return (
    <div className="card text-center py-12 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">{config.patternA?.title || 'Unlock more content'}</h2>
      <p className="text-neutral-400 mb-6">{config.patternA?.subtitle || 'Take action to continue'}</p>
      <button className="btn btn-primary w-full" onClick={() => setStage('popup')}>
        {config.patternA?.buttonText || 'View a short ad'}
      </button>
    </div>
  );
  if (stage === 'popup') return <PopupAd config={config.patternB} onComplete={() => setStage('interstitial')} />;
  if (stage === 'interstitial') return <InterstitialAd config={config.patternC} onComplete={() => setStage('done')} />;
  return null;
}`,

'src/components/PopupAd.tsx': `'use client';
import { useEffect, useRef, useState } from 'react';
export default function PopupAd({ config, onComplete }: any) {
  const [s, setS] = useState(config?.autoClose || 10);
  const [can, setCan] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!config?.enabled) { onComplete(); return; }
    const t = setInterval(() => setS((v: number) => {
      if (v <= 1) { setCan(true); clearInterval(t); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (ref.current && config?.code) {
      ref.current.innerHTML = config.code;
      ref.current.querySelectorAll('script').forEach((old: any) => {
        const n = document.createElement('script');
        Array.from(old.attributes).forEach((a: any) => n.setAttribute(a.name, a.value));
        n.text = old.text;
        old.replaceWith(n);
      });
    }
  }, [config?.code]);
  if (!config?.enabled) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-xl max-w-md w-full p-6 relative">
        <button disabled={!can} onClick={() => can && onComplete()}
          className="absolute top-2 right-2 disabled:opacity-30">✕</button>
        <div className="mb-2 text-sm">Auto-close in {s}s</div>
        <div ref={ref} className="min-h-[200px]" />
      </div>
    </div>
  );
}`,

'src/components/InterstitialAd.tsx': `'use client';
import { useEffect, useRef, useState } from 'react';
export default function InterstitialAd({ config, onComplete }: any) {
  const [clicked, setClicked] = useState(false);
  const [s, setS] = useState(config?.timer || 15);
  const [can, setCan] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && config?.code) {
      ref.current.innerHTML = config.code;
      ref.current.querySelectorAll('script').forEach((old: any) => {
        const n = document.createElement('script');
        Array.from(old.attributes).forEach((a: any) => n.setAttribute(a.name, a.value));
        n.text = old.text;
        old.replaceWith(n);
      });
    }
  }, [config?.code]);
  useEffect(() => {
    if (!clicked) return;
    const t = setInterval(() => setS((v: number) => {
      if (v <= 1) { setCan(true); clearInterval(t); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [clicked]);
  if (!config?.enabled) { onComplete(); return null; }
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-xl max-w-2xl w-full p-6">
        <div className="text-center font-bold mb-4">
          {config.instruction || 'Click on the ad and stay for 15 seconds to continue'}
        </div>
        <div onClick={() => !clicked && setClicked(true)}
          className="cursor-pointer border-2 border-dashed border-neutral-300 rounded-lg overflow-hidden min-h-[300px]">
          <div ref={ref} />
        </div>
        <div className="text-center mt-4">
          {clicked ? (can ? (
            <button className="btn btn-primary" onClick={onComplete}>Continue</button>
          ) : <div className="text-lg font-bold">Wait {s}s...</div>) :
          <div className="text-lg font-bold text-neutral-500">Click the ad to start timer</div>}
        </div>
      </div>
    </div>
  );
}`,

'src/app/api/auth/route.ts': `import { NextRequest, NextResponse } from 'next/server';
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
}`,

'src/app/api/videos/route.ts': `import { NextRequest, NextResponse } from 'next/server';
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
}`,

'src/app/api/ads/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(req: NextRequest) {
  const placement = req.nextUrl.searchParams.get('placement');
  const pattern = req.nextUrl.searchParams.get('pattern');
  if (pattern === 'all') {
    const ps = await db.adPattern.findMany();
    const cfg: any = {};
    ps.forEach(p => cfg[\`pattern\${p.pattern}\`] = { enabled: p.enabled, ...JSON.parse(p.config || '{}') });
    return NextResponse.json(cfg);
  }
  if (placement) {
    const ads = await db.ad.findMany({ where: { placement, enabled: true } });
    return NextResponse.json({ ads });
  }
  return NextResponse.json({ ads: await db.ad.findMany({ orderBy: { createdAt: 'desc' } }) });
}
export async function POST(req: NextRequest) {
  const b = await req.json();
  if (b.type === 'pattern') {
    const existing = await db.adPattern.findUnique({ where: { pattern: b.pattern } });
    const data = { enabled: b.enabled, config: JSON.stringify(b.config || {}) };
    const p = existing ? await db.adPattern.update({ where: { pattern: b.pattern }, data }) : await db.adPattern.create({ data: { pattern: b.pattern, ...data } });
    return NextResponse.json({ pattern: p });
  }
  const ad = await db.ad.create({ data: { name: b.name || 'Untitled', code: b.code, placement: b.placement, enabled: b.enabled ?? true } });
  return NextResponse.json({ ad });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const ad = await db.ad.update({ where: { id: b.id }, data: { name: b.name, code: b.code, placement: b.placement, enabled: b.enabled } });
  return NextResponse.json({ ad });
}
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.ad.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}`,

'src/app/api/limits/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
function getIp(req: NextRequest) { return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'; }
export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const s = await db.setting.findUnique({ where: { key: 'dailyLimit' } });
  const limit = s ? parseInt(s.value) : 5;
  const now = new Date();
  const resetAt = new Date(now); resetAt.setHours(24, 0, 0, 0);
  let r = await db.dailyLimit.findUnique({ where: { ip } });
  if (!r || r.resetAt < now) r = await db.dailyLimit.upsert({ where: { ip }, update: { count: 0, resetAt }, create: { ip, count: 0, resetAt } });
  if (r.count >= limit) {
    const m = await db.setting.findUnique({ where: { key: 'blockMessage' } });
    return NextResponse.json({ blocked: true, message: m?.value || 'Daily limit reached.', count: r.count, limit });
  }
  await db.dailyLimit.update({ where: { ip }, data: { count: r.count + 1 } });
  return NextResponse.json({ blocked: false, count: r.count + 1, limit });
}
export async function GET(req: NextRequest) {
  const ip = getIp(req);
  const s = await db.setting.findUnique({ where: { key: 'dailyLimit' } });
  const r = await db.dailyLimit.findUnique({ where: { ip } });
  return NextResponse.json({ ip, limit: s ? parseInt(s.value) : 5, count: r?.count || 0 });
}`,

'src/app/api/settings/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET() {
  const s = await db.setting.findMany();
  const m: any = {}; s.forEach(x => m[x.key] = x.value);
  return NextResponse.json({ settings: m });
}
export async function POST(req: NextRequest) {
  const b = await req.json();
  for (const [k, v] of Object.entries(b)) {
    await db.setting.upsert({ where: { key: k }, update: { value: String(v) }, create: { key: k, value: String(v) } });
  }
  return NextResponse.json({ ok: true });
}`,

'src/app/api/platforms/route.ts': `import { NextRequest, NextResponse } from 'next/server';
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
}`,

'src/app/api/resolve/route.ts': `import { NextRequest, NextResponse } from 'next/server';
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
}`,

'src/app/admin/layout.tsx': `import Link from 'next/link';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800 px-6 py-3 flex gap-6 items-center flex-wrap">
        <Link href="/admin" className="font-bold text-blue-500">VidNest Admin</Link>
        <Link href="/admin/videos" className="text-sm hover:text-blue-400">Videos</Link>
        <Link href="/admin/platforms" className="text-sm hover:text-blue-400">Platforms</Link>
        <Link href="/admin/ads" className="text-sm hover:text-blue-400">Ads</Link>
        <Link href="/admin/limits" className="text-sm hover:text-blue-400">Limits</Link>
        <Link href="/admin/resolver" className="text-sm hover:text-blue-400">Resolver</Link>
        <Link href="/admin/settings" className="text-sm hover:text-blue-400">Settings</Link>
        <Link href="/" className="text-sm ml-auto hover:text-blue-400">← Site</Link>
      </nav>
      <div className="p-6 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}`,

'src/app/admin/login/page.tsx': `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [p, setP] = useState('');
  const [e, setE] = useState('');
  const router = useRouter();
  async function go() {
    const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: p }) });
    if (r.ok) router.push('/admin'); else setE('Wrong password');
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <input type="password" className="input mb-3" placeholder="Password" value={p}
          onChange={e => setP(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} />
        {e && <p className="text-red-500 text-sm mb-3">{e}</p>}
        <button className="btn btn-primary w-full" onClick={go}>Login</button>
      </div>
    </div>
  );
}`,

'src/app/admin/page.tsx': `'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Dash() {
  const router = useRouter();
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(a => {
      if (!a.authed) return router.push('/admin/login');
      Promise.all([fetch('/api/videos').then(r => r.json()), fetch('/api/ads').then(r => r.json())])
        .then(([v, ad]) => setD({ videos: v.videos || [], ads: ad.ads || [] }));
    });
  }, []);
  if (!d) return <p>Loading...</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="card"><p className="text-sm text-neutral-400">Videos</p><p className="text-3xl font-bold">{d.videos.length}</p></div>
        <div className="card"><p className="text-sm text-neutral-400">Ads</p><p className="text-3xl font-bold">{d.ads.length}</p></div>
      </div>
      <button className="btn btn-secondary mt-6"
        onClick={async () => { await fetch('/api/auth', { method: 'DELETE' }); router.push('/admin/login'); }}>
        Logout
      </button>
    </div>
  );
}`,

'src/app/admin/videos/page.tsx': `'use client';
import { useEffect, useState } from 'react';
export default function Vids() {
  const [vs, setVs] = useState<any[]>([]);
  const [u, setU] = useState(''); const [t, setT] = useState('');
  async function load() { setVs((await fetch('/api/videos').then(r => r.json())).videos || []); }
  useEffect(() => { load(); }, []);
  async function add() {
    if (!u) return;
    await fetch('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: u, title: t }) });
    setU(''); setT(''); load();
  }
  async function del(id: string) {
    if (!confirm('Delete?')) return;
    await fetch(\`/api/videos?id=\${id}\`, { method: 'DELETE' }); load();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      <div className="card mb-6">
        <input className="input mb-2" placeholder="URL" value={u} onChange={e => setU(e.target.value)} />
        <input className="input mb-2" placeholder="Title (optional)" value={t} onChange={e => setT(e.target.value)} />
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>
      <div className="space-y-2">
        {vs.map(v => (
          <div key={v.id} className="card flex justify-between items-center">
            <div><p className="font-medium">{v.title}</p><p className="text-xs text-neutral-500">{v.platform} • {v.views} views</p></div>
            <button className="btn btn-danger" onClick={() => del(v.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}`,

'src/app/admin/platforms/page.tsx': `'use client';
import { useEffect, useState } from 'react';
export default function Platforms() {
  const [ps, setPs] = useState<any[]>([]);
  const [f, setF] = useState({ name: '', pattern: '', embedTemplate: '', needsProxy: false, order: 0 });
  async function load() { setPs((await fetch('/api/platforms').then(r => r.json())).platforms || []); }
  useEffect(() => { load(); }, []);
  async function add() {
    if (!f.name || !f.pattern) return;
    await fetch('/api/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    setF({ name: '', pattern: '', embedTemplate: '', needsProxy: false, order: 0 }); load();
  }
  async function del(id: string) { if (!confirm('Delete?')) return; await fetch(\`/api/platforms?id=\${id}\`, { method: 'DELETE' }); load(); }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Platforms</h1>
      <div className="card mb-6 space-y-2">
        <input className="input" placeholder="Name (e.g. YouTube)" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <input className="input" placeholder="URL pattern (e.g. youtube.com)" value={f.pattern} onChange={e => setF({ ...f, pattern: e.target.value })} />
        <input className="input" placeholder="Embed template (e.g. https://youtube.com/embed/{id})" value={f.embedTemplate} onChange={e => setF({ ...f, embedTemplate: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.needsProxy} onChange={e => setF({ ...f, needsProxy: e.target.checked })} />
          Needs proxy (Terabox, DiskWala)
        </label>
        <button className="btn btn-primary" onClick={add}>Add Platform</button>
      </div>
      <div className="space-y-2">
        {ps.map(p => (
          <div key={p.id} className="card flex justify-between items-center">
            <div><p className="font-medium">{p.name}</p><p className="text-xs text-neutral-500">{p.pattern} • {p.embedTemplate || 'proxy'}</p></div>
            <button className="btn btn-danger" onClick={() => del(p.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}`,

'src/app/admin/ads/page.tsx': `'use client';
import { useEffect, useState } from 'react';
const PLACEMENTS = ['header','footer','sidebar','grid','before_player','after_player','popup','popunder','interstitial'];
export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [pat, setPat] = useState<any>({});
  const [f, setF] = useState({ name: '', code: '', placement: 'header' });
  async function load() {
    const [a, p] = await Promise.all([fetch('/api/ads').then(r => r.json()), fetch('/api/ads?pattern=all').then(r => r.json())]);
    setAds(a.ads || []); setPat(p);
  }
  useEffect(() => { load(); }, []);
  async function add() { if (!f.code) return; await fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }); setF({ name: '', code: '', placement: 'header' }); load(); }
  async function del(id: string) { if (!confirm('Delete?')) return; await fetch(\`/api/ads?id=\${id}\`, { method: 'DELETE' }); load(); }
  async function toggle(id: string, enabled: boolean) { await fetch('/api/ads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, enabled }) }); load(); }
  async function savePat(pattern: string, enabled: boolean, config: any) { await fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'pattern', pattern, enabled, config }) }); load(); }
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Ads</h1>
      <div className="card">
        <h2 className="font-bold mb-3">Add Ad</h2>
        <input className="input mb-2" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <select className="input mb-2" value={f.placement} onChange={e => setF({ ...f, placement: e.target.value })}>
          {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <textarea className="input mb-2 font-mono text-xs" rows={6} placeholder="Ad HTML/script" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} />
        <button className="btn btn-primary" onClick={add}>Save</button>
      </div>
      <div>
        <h2 className="font-bold mb-3">Existing ({ads.length})</h2>
        <div className="space-y-2">
          {ads.map(a => (
            <div key={a.id} className="card flex justify-between items-center">
              <div><p className="font-medium">{a.name}</p><p className="text-xs text-neutral-500">{a.placement} • {a.enabled ? 'ON' : 'OFF'}</p></div>
              <div className="flex gap-2">
                <button className="btn btn-secondary" onClick={() => toggle(a.id, !a.enabled)}>{a.enabled ? 'Disable' : 'Enable'}</button>
                <button className="btn btn-danger" onClick={() => del(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="font-bold">Patterns</h2>
        <Pat id="A" t="Pattern A — Unlock Modal" c={pat.patternA}
          d={{ title: 'Unlock more content', subtitle: 'Take action to continue', buttonText: 'View a short ad' }}
          fields={['title','subtitle','buttonText']} onSave={savePat} />
        <Pat id="B" t="Pattern B — Popup Ad" c={pat.patternB}
          d={{ code: '<div>Ad code</div>', autoClose: 10 }} fields={['code','autoClose']} onSave={savePat} />
        <Pat id="C" t="Pattern C — Click + Timer" c={pat.patternC}
          d={{ code: '<div>Ad code</div>', timer: 15, instruction: 'Click on the ad and stay for 15 seconds to continue' }}
          fields={['code','timer','instruction']} onSave={savePat} />
      </div>
    </div>
  );
}
function Pat({ id, t, c, d, fields, onSave }: any) {
  const [en, setEn] = useState(c?.enabled || false);
  const [v, setV] = useState<any>(() => { const i: any = {}; fields.forEach((f: string) => i[f] = c?.[f] ?? d[f]); return i; });
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">{t}</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={en} onChange={e => setEn(e.target.checked)} /> Enabled
        </label>
      </div>
      {fields.map((f: string) => (
        <div key={f} className="mb-2">
          <label className="text-xs text-neutral-400 block mb-1">{f}</label>
          {f === 'code' ? (
            <textarea className="input font-mono text-xs" rows={4} value={v[f]} onChange={e => setV({ ...v, [f]: e.target.value })} />
          ) : (
            <input className="input" type={['timer','autoClose'].includes(f) ? 'number' : 'text'} value={v[f]}
              onChange={e => setV({ ...v, [f]: ['timer','autoClose'].includes(f) ? Number(e.target.value) : e.target.value })} />
          )}
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => onSave(id, en, v)}>Save</button>
    </div>
  );
}`,

'src/app/admin/limits/page.tsx': `'use client';
import { useEffect, useState } from 'react';
export default function Lim() {
  const [l, setL] = useState(5);
  const [m, setM] = useState('Daily limit reached.');
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setL(parseInt(d.settings.dailyLimit || '5'));
      setM(d.settings.blockMessage || 'Daily limit reached.');
    });
  }, []);
  async function save() {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dailyLimit: l, blockMessage: m }) });
    alert('Saved');
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Limits</h1>
      <div className="card space-y-3">
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Videos per day per IP</label>
          <input type="number" className="input" value={l} onChange={e => setL(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Block message</label>
          <textarea className="input" rows={3} value={m} onChange={e => setM(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}`,

'src/app/admin/resolver/page.tsx': `'use client';
import { useEffect, useState } from 'react';
export default function Resolver() {
  const [t, setT] = useState('');
  const [en, setEn] = useState(true);
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setT(d.settings.resolverTemplate || '');
      setEn(d.settings.resolverEnabled !== 'false');
    });
  }, []);
  async function save() {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolverTemplate: t, resolverEnabled: en ? 'true' : 'false' }) });
    alert('Saved');
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resolver (Terabox / DiskWala)</h1>
      <div className="card space-y-3">
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Resolver API template</label>
          <input className="input font-mono text-xs" placeholder="https://api.example.com/resolve?url={url}" value={t} onChange={e => setT(e.target.value)} />
          <p className="text-xs text-neutral-500 mt-1">Use <code>{'{url}'}</code> where the video URL should go.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={en} onChange={e => setEn(e.target.checked)} /> Resolver enabled
        </label>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}`,

'src/app/admin/settings/page.tsx': `'use client';
import { useEffect, useState } from 'react';
export default function Set() {
  const [s, setS] = useState<any>({});
  useEffect(() => { fetch('/api/settings').then(r => r.json()).then(d => setS(d.settings)); }, []);
  async function save() {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    alert('Saved');
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="card space-y-3">
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Site name</label>
          <input className="input" value={s.siteName || ''} onChange={e => setS({ ...s, siteName: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Tagline</label>
          <input className="input" value={s.tagline || ''} onChange={e => setS({ ...s, tagline: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Supported platforms label</label>
          <input className="input" value={s.platformsLabel || ''} onChange={e => setS({ ...s, platformsLabel: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}`
};

Object.entries(files).forEach(([filePath, content]) => {
  const full = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('✓', filePath);
});
console.log('\nDone. Run:');
console.log('  npm install');
console.log('  cp .env.example .env');
console.log('  npx prisma db push');
console.log('  npm run dev');

