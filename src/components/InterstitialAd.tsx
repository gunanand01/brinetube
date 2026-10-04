'use client';
import { useEffect, useRef, useState } from 'react';
export default function InterstitialAd({ config, onComplete }: any) {
  const [clicked, setClicked] = useState(false);
  const [s, setS] = useState(config?.timer || 15);
  const [can, setCan] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
    if (!clicked) return;
    const t = setInterval(() => setS((v: number) => {
      if (v <= 1) { setCan(true); clearInterval(t); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [clicked]);
  if (!config?.enabled) { onComplete(); return null; }
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-xl max-w-2xl w-full p-6">
        <div className="text-center font-bold mb-4">
          {config.instruction || 'Click on the ad and stay for 15 seconds to continue'}
        </div>
        <div onClick={() => !clicked && setClicked(true)}
          className="cursor-pointer border-2 border-dashed border-neutral-300 rounded-lg overflow-hidden min-h-[300px]">
          <div ref={ref} />
        </div>
        <div className="text-center mt-4">
          {clicked ? (can ? (
            <button className="btn btn-primary" onClick={onComplete}>Continue</button>
          ) : <div className="text-lg font-bold">Wait {s}s...</div>) :
          <div className="text-lg font-bold text-neutral-500">Click the ad to start timer</div>}
        </div>
      </div>
    </div>
  );
}