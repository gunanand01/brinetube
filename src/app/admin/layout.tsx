import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800 px-6 py-3 flex gap-4 items-center flex-wrap text-sm">
        <Link href="/admin" className="font-bold text-blue-500">BrineTube Admin</Link>
        <Link href="/admin/videos" className="hover:text-blue-400">Videos</Link>
        <Link href="/admin/platforms" className="hover:text-blue-400">Platforms</Link>
        <Link href="/admin/platforms/config" className="hover:text-blue-400">Platform Configs</Link>
        <Link href="/admin/providers" className="hover:text-blue-400">Providers</Link>
        <Link href="/admin/cookies" className="hover:text-blue-400">Cookies</Link>
        <Link href="/admin/ads" className="hover:text-blue-400">Ads</Link>
        <Link href="/admin/limits" className="hover:text-blue-400">Limits</Link>
        <Link href="/admin/resolver" className="hover:text-blue-400">Resolver</Link>
        <Link href="/admin/appearance" className="hover:text-blue-400">Appearance</Link>
        <Link href="/admin/settings" className="hover:text-blue-400">Settings</Link>
        <Link href="/" className="ml-auto hover:text-blue-400">← Site</Link>
      </nav>
      <div className="p-6 max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
