import Link from 'next/link';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-800 px-6 py-3 flex gap-6 items-center flex-wrap">
        <Link href="/admin" className="font-bold text-blue-500">VidNest Admin</Link>
        <Link href="/admin/videos" className="text-sm hover:text-blue-400">Videos</Link>
        <Link href="/admin/platforms" className="text-sm hover:text-blue-400">Platforms</Link>
        <Link href="/admin/ads" className="text-sm hover:text-blue-400">Ads</Link>
        <Link href="/admin/limits" className="text-sm hover:text-blue-400">Limits</Link>
        <Link href="/admin/resolver" className="text-sm hover:text-blue-400">Resolver</Link>
        <Link href="/admin/settings" className="text-sm hover:text-blue-400">Settings</Link>
        <Link href="/" className="text-sm ml-auto hover:text-blue-400">← Site</Link>
      </nav>
      <div className="p-6 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}