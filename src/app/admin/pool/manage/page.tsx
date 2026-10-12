'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManagePool() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = () => {
    fetch('/api/pool/list')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchList(); }, []);

  const triggerAction = async (endpoint: string, id: string, extra: any = {}) => {
    const method = endpoint === 'toggle' ? 'PATCH' : endpoint === 'delete' ? 'DELETE' : 'POST';
    const res = await fetch(`/api/pool/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...extra }),
    });
    const data = await res.json();
    alert(data.success ? 'Done' : `Error: ${data.error || data.message}`);
    fetchList();
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-indigo-400">Account Pool</h2>
        <Link href="/admin/pool/inject" className="btn btn-primary">+ Add Manual</Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-800 text-neutral-300 text-sm uppercase">
              <th className="p-4">Platform</th>
              <th className="p-4">Username</th>
              <th className="p-4">Health</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-neutral-500">No accounts yet</td></tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="border-t border-neutral-800">
                  <td className="p-4 font-bold uppercase text-indigo-300">{acc.platform}</td>
                  <td className="p-4 font-mono text-sm">{acc.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded font-bold ${acc.healthScore > 70 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'}`}>
                      {acc.healthScore}%
                    </span>
                  </td>
                  <td className="p-4 text-sm capitalize">{acc.status}</td>
                  <td className="p-4 flex gap-2 justify-center flex-wrap">
                    <button onClick={() => triggerAction('test', acc.id)} className="btn btn-secondary text-xs">Test</button>
                    <button onClick={() => triggerAction('toggle', acc.id, { currentStatus: acc.status })} className="btn btn-secondary text-xs">
                      {acc.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => triggerAction('delete', acc.id)} className="btn btn-danger text-xs">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
