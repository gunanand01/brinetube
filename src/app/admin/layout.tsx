import Link from 'next/link';
import { 
  LayoutDashboard, 
  MonitorPlay, 
  Settings2, 
  Cookie, 
  Activity, 
  Link as LinkIcon, 
  Palette, 
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Platforms (Direct)', href: '/admin/platforms', icon: MonitorPlay },
  // Removed legacy 'Platform Configs' completely
  { name: 'Providers', href: '/admin/providers', icon: Activity },
  { name: 'Provider Types', href: '/admin/providers/types', icon: Settings2 },
  { name: 'Cookies Pool', href: '/admin/cookies', icon: Cookie },
  { name: 'Ads Management', href: '/admin/ads', icon: Activity },
  { name: 'Limits & Blocks', href: '/admin/limits', icon: Activity },
  { name: 'Resolver', href: '/admin/resolver', icon: LinkIcon },
  { name: 'Appearance', href: '/admin/appearance', icon: Palette },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight">
            <span className="text-blue-500">Brine</span>Tube <span className="text-sm font-normal text-slate-400">Admin</span>
          </h2>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-73px)]">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Icon className="w-5 h-5 text-slate-400" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

