'use client';
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
  async function del(id: string) { if (!confirm('Delete?')) return; await fetch(`/api/platforms?id=${id}`, { method: 'DELETE' }); load(); }
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
}