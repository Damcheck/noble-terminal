'use client';

import { useMemo, useEffect, useState } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

const FLAGS: Record<string, string> = {
  AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', EUR: '🇪🇺', 
  GBP: '🇬🇧', JPY: '🇯🇵', NZD: '🇳🇿', USD: '🇺🇸'
};
const CURRENCIES = Object.keys(FLAGS);

// Map internal Finnhub symbol to base/quote and the Yahoo history string
const FOREX_PAIRS = {
  'EURUSD': { base: 'EUR', quote: 'USD', staticKey: 'EURUSD=X' },
  'GBPUSD': { base: 'GBP', quote: 'USD', staticKey: 'GBPUSD=X' },
  'AUDUSD': { base: 'AUD', quote: 'USD', staticKey: 'AUDUSD=X' },
  'NZDUSD': { base: 'NZD', quote: 'USD', staticKey: 'NZDUSD=X' },
  'USDJPY': { base: 'USD', quote: 'JPY', staticKey: 'USDJPY=X' },
  'USDCAD': { base: 'USD', quote: 'CAD', staticKey: 'USDCAD=X' },
  'USDCHF': { base: 'USD', quote: 'CHF', staticKey: 'USDCHF=X' }
};

export default function CurrencyStrengthPanel() {
  const [isReady, setIsReady] = useState(false);
  const [liveScores, setLiveScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // 500ms startup delay to ensure both web sockets and database have mounted
    const t = setTimeout(() => setIsReady(true), 500);

    // Ultra-fast 10hz rendering loop detached from react state cycle
    const interval = setInterval(() => {
      const { prices: staticPrices } = useMarketStore.getState();
      const { ticks: liveTicks } = useFinnhubStore.getState();
      
      let scores: Record<string, number> = {};
      CURRENCIES.forEach(c => scores[c] = 0);

      Object.entries(FOREX_PAIRS).forEach(([finnhubKey, config]) => {
        const staticData = staticPrices[config.staticKey];
        const tickData = liveTicks[finnhubKey];

        // We calculate real-time percentage shift combining DB history + Live stream.
        let liveMomentum = 0;

        if (staticData && typeof staticData.change_pct === 'number') {
          // If we have live Finnhub stream data
          if (tickData && tickData.price) {
            const prevClose = staticData.price / (1 + (staticData.change_pct / 100)); // Reverse engineer exact previous close
            const trueLivePct = ((tickData.price - prevClose) / prevClose) * 100;
            // Scale deeply for high visual volatility
            liveMomentum = trueLivePct * 5; 
          } else {
             // Fallback to static percentage if Finnhub is dead (e.g. weekends)
            liveMomentum = staticData.change_pct * 5;
          }
          
          scores[config.base] += liveMomentum;
          scores[config.quote] -= liveMomentum;
        }
      });

      setLiveScores({...scores});
    }, 200); // Renders 5 frames per second

    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  const strengthBars = useMemo(() => {
    const scoreVals = Object.values(liveScores);
    
    // Check if all scores are genuinely zero (not just summing to zero as a group)
    const allZero = scoreVals.length === 0 || scoreVals.every(v => v === 0);
    
    if (!isReady || allZero) {
      return CURRENCIES.map(c => ({ currency: c, score: 50 })).sort((a, b) => b.score - a.score);
    }

    const minScore = Math.min(...scoreVals);
    const maxScore = Math.max(...scoreVals);
    const range = maxScore - minScore === 0 ? 0.001 : maxScore - minScore; // avoid flat line

    const computed = CURRENCIES.map(c => {
      const normalized = (liveScores[c] - minScore) / range; // 0 to 1
      const integerScore = Math.round(normalized * 100);
      return { currency: c, score: integerScore };
    });

    // Sort descending so strongest is on the left
    return computed.sort((a, b) => b.score - a.score);
  }, [liveScores, isReady]);

  return (
    <Panel>
      <PanelHeader title="Currency Strength Meter" badge={<LiveBadge />} />
      <PanelContent>
        <div style={{
          position: 'relative', height: '100%', width: '100%', 
          padding: '16px 8px 8px 8px', display: 'flex', gap: '8px',
          alignItems: 'flex-end', justifyContent: 'center'
        }}>
          {!isReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ghost)', fontSize: 11 }}>
              Tuning Live WebSockets...
            </div>
          )}
          
          {isReady && strengthBars.map((item) => {
            const isStrong = item.score >= 50;
            const barColor = isStrong ? '#44ff88' : '#ff3344';
            const shadowColor = isStrong ? 'rgba(68,255,136,0.5)' : 'rgba(255,51,68,0.5)';
            const heightPct = Math.max(item.score, 3);

            return (
              <div key={item.currency} style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}>
                <div style={{
                  marginBottom: 8,
                  fontSize: 8,
                  fontWeight: 800,
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: 10,
                  backdropFilter: 'blur(4px)',
                  boxShadow: `0 2px 10px ${shadowColor}`,
                  border: `1px solid ${shadowColor}`,
                  opacity: 0.9,
                  transition: 'all 0.3s ease'
                }}>
                  {item.score}
                </div>

                <div style={{
                  width: '18px',
                  height: '110px', 
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: 12
                }}>
                  <div style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    background: `linear-gradient(to top, ${barColor}99, ${barColor})`,
                    borderRadius: 10,
                    boxShadow: `0 0 10px ${shadowColor}`,
                    transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 0',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ fontSize: 12, marginBottom: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                    {FLAGS[item.currency]}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text)', letterSpacing: 0.5 }}>
                    {item.currency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PanelContent>
    </Panel>
  );
}
