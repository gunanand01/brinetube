'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import AdGate from '@/components/AdGate';

// Naya Smart Helper: Ab yeh actual resolution padhega
function getCleanQuality(format: any): string {
  // Sabse pehle height check karo (yt-dlp hamesha height bhejta hai)
  if (format.height) {
    return `${format.height}p`;
  }
  
  // Fallback: Agar height nahi hai, toh label me resolution dhoondho
  const q = (format.quality || format.format_note || format.resolution || '').toString().toLowerCase();
  
  if (q.includes('2160')) return '4K';
  if (q.includes('1440')) return '1440p';
  if (q.includes('1080')) return '1080p';
  if (q.includes('720')) return '720p';
  if (q.includes('480')) return '480p';
  if (q.includes('360')) return '360p';
  if (q.includes('240')) return '240p';
  if (q.includes('144')) return '144p';

  // Agar sirf audio hai
  if (format.hasAudio && !format.hasVideo) return 'Audio Only';

  // Default
  return 'Normal';
}

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

          {mediaData && mediaData.formats && (
            <div className="card mb-4">
              <h3 className="text-lg font-bold mb-3">⬇️ Download Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mediaData.formats.slice(0, 10).map((format: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center bg-neutral-900 p-3 rounded border border-neutral-800"
                  >
                    <div className="flex flex-col">
                      {/* Ab yahan format obj bhej rahe hain */}
                      <span className="font-semibold text-sm">
                        {getCleanQuality(format)}
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

