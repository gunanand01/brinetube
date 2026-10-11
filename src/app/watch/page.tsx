'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import AdGate from '@/components/AdGate';

function WatchContent() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('url');

  const [unlocked, setUnlocked] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<any>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;

    attemptExtraction(videoUrl);

    fetch('/api/limits', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.blocked) setBlocked(d.message);
        else setUnlocked(true);
      });
  }, [videoUrl]);

  async function attemptExtraction(url: string) {
    setExtracting(true);
    setExtractError(false);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (json.success && json.data?.formats?.length > 0) {
        setMediaData(json.data);
      } else {
        setExtractError(true);
      }
    } catch {
      setExtractError(true);
    } finally {
      setExtracting(false);
    }
  }

  // SMART FILTER: Duplicates hatayega aur dynamically 1080p, 720p, 480p dega
  const getProcessedFormats = () => {
    if (!mediaData || !mediaData.formats) return [];
    
    let unknownCount = 0;
    let dashCount = 0;
    const uniqueFormats: any[] = [];
    const seen = new Set();

    mediaData.formats.forEach((format: any) => {
      let q = (format.quality || format.format_note || format.resolution || '').toString().toLowerCase();
      let label = 'Normal';

      // 1. Agar actual height available hai (YouTube ke liye best)
      if (format.height) {
        label = `${format.height}p`;
      } 
      // 2. Agar string me digits hain
      else if (q.match(/(\d+)p?/)) {
        const match = q.match(/(\d+)/);
        if (match) label = `${match[1]}p`;
      } 
      // 3. Instagram ke "unknown" formats ko progressively labels dena
      else if (q.includes('unknown') || q === '') {
        if (unknownCount === 0) label = '1080p';
        else if (unknownCount === 1) label = '720p';
        else if (unknownCount === 2) label = '480p';
        else label = '360p';
        unknownCount++;
      } 
      // 4. Instagram ke "dash" ko progressively labels dena
      else if (q.includes('dash')) {
        if (dashCount === 0) label = '1080p';
        else if (dashCount === 1) label = '720p';
        else label = '480p';
        dashCount++;
      } 
      else if (format.hasAudio && !format.hasVideo) {
        label = 'Audio Only';
      } else {
        label = 'HD';
      }

      // Duplicate check (Taaki ek hi quality ke do button na aaye)
      const type = format.hasAudio ? 'va' : 'v';
      const key = label + type;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueFormats.push({ ...format, cleanLabel: label });
      }
    });

    return uniqueFormats.slice(0, 6); // Sirf top 6 clean options dikhayenge
  };

  const processedFormats = getProcessedFormats();

  if (!videoUrl) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">No video URL</h1>
        <p className="text-neutral-400">Please paste a video link on homepage.</p>
        <a href="/" className="btn btn-primary inline-block mt-4">
          ← Back to Home
        </a>
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Limit reached</h1>
        <p className="text-neutral-400">{blocked}</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <AdSlot placement="header" />
      {!unlocked ? (
        <AdGate onComplete={() => setUnlocked(true)} />
      ) : (
        <>
          <AdSlot placement="before_player" />
          
          <div className="card mb-6 aspect-video bg-black flex items-center justify-center overflow-hidden rounded-xl border border-neutral-800">
            {extracting ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-neutral-400 font-medium">Extracting video...</span>
              </div>
            ) : mediaData ? (
              <video 
                controls 
                autoPlay 
                className="w-full h-full"
                src={
                  mediaData.formats.find((f: any) => f.hasAudio && f.hasVideo)?.url || 
                  mediaData.formats[0]?.url
                }
              />
            ) : extractError ? (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm text-center p-4">
                Direct streaming unavailable for this URL.
              </div>
            ) : null}
          </div>

          {processedFormats.length > 0 && (
            <div className="card mb-4">
              <h3 className="text-lg font-bold mb-3">⬇️ Download Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {processedFormats.map((format: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center bg-neutral-900 p-3 rounded border border-neutral-800"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {format.cleanLabel}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {format.hasAudio ? 'Video + Audio' : 'Video only'}
                      </span>
                    </div>
                    <a 
                      href={`/api/download?url=${encodeURIComponent(format.url)}`} 
                      target="_blank"
                      className="btn btn-primary text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AdSlot placement="after_player" />
        </>
      )}
      <AdSlot placement="footer" />
    </main>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
      <WatchContent />
    </Suspense>
  );
}

