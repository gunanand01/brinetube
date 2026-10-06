import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — BrineTube',
  description: 'Guides and tutorials on downloading videos from Instagram, YouTube, and other platforms.',
};

const articles = [
  {
    slug: 'how-to-download-instagram-videos',
    title: 'How to Download Instagram Videos in HD (2026 Guide)',
    description: 'Step-by-step guide to download Instagram reels, videos, and IGTV in HD quality.',
  },
  {
    slug: 'how-to-download-youtube-videos',
    title: 'How to Download YouTube Videos in 1080p, 720p, 480p',
    description: 'Complete guide to downloading YouTube videos in multiple qualities.',
  },
  {
    slug: 'best-video-downloader-2026',
    title: 'Best Free Video Downloader in 2026',
    description: 'Top free video downloader tools and platforms for 2026.',
  },
];

export default function BlogPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-neutral-400 mb-10">
        Guides and tutorials on video downloading, streaming, and platform tips.
      </p>

      <div className="space-y-4">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="card block hover:border-blue-600 transition"
          >
            <h2 className="text-xl font-bold mb-2">{a.title}</h2>
            <p className="text-sm text-neutral-400">{a.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
