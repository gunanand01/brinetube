'use client';
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
}