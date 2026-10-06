'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdSlot from '@/components/AdSlot';

interface HomeClientProps {
  settings: {
    siteName: string;
    tagline: string;
    logoUrl: string;
    platformsLabel: string;
  };
}

export default function HomeClient({ settings }: HomeClientProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function add() {
    if (!url.trim()) return;
    setLoading(true);
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const d = await res.json();
    setLoading(false);
    if (d.video) {
      setUrl('');
      router.push(`/watch/${d.video.id}`);
    } else {
      alert(d.error || 'Failed');
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt={settings.siteName}
            className="h-20 mx-auto mb-4"
          />
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          {settings.siteName}
        </h1>
        <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
          {settings.tagline}
        </p>

        {/* URL Input */}
        <div className="card max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Paste video link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <button className="btn btn-primary" onClick={add} disabled={loading}>
              {loading ? '...' : 'Play'}
            </button>
          </div>
        </div>
      </section>

      <AdSlot placement="header" />

      {/* Supported Platforms */}
      <section className="my-12">
        <h2 className="text-2xl font-bold text-center mb-6">
          {settings.platformsLabel || 'Supported Platforms'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {[
            'YouTube',
            'Instagram',
            'Dailymotion',
            'Vimeo',
            'Facebook',
            'Twitter/X',
            'Reddit',
            'TikTok',
            'Terabox',
            'Streamtape',
            'VidBunker',
            'Filemoon',
          ].map((p) => (
            <div key={p} className="card text-center py-3 text-sm">
              {p}
            </div>
          ))}
        </div>
      </section>

      <AdSlot placement="grid" />

      {/* Features */}
      <section className="my-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Why Choose {settings.siteName}?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-bold mb-2">Fast Streaming</h3>
            <p className="text-sm text-neutral-400">
              Stream videos directly from popular platforms without delays. Our
              optimized servers ensure smooth playback.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">Download in HD</h3>
            <p className="text-sm text-neutral-400">
              Download videos in 1080p, 720p, 480p, and more. Save your favorite
              content for offline viewing.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">No Registration</h3>
            <p className="text-sm text-neutral-400">
              No sign-up required. Just paste your link and start watching.
              Completely free to use.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">Multiple Platforms</h3>
            <p className="text-sm text-neutral-400">
              Support for YouTube, Instagram, Terabox, Facebook, and many more
              video platforms.
            </p>
          </div>
        </div>
      </section>

      <AdSlot placement="before_player" />

      {/* How to Use */}
      <section className="my-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          How to Use {settings.siteName}
        </h2>
        <div className="space-y-4">
          <div className="card flex items-start gap-4">
            <div className="text-2xl font-bold text-blue-500">1</div>
            <div>
              <h3 className="font-bold mb-1">Copy Video Link</h3>
              <p className="text-sm text-neutral-400">
                Copy the video URL from YouTube, Instagram, or any supported
                platform.
              </p>
            </div>
          </div>
          <div className="card flex items-start gap-4">
            <div className="text-2xl font-bold text-blue-500">2</div>
            <div>
              <h3 className="font-bold mb-1">Paste & Play</h3>
              <p className="text-sm text-neutral-400">
                Paste the link in the box above and click Play.
              </p>
            </div>
          </div>
          <div className="card flex items-start gap-4">
            <div className="text-2xl font-bold text-blue-500">3</div>
            <div>
              <h3 className="font-bold mb-1">Watch or Download</h3>
              <p className="text-sm text-neutral-400">
                Stream directly or download in your preferred quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdSlot placement="after_player" />

      {/* Latest Articles */}
      <section className="my-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/blog/how-to-download-instagram-videos"
            className="card hover:border-blue-600 transition"
          >
            <h3 className="font-bold mb-2">
              How to Download Instagram Videos in HD
            </h3>
            <p className="text-sm text-neutral-400">
              Step-by-step guide to download Instagram reels and videos.
            </p>
          </a>
          <a
            href="/blog/how-to-download-youtube-videos"
            className="card hover:border-blue-600 transition"
          >
            <h3 className="font-bold mb-2">
              How to Download YouTube Videos
            </h3>
            <p className="text-sm text-neutral-400">
              Complete guide for 1080p, 720p, and 480p downloads.
            </p>
          </a>
          <a
            href="/blog/best-video-downloader-2026"
            className="card hover:border-blue-600 transition"
          >
            <h3 className="font-bold mb-2">Best Free Video Downloader 2026</h3>
            <p className="text-sm text-neutral-400">
              Compare top video downloader tools available.
            </p>
          </a>
        </div>
        <div className="text-center mt-6">
          <a
            href="/blog"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All Articles →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="my-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          <details className="card">
            <summary className="font-bold cursor-pointer">
              Is {settings.siteName} free to use?
            </summary>
            <p className="text-sm text-neutral-400 mt-2">
              Yes, completely free. No registration or payment required.
            </p>
          </details>
          <details className="card">
            <summary className="font-bold cursor-pointer">
              Which platforms are supported?
            </summary>
            <p className="text-sm text-neutral-400 mt-2">
              YouTube, Instagram, Facebook, Dailymotion, Terabox, and many more.
            </p>
          </details>
          <details className="card">
            <summary className="font-bold cursor-pointer">
              Can I download videos in HD?
            </summary>
            <p className="text-sm text-neutral-400 mt-2">
              Yes. Download in 1080p, 720p, 480p, and other available qualities.
            </p>
          </details>
          <details className="card">
            <summary className="font-bold cursor-pointer">
              Do you store my downloaded videos?
            </summary>
            <p className="text-sm text-neutral-400 mt-2">
              No. We don&apos;t store or track any downloads. Your privacy is
              respected.
            </p>
          </details>
        </div>
      </section>

      {/* Footer / SEO Text */}
      <section className="my-12 text-center text-sm text-neutral-500">
        <p className="max-w-3xl mx-auto">
          {settings.siteName} is a free online video streaming and download
          platform. Watch and download videos from YouTube, Instagram, Facebook,
          Terabox, Dailymotion, and many other popular platforms. No
          registration required. Enjoy high-quality streaming in HD, 1080p,
          720p, 480p. Fast, free, and secure.
        </p>
      </section>

      <AdSlot placement="footer" />
    </main>
  );
}
