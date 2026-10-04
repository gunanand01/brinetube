'use client';
import { useEffect, useState } from 'react';
export default function Vids() {
  const [vs, setVs] = useState<any[]>([]);
  const [u, setU] = useState(''); const [t, setT] = useState('');
  async function load() { setVs((await fetch('/api/videos').then(r => r.json())).videos || []); }
  useEffect(() => { load(); }, []);
  async function add() {
    if (!u) return;
    await fetch('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: u, title: t }) });
    setU(''); setT(''); load();
  }
  async function del(id: string) {
    if (!confirm('Delete?')) return;
    await fetch(`/api/videos?id=${id}`, { method: 'DELETE' }); load();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      <div className="card mb-6">
        <input className="input mb-2" placeholder="URL" value={u} onChange={e => setU(e.target.value)} />
        <input className="input mb-2" placeholder="Title (optional)" value={t} onChange={e => setT(e.target.value)} />
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>
      <div className="space-y-2">
        {vs.map(v => (
          <div key={v.id} className="card flex justify-between items-center">
            <div><p className="font-medium">{v.title}</p><p className="text-xs text-neutral-500">{v.platform} • {v.views} views</p></div>
            <button className="btn btn-danger" onClick={() => del(v.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}