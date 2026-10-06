import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Download YouTube Videos in 1080p, 720p, 480p — BrineTube',
  description: 'Complete guide to downloading YouTube videos in multiple qualities. Free, no software required.',
  keywords: 'youtube video download, download youtube 1080p, youtube downloader, save youtube video, youtube video downloader free',
};

export default function Article() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <article className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4">
          How to Download YouTube Videos in 1080p, 720p, 480p
        </h1>
        <p className="text-neutral-400 mb-8">Updated: October 2026</p>

        <p>
          YouTube has over 800 million videos, but you can't download them directly. BrineTube makes it easy to save YouTube videos for offline viewing.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">Why Download YouTube Videos?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Watch on flights or without internet</li>
          <li>Save tutorials and lectures</li>
          <li>Backup your own channel content</li>
          <li>Save for offline editing</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">Step-by-Step Guide</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Copy the YouTube URL</strong> — From the address bar or Share button
          </li>
          <li>
            <strong>Paste on BrineTube</strong> — Open BrineTube and paste the URL
          </li>
          <li>
            <strong>Click Play</strong> — The video will start loading
          </li>
          <li>
            <strong>Choose quality</strong> — Select from available options
          </li>
          <li>
            <strong>Download</strong> — Click download button
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8 mb-3">Available Qualities</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>2160p (4K) — Video only (needs audio merge)</li>
          <li>1440p (2K) — Video only (needs audio merge)</li>
          <li>1080p HD — Video + Audio</li>
          <li>720p HD — Video + Audio</li>
          <li>480p — Video + Audio</li>
          <li>360p — Video + Audio</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">Frequently Asked Questions</h2>

        <h3 className="text-xl font-bold mt-6 mb-2">Is it legal to download YouTube videos?</h3>
        <p>
          Only download content you have rights to. YouTube&apos;s terms of service don&apos;t allow downloading without permission. Use only for personal backup of your own content or content you have rights to.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-2">Does BrineTube work on mobile?</h3>
        <p>Yes, BrineTube works on any device with a browser.</p>
      </article>
    </main>
  );
}
