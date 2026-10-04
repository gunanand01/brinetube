'use client';
import { useEffect, useState } from 'react';
export default function AdSlot({ placement }: { placement: string }) {
  const [ads, setAds] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/ads?placement=${placement}`).then(r => r.json()).then(d => setAds(d.ads || []));
  }, [placement]);
  useEffect(() => {
    ads.forEach(ad => {
      const c = document.getElementById(`ad-${ad.id}`);
      if (!c) return;
      c.innerHTML = '';
      const div = document.createElement('div');
      div.innerHTML = ad.code;
      c.appendChild(div);
      c.querySelectorAll('script').forEach((old: any) => {
        const s = document.createElement('script');
        Array.from(old.attributes).forEach((a: any) => s.setAttribute(a.name, a.value));
        s.text = old.text;
        old.replaceWith(s);
      });
    });
  }, [ads]);
  if (!ads.length) return null;
  return <div className={`my-4 ad-slot ad-${placement}`}>{ads.map(ad => <div key={ad.id} id={`ad-${ad.id}`} />)}</div>;
}