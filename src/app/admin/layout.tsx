import Link from 'next/link';
// lucide-react ko bypass karne ke liye normal SVG icons use karenge

const navigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Platforms', href: '/admin/platforms' },
  { name: 'Providers', href: '/admin/providers' },
  { name: 'Provider Types', href: '/admin/providers/types' },
  { name: 'Cookies Pool', href: '/admin/cookies' },
  { name: 'Ads', href: '/admin/ads' },
  { name: 'Limits', href: '/admin/limits' },
  { name: 'Resolver', href: '/admin/resolver' },
  { name: 'Appearance', href: '/admin/appearance' },
  { name: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight">
            <span className="text-blue-500">Brine</span>Tube <span className="text-sm font-normal text-slate-400">Admin</span>
          </h2>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-73px)]">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
