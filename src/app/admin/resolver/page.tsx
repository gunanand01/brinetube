'use client';
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
}