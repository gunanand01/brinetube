'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import AdGate from '@/components/AdGate';

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState<any>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/videos?id=${id}`).then(r => r.json()).then(d => d.video && setVideo(d.video));
    fetch('/api/limits', { method: 'POST' }).then(r => r.json()).then(d => {
      if (d.blocked) setBlocked(d.message); else setUnlocked(true);
    });
  }, [id]);

  if (blocked) return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Limit reached</h1>
      <p className="text-neutral-400">{blocked}</p>
    </main>
  );

  if (!video) return <main className="p-8">Loading...</main>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <AdSlot placement="header" />
      {!unlocked ? <AdGate onComplete={() => setUnlocked(true)} /> : (
        <>
          <AdSlot placement="before_player" />
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
            <iframe src={video.embedUrl || video.url} className="w-full h-full" allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture" />
          </div>
          <AdSlot placement="after_player" />
          <h1 className="text-xl font-bold mb-2">{video.title}</h1>
          <p className="text-sm text-neutral-400">{video.platform} • {video.views} views</p>
        </>
      )}
      <AdSlot placement="footer" />
    </main>
  );
}