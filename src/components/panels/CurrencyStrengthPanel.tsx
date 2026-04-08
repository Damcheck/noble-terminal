'use client';

import { useMemo, useEffect, useState } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';

const FLAGS: Record<string, string> = {
  AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', EUR: '🇪🇺', 
  GBP: '🇬🇧', JPY: '🇯🇵', NZD: '🇳🇿', USD: '🇺🇸'
};
const CURRENCIES = Object.keys(FLAGS);

const FOREX_PAIRS = {
  'EURUSD=X': { base: 'EUR', quote: 'USD' },
  'GBPUSD=X': { base: 'GBP', quote: 'USD' },
  'AUDUSD=X': { base: 'AUD', quote: 'USD' },
  'NZDUSD=X': { base: 'NZD', quote: 'USD' },
  'USDJPY=X': { base: 'USD', quote: 'JPY' },
  'USDCAD=X': { base: 'USD', quote: 'CAD' },
  'USDCHF=X': { base: 'USD', quote: 'CHF' }
};

export default function CurrencyStrengthPanel() {
  const { prices } = useMarketStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  const strengthBars = useMemo(() => {
    let scores: Record<string, number> = {};
    CURRENCIES.forEach(c => scores[c] = 0);

    let hasData = false;
    Object.entries(FOREX_PAIRS).forEach(([symbol, config]) => {
      const data = prices[symbol];
      if (data && typeof data.change_pct === 'number') {
        const momentum = data.change_pct; 
        scores[config.base] += momentum;
        scores[config.quote] -= momentum;
        hasData = true;
      }
    });

    if (!hasData) {
      return CURRENCIES.map(c => ({ currency: c, score: 50 })).sort((a, b) => b.score - a.score);
    }

    const scoreVals = Object.values(scores);
    const minScore = Math.min(...scoreVals);
    const maxScore = Math.max(...scoreVals);
    const range = maxScore - minScore === 0 ? 1 : maxScore - minScore;

    const computed = CURRENCIES.map(c => {
      const normalized = (scores[c] - minScore) / range; // 0 to 1
      const integerScore = Math.round(normalized * 100);
      return { currency: c, score: integerScore };
    });

    // Sort descending so strongest is on the left
    return computed.sort((a, b) => b.score - a.score);
  }, [prices]);

  return (
    <Panel>
      <PanelHeader title="Currency Strength Meter" badge={<LiveBadge />} />
      <PanelContent>
        {/* Sleek aesthetic wrapper */}
        <div style={{
          position: 'relative', height: '100%', width: '100%', 
          padding: '16px 8px 8px 8px', display: 'flex', gap: '8px',
          alignItems: 'flex-end', justifyContent: 'center'
        }}>
          {!isReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ghost)', fontSize: 11 }}>
              Initializing Algorithm...
            </div>
          )}
          
          {isReady && strengthBars.map((item, idx) => {
            // Determine active bar color — High = neon green, Low = neon red
            const isStrong = item.score >= 50;
            const barColor = isStrong ? '#44ff88' : '#ff3344';
            const shadowColor = isStrong ? 'rgba(68,255,136,0.5)' : 'rgba(255,51,68,0.5)';
            // The bar physically shrinks downwards from 100% to 5% min-height
            const heightPct = Math.max(item.score, 3); // Minimum 3% visual bump even if 0 score

            return (
              <div key={item.currency} style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' 
              }}>
                {/* Floating Numeric Pill */}
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
                  transition: 'all 0.6s ease'
                }}>
                  {item.score}
                </div>

                {/* The Solid Glowing Bar */}
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
                    transition: 'height 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }} />
                </div>

                {/* Glassmorphic Country/Currency Base Card */}
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
