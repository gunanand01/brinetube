'use client';
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
    if (d.video) { setUrl(''); router.push(`/watch/${d.video.id}`); }
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
          <a key={v.id} href={`/watch/${v.id}`} className="card hover:border-blue-600 transition">
            <div className="aspect-video bg-neutral-800 rounded-lg mb-3 flex items-center justify-center text-neutral-600">{v.platform}</div>
            <h3 className="font-medium truncate">{v.title}</h3>
            <p className="text-xs text-neutral-500 mt-1">{v.views} views</p>
          </a>
        ))}
      </section>
      <AdSlot placement="footer" />
    </main>
  );
}