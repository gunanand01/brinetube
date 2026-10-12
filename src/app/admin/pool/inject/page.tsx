'use client';
import { useState } from 'react';

export default function ManualInject() {
  const [data, setData] = useState({
    platform: 'instagram',
    username: '',
    rawCookies: '',
    proxy: '',
  });
  const [saving, setSaving] = useState(false);

  const inject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.username || !data.rawCookies) {
      alert('Username aur cookies dono chahiye');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/pool/inject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_POOL_INJECTION_SECRET || ''),
      },
      body: JSON.stringify({
        platform: data.platform,
        username: data.username,
        cookiesEncrypted: data.rawCookies,
        proxyAssigned: data.proxy || null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    setSaving(false);
    if (res.ok) {
      alert('Cookie injected successfully');
      setData({ ...data, username: '', rawCookies: '', proxy: '' });
    } else {
      const err = await res.json();
      alert('Failed: ' + (err.error || 'Unknown'));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">Manual Cookie Inject</h2>
      <p className="text-sm text-neutral-400 mb-4">
        Note: Ye plain cookies DB mein daal raha hai — encryption next step mein aayega.
        Filhaal test ke liye use karo.
      </p>
      <form onSubmit={inject} className="card max-w-2xl space-y-4">
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Platform</label>
          <select value={data.platform} onChange={(e) => setData({ ...data, platform: e.target.value })} className="input">
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Username (unique label)</label>
          <input required className="input" value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} placeholder="insta_account_01" />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Cookies (Netscape format — poora content)</label>
          <textarea
            required
            rows={8}
            className="input font-mono text-xs"
            value={data.rawCookies}
            onChange={(e) => setData({ ...data, rawCookies: e.target.value })}
            placeholder="# Netscape HTTP Cookie File&#10;.instagram.com	TRUE	/	TRUE	1234567890	sessionid	..."
          />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Proxy (optional)</label>
          <input className="input" value={data.proxy} onChange={(e) => setData({ ...data, proxy: e.target.value })} placeholder="http://user:pass@ip:port" />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          {saving ? 'Injecting...' : 'Inject Cookie'}
        </button>
      </form>
    </div>
  );
}
