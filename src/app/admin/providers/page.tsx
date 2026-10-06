'use client';

import { useState, useEffect } from 'react';

const PROVIDER_TYPES = [
  { value: 'cobalt', label: 'Cobalt (Self-Hosted)' },
  { value: 'piped', label: 'Piped Instance' },
  { value: 'invidious', label: 'Invidious Instance' },
  { value: 'ytdlp_cookie', label: 'yt-dlp + Cookies' },
  { value: 'ytdlp_proxy', label: 'yt-dlp + Proxy' },
  { value: 'rapidapi_yt', label: 'RapidAPI - YouTube' },
  { value: 'rapidapi_ig', label: 'RapidAPI - Instagram' },
];

const ALL_PLATFORMS = [
  'youtube', 'instagram', 'terabox', 'facebook',
  'twitter', 'tiktok', 'dailymotion', 'vimeo', 'other',
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const emptyForm = {
    name: '',
    type: 'cobalt',
    priority: 0,
    enabled: true,
    platforms: [] as string[],
    config: {} as any,
  };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    const d = await fetch('/api/providers').then((r) => r.json());
    setProviders(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
    setMessage('');
  }

  function openEdit(p: any) {
    setForm({
      name: p.name,
      type: p.type,
      priority: p.priority,
      enabled: p.enabled,
      platforms: JSON.parse(p.platforms || '[]'),
      config: JSON.parse(p.config || '{}'),
    });
    setEditing(p);
    setShowForm(true);
    setMessage('');
  }

  async function save() {
    if (!form.name) {
      setMessage('Name required');
      return;
    }

    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;

    const res = await fetch('/api/providers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setMessage(editing ? 'Provider updated!' : 'Provider added!');
      setShowForm(false);
      load();
    } else {
      setMessage('Error saving');
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this provider?')) return;
    await fetch(`/api/providers?id=${id}`, { method: 'DELETE' });
    load();
  }

  async function toggle(id: string, enabled: boolean) {
    const p = providers.find((x) => x.id === id);
    if (!p) return;
    await fetch('/api/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name: p.name,
        type: p.type,
        priority: p.priority,
        enabled,
        platforms: JSON.parse(p.platforms || '[]'),
        config: JSON.parse(p.config || '{}'),
      }),
    });
    load();
  }

  function togglePlatform(platform: string) {
    const has = form.platforms.includes(platform);
    setForm({
      ...form,
      platforms: has
        ? form.platforms.filter((p) => p !== platform)
        : [...form.platforms, platform],
    });
  }

  function updateConfig(key: string, value: string) {
    setForm({
      ...form,
      config: { ...form.config, [key]: value },
    });
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Extraction Providers</h1>
        <button className="btn btn-primary" onClick={openNew}>
          + Add Provider
        </button>
      </div>

      {message && (
        <div className="p-4 mb-6 rounded bg-green-500/20 text-green-400">
          {message}
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editing ? 'Edit Provider' : 'Add Provider'}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-neutral-400 block mb-1">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Cobalt Main"
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 block mb-1">Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {PROVIDER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-neutral-400 block mb-1">
                Priority (lower = higher priority)
              </label>
              <input
                type="number"
                className="input"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400 block mb-2">
                Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      form.platforms.includes(p)
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-neutral-900 border-neutral-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Config based on type */}
            {form.type.includes('cobalt') && (
              <div>
                <label className="text-sm text-neutral-400 block mb-1">
                  Cobalt URL
                </label>
                <input
                  className="input"
                  value={form.config.url || ''}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://cobalt-xxx.onrender.com"
                />
              </div>
            )}

            {(form.type === 'piped' || form.type === 'invidious') && (
              <div>
                <label className="text-sm text-neutral-400 block mb-1">
                  Instance URLs (comma separated)
                </label>
                <textarea
                  className="input font-mono text-xs"
                  rows={3}
                  value={form.config.urls || ''}
                  onChange={(e) => updateConfig('urls', e.target.value)}
                  placeholder="https://pipedapi.kavin.rocks, https://pipedapi.tokhmi.xyz"
                />
              </div>
            )}

            {form.type === 'ytdlp_cookie' && (
              <div>
                <label className="text-sm text-neutral-400 block mb-1">
                  Server URL
                </label>
                <input
                  className="input"
                  value={form.config.url || ''}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://brinetube-extracter.onrender.com/extract"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Cookies will be picked from Cookie table automatically.
                </p>
              </div>
            )}

            {form.type === 'ytdlp_proxy' && (
              <>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">
                    Server URL
                  </label>
                  <input
                    className="input"
                    value={form.config.url || ''}
                    onChange={(e) => updateConfig('url', e.target.value)}
                    placeholder="https://brinetube-extracter.onrender.com/extract"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">
                    Proxy URL
                  </label>
                  <input
                    className="input"
                    value={form.config.proxy || ''}
                    onChange={(e) => updateConfig('proxy', e.target.value)}
                    placeholder="http://user:pass@ip:port"
                  />
                </div>
              </>
            )}

            {form.type.startsWith('rapidapi') && (
              <>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">
                    RapidAPI Key
                  </label>
                  <input
                    className="input font-mono text-xs"
                    value={form.config.apiKey || ''}
                    onChange={(e) => updateConfig('apiKey', e.target.value)}
                    placeholder="your-rapidapi-key"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 block mb-1">
                    Host
                  </label>
                  <input
                    className="input font-mono text-xs"
                    value={form.config.host || ''}
                    onChange={(e) => updateConfig('host', e.target.value)}
                    placeholder="yt-api.p.rapidapi.com"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label className="text-sm">Enabled</label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button className="btn btn-primary" onClick={save}>
              {editing ? 'Update' : 'Save'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {providers.length === 0 ? (
          <div className="card text-center text-neutral-400 py-8">
            No providers configured. Click "+ Add Provider" to start.
          </div>
        ) : (
          providers.map((p) => {
            const platforms = JSON.parse(p.platforms || '[]');
            return (
              <div key={p.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs bg-neutral-800 px-2 py-1 rounded">
                        #{p.priority}
                      </span>
                      <h3 className="font-bold">{p.name}</h3>
                      <span className="text-xs bg-neutral-800 px-2 py-1 rounded">
                        {p.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          p.enabled
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {p.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 mb-1">
                      <strong>Platforms:</strong>{' '}
                      {platforms.length > 0 ? platforms.join(', ') : 'none'}
                    </div>

                    <div className="text-xs text-neutral-500">
                      Success: {p.successCount} | Fail: {p.failCount}
                      {p.lastStatus && ` | Last: ${p.lastStatus}`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary text-xs"
                      onClick={() => toggle(p.id, !p.enabled)}
                    >
                      {p.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="btn btn-secondary text-xs"
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger text-xs"
                      onClick={() => del(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
