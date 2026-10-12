'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PoolDashboard() {
  const [metrics, setMetrics] = useState({ total: 0, active: 0, dead: 0, youtube: 0, instagram: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pool/list')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const stats = data.reduce(
            (acc, curr) => {
              acc.total++;
              if (curr.status === 'active') acc.active++;
              else acc.dead++;
              if (curr.platform === 'youtube') acc.youtube++;
              if (curr.platform === 'instagram') acc.instagram++;
              return acc;
            },
            { total: 0, active: 0, dead: 0, youtube: 0, instagram: 0 }
          );
          setMetrics(stats);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold text-indigo-400">Cookie Pool</h1>
        <div className="flex gap-3 flex-wrap">
          <Link href="/admin/pool/manage" className="btn btn-primary">Manage</Link>
          <Link href="/admin/pool/inject" className="btn btn-secondary">+ Add Cookie</Link>
          <Link href="/admin/pool/settings" className="btn btn-secondary">Settings</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border-l-4 border-neutral-700">
          <p className="text-sm font-semibold text-neutral-400 uppercase">Total</p>
          <p className="text-2xl font-bold mt-2">{metrics.total}</p>
        </div>
        <div className="card border-l-4 border-emerald-500">
          <p className="text-sm font-semibold text-neutral-400 uppercase">Active</p>
          <p className="text-2xl font-bold mt-2">{metrics.active}</p>
        </div>
        <div className="card border-l-4 border-rose-500">
          <p className="text-sm font-semibold text-neutral-400 uppercase">Failed</p>
          <p className="text-2xl font-bold mt-2">{metrics.dead}</p>
        </div>
        <div className="card border-l-4 border-indigo-500">
          <p className="text-sm font-semibold text-neutral-400 uppercase">Platforms</p>
          <p className="text-lg font-bold mt-2">YT: {metrics.youtube} | IG: {metrics.instagram}</p>
        </div>
      </div>
    </div>
  );
}
