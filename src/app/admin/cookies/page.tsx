'use client';

import { useState, useEffect } from 'react';

const PLATFORMS = [
  'youtube',
  'instagram',
  'terabox',
  'facebook',
  'twitter',
  'tiktok',
  'other',
];

export default function CookiesPage() {
  const [cookies, setCookies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    platform: 'youtube',
    cookies: '',
    validityDays: 14,
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const d = await fetch('/api/cookies').then((r) => r.json());
    setCookies(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // refresh every min
    return () => clearInterval(interval);
  }, []);

  async function save() {
    if (!form.cookies.trim()) {
      setMessage('Cookies required');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/cookies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setMessage('Cookies saved!');
      setForm({ ...form, cookies: '' });
      load();
    } else {
      setMessage('Error saving');
    }
  }

  async function del(id: string) {
    if (!confirm('Delete these cookies?')) return;
    await fetch(`/api/cookies?id=${id}`, { method: 'DELETE' });
    load();
  }

  function getTimeLeft(expiresAt: string) {
    const now = new Date().getTime();
    const exp = new Date(expiresAt).getTime();
    const diff = exp - now;

    if (diff <= 0) return { text: 'EXPIRED', color: 'red', percent: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    const totalDays = 14;
    const percent = Math.max(0, Math.min(100, (days / totalDays) * 100));

    let color = 'green';
    if (days < 3) color = 'red';
    else if (days < 7) color = 'yellow';

    return {
      text: `${days}d ${hours}h ${minutes}m`,
      color,
      percent,
    };
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6">Cookies Manager</h1>

      {message && (
        <div className="p-4 mb-6 rounded bg-green-500/20 text-green-400">
          {message}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Add / Update Cookies</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-neutral-400 block mb-1">
              Platform
            </label>
            <select
              className="input"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-1">
              Valid for (days)
            </label>
            <input
              type="number"
              className="input"
              value={form.validityDays}
              onChange={(e) =>
                setForm({ ...form, validityDays: Number(e.target.value) })
              }
            />
            <p className="text-xs text-neutral-500 mt-1">
              Timer will show remaining time. You&apos;ll get warning when less than 3 days.
            </p>
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-1">
              Cookies (Netscape format)
            </label>
            <textarea
              className="input font-mono text-xs"
              rows={8}
              placeholder="Paste cookies.txt content here..."
              value={form.cookies}
              onChange={(e) => setForm({ ...form, cookies: e.target.value })}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Use &quot;Get cookies.txt LOCALLY&quot; Chrome extension to export.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Cookies'}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Active Cookies</h2>

      <div className="space-y-3">
        {cookies.length === 0 ? (
          <div className="card text-center text-neutral-400 py-8">
            No cookies saved yet.
          </div>
        ) : (
          cookies.map((c) => {
            const t = getTimeLeft(c.expiresAt);
            const colorClasses: any = {
              green: 'bg-green-500',
              yellow: 'bg-yellow-500',
              red: 'bg-red-500',
            };

            return (
              <div key={c.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg capitalize">
                      {c.platform}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Pasted: {new Date(c.pastedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      c.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {c.active ? 'ACTIVE' : 'EXPIRED'}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Expires in:</span>
                    <span
                      className={
                        t.color === 'red'
                          ? 'text-red-400 font-bold'
                          : t.color === 'yellow'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }
                    >
                      {t.text}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colorClasses[t.color]}`}
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-danger text-xs"
                    onClick={() => del(c.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
