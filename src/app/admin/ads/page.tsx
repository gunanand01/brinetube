'use client';
import { useEffect, useState } from 'react';
const PLACEMENTS = ['header','footer','sidebar','grid','before_player','after_player','popup','popunder','interstitial'];
export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [pat, setPat] = useState<any>({});
  const [f, setF] = useState({ name: '', code: '', placement: 'header' });
  async function load() {
    const [a, p] = await Promise.all([fetch('/api/ads').then(r => r.json()), fetch('/api/ads?pattern=all').then(r => r.json())]);
    setAds(a.ads || []); setPat(p);
  }
  useEffect(() => { load(); }, []);
  async function add() { if (!f.code) return; await fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }); setF({ name: '', code: '', placement: 'header' }); load(); }
  async function del(id: string) { if (!confirm('Delete?')) return; await fetch(`/api/ads?id=${id}`, { method: 'DELETE' }); load(); }
  async function toggle(id: string, enabled: boolean) { await fetch('/api/ads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, enabled }) }); load(); }
  async function savePat(pattern: string, enabled: boolean, config: any) { await fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'pattern', pattern, enabled, config }) }); load(); }
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Ads</h1>
      <div className="card">
        <h2 className="font-bold mb-3">Add Ad</h2>
        <input className="input mb-2" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <select className="input mb-2" value={f.placement} onChange={e => setF({ ...f, placement: e.target.value })}>
          {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <textarea className="input mb-2 font-mono text-xs" rows={6} placeholder="Ad HTML/script" value={f.code} onChange={e => setF({ ...f, code: e.target.value })} />
        <button className="btn btn-primary" onClick={add}>Save</button>
      </div>
      <div>
        <h2 className="font-bold mb-3">Existing ({ads.length})</h2>
        <div className="space-y-2">
          {ads.map(a => (
            <div key={a.id} className="card flex justify-between items-center">
              <div><p className="font-medium">{a.name}</p><p className="text-xs text-neutral-500">{a.placement} • {a.enabled ? 'ON' : 'OFF'}</p></div>
              <div className="flex gap-2">
                <button className="btn btn-secondary" onClick={() => toggle(a.id, !a.enabled)}>{a.enabled ? 'Disable' : 'Enable'}</button>
                <button className="btn btn-danger" onClick={() => del(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="font-bold">Patterns</h2>
        <Pat id="A" t="Pattern A — Unlock Modal" c={pat.patternA}
          d={{ title: 'Unlock more content', subtitle: 'Take action to continue', buttonText: 'View a short ad' }}
          fields={['title','subtitle','buttonText']} onSave={savePat} />
        <Pat id="B" t="Pattern B — Popup Ad" c={pat.patternB}
          d={{ code: '<div>Ad code</div>', autoClose: 10 }} fields={['code','autoClose']} onSave={savePat} />
        <Pat id="C" t="Pattern C — Click + Timer" c={pat.patternC}
          d={{ code: '<div>Ad code</div>', timer: 15, instruction: 'Click on the ad and stay for 15 seconds to continue' }}
          fields={['code','timer','instruction']} onSave={savePat} />
      </div>
    </div>
  );
}
function Pat({ id, t, c, d, fields, onSave }: any) {
  const [en, setEn] = useState(c?.enabled || false);
  const [v, setV] = useState<any>(() => { const i: any = {}; fields.forEach((f: string) => i[f] = c?.[f] ?? d[f]); return i; });
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">{t}</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={en} onChange={e => setEn(e.target.checked)} /> Enabled
        </label>
      </div>
      {fields.map((f: string) => (
        <div key={f} className="mb-2">
          <label className="text-xs text-neutral-400 block mb-1">{f}</label>
          {f === 'code' ? (
            <textarea className="input font-mono text-xs" rows={4} value={v[f]} onChange={e => setV({ ...v, [f]: e.target.value })} />
          ) : (
            <input className="input" type={['timer','autoClose'].includes(f) ? 'number' : 'text'} value={v[f]}
              onChange={e => setV({ ...v, [f]: ['timer','autoClose'].includes(f) ? Number(e.target.value) : e.target.value })} />
          )}
        </div>
      ))}
      <button className="btn btn-primary" onClick={() => onSave(id, en, v)}>Save</button>
    </div>
  );
}