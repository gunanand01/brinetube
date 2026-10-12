'use client';
import { useEffect, useState } from 'react';

export default function PoolSettings() {
  const [form, setForm] = useState({
    healthCheckInterval: 6,
    youtubeTestUrl: 'https://youtube.com',
    instagramTestUrl: 'https://instagram.com',
    failThreshold: 5,
    minCookiesRequired: 3,
    generatorActive: false,
    proxyConfig: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/pool/settings').then((r) => r.json()).then((d) => d && setForm({ ...form, ...d }));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/pool/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_CRON_SECRET || ''),
      },
      body: JSON.stringify(form),
    });
    setSaving(false);
    alert(res.ok ? 'Saved' : 'Failed — CRON_SECRET check karo Vercel env mein');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">Pool Settings</h2>
      <form onSubmit={save} className="card max-w-2xl space-y-4">
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Health Check Interval (hours)</label>
          <input type="number" value={form.healthCheckInterval} onChange={(e) => setForm({ ...form, healthCheckInterval: +e.target.value })} className="input" />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">YouTube Test URL</label>
          <input type="text" value={form.youtubeTestUrl} onChange={(e) => setForm({ ...form, youtubeTestUrl: e.target.value })} className="input" />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Instagram Test URL</label>
          <input type="text" value={form.instagramTestUrl} onChange={(e) => setForm({ ...form, instagramTestUrl: e.target.value })} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-400 block mb-1">Fail Threshold</label>
            <input type="number" value={form.failThreshold} onChange={(e) => setForm({ ...form, failThreshold: +e.target.value })} className="input" />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-1">Min Cookies Required</label>
            <input type="number" value={form.minCookiesRequired} onChange={(e) => setForm({ ...form, minCookiesRequired: +e.target.value })} className="input" />
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Proxy Config (JSON)</label>
          <input type="text" value={form.proxyConfig || ''} onChange={(e) => setForm({ ...form, proxyConfig: e.target.value })} className="input font-mono text-xs" placeholder='{"gateway":"http://user:pass@ip:port"}' />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={form.generatorActive} onChange={(e) => setForm({ ...form, generatorActive: e.target.checked })} className="w-5 h-5" />
          <label className="text-sm">Generator Active</label>
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
