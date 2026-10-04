'use client';
import { useEffect, useState } from 'react';
export default function Lim() {
  const [l, setL] = useState(5);
  const [m, setM] = useState('Daily limit reached.');
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setL(parseInt(d.settings.dailyLimit || '5'));
      setM(d.settings.blockMessage || 'Daily limit reached.');
    });
  }, []);
  async function save() {
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dailyLimit: l, blockMessage: m }) });
    alert('Saved');
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Limits</h1>
      <div className="card space-y-3">
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Videos per day per IP</label>
          <input type="number" className="input" value={l} onChange={e => setL(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Block message</label>
          <textarea className="input" rows={3} value={m} onChange={e => setM(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}