'use client';
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
}