'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [p, setP] = useState('');
  const [e, setE] = useState('');
  const router = useRouter();
  async function go() {
    const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: p }) });
    if (r.ok) router.push('/admin'); else setE('Wrong password');
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <input type="password" className="input mb-3" placeholder="Password" value={p}
          onChange={e => setP(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} />
        {e && <p className="text-red-500 text-sm mb-3">{e}</p>}
        <button className="btn btn-primary w-full" onClick={go}>Login</button>
      </div>
    </div>
  );
}