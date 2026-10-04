import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'VidNest', description: 'Stream from any platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}