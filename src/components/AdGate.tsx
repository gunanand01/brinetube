'use client';
import { useEffect, useState } from 'react';
import PopupAd from './PopupAd';
import InterstitialAd from './InterstitialAd';
export default function AdGate({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'modal'|'popup'|'interstitial'|'done'>('modal');
  const [config, setConfig] = useState<any>(null);
  useEffect(() => { fetch('/api/ads?pattern=all').then(r => r.json()).then(setConfig); }, []);
  useEffect(() => { if (stage === 'done') onComplete(); }, [stage]);
  if (!config) return <div className="card text-center py-12">Loading...</div>;
  if (stage === 'modal') return (
    <div className="card text-center py-12 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">{config.patternA?.title || 'Unlock more content'}</h2>
      <p className="text-neutral-400 mb-6">{config.patternA?.subtitle || 'Take action to continue'}</p>
      <button className="btn btn-primary w-full" onClick={() => setStage('popup')}>
        {config.patternA?.buttonText || 'View a short ad'}
      </button>
    </div>
  );
  if (stage === 'popup') return <PopupAd config={config.patternB} onComplete={() => setStage('interstitial')} />;
  if (stage === 'interstitial') return <InterstitialAd config={config.patternC} onComplete={() => setStage('done')} />;
  return null;
}