'use client';
import { useEffect, useRef, useState } from 'react';
export default function PopupAd({ config, onComplete }: any) {
  const [s, setS] = useState(config?.autoClose || 10);
  const [can, setCan] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!config?.enabled) { onComplete(); return; }
    const t = setInterval(() => setS((v: number) => {
      if (v <= 1) { setCan(true); clearInterval(t); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (ref.current && config?.code) {
      ref.current.innerHTML = config.code;
      ref.current.querySelectorAll('script').forEach((old: any) => {
        const n = document.createElement('script');
        Array.from(old.attributes).forEach((a: any) => n.setAttribute(a.name, a.value));
        n.text = old.text;
        old.replaceWith(n);
      });
    }
  }, [config?.code]);
  if (!config?.enabled) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-xl max-w-md w-full p-6 relative">
        <button disabled={!can} onClick={() => can && onComplete()}
          className="absolute top-2 right-2 disabled:opacity-30">✕</button>
        <div className="mb-2 text-sm">Auto-close in {s}s</div>
        <div ref={ref} className="min-h-[200px]" />
      </div>
    </div>
  );
}