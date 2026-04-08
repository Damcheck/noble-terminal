'use client';

import { useMemo, useEffect, useState } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';

const CURRENCIES = ['AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'];

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
  const [isCalculated, setIsCalculated] = useState(false);

  // Artificial mounting delay to allow store data to populate instantly
  useEffect(() => {
    const t = setTimeout(() => setIsCalculated(true), 500);
    return () => clearTimeout(t);
  }, []);

  const strengthBars = useMemo(() => {
    let scores: Record<string, number> = {};
    CURRENCIES.forEach(c => scores[c] = 0);

    let hasData = false;

    // Apply relative momentum from percent changes
    Object.entries(FOREX_PAIRS).forEach(([symbol, config]) => {
      const data = prices[symbol];
      if (data && typeof data.change_pct === 'number') {
        const momentum = data.change_pct; // e.g. +0.50 means Base outperformed Quote by 0.5%
        scores[config.base] += momentum;
        scores[config.quote] -= momentum;
        hasData = true;
      }
    });

    if (!hasData) {
      // Fallback neutral state if API is dry
      return CURRENCIES.map(c => ({ currency: c, bars: 5 }));
    }

    // Determine min and max absolute scores to dynamically scale exactly into 1-10 bars
    const scoreVals = Object.values(scores);
    const minScore = Math.min(...scoreVals);
    const maxScore = Math.max(...scoreVals);
    
    // Safety guard to avoid divide by zero if market is perfectly flat
    const range = maxScore - minScore === 0 ? 1 : maxScore - minScore;

    return CURRENCIES.map(c => {
      // Normalize between 0 and 1
      const normalized = (scores[c] - minScore) / range;
      // Convert to 1-10 bars
      const bars = Math.round(normalized * 9) + 1;
      return { currency: c, bars };
    });
  }, [prices]);

  return (
    <Panel>
      <PanelHeader title="Currency Strength Meter" badge={<LiveBadge />} />
      <PanelContent>
        {!isCalculated ? (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 10 }}>
            Calculating algorithmic relative strength...
          </div>
        ) : (
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            height: '100%', 
            padding: '2px 6px',
            gap: 4
          }}>
            {strengthBars.map((item) => (
              <div key={item.currency} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                
                {/* Meter container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8, height: 120, justifyContent: 'flex-end', width: '100%' }}>
                  {[...Array(10)].map((_, i) => {
                    // Start from top (10) down to bottom (1)
                    const blockValue = 10 - i;
                    const isActive = blockValue <= item.bars;
                    return (
                      <div key={i} style={{
                        height: '10%',
                        width: '100%',
                        background: isActive ? '#44ff88' : 'var(--overlay-light)',
                        borderRadius: 1,
                        opacity: isActive ? 1 : 0.4,
                        boxShadow: isActive ? '0 0 5px rgba(68,255,136,0.3)' : 'none',
                        transition: 'all 0.5s ease-in-out'
                      }} />
                    );
                  })}
                </div>

                {/* Currency Label */}
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text)',
                  position: 'relative'
                }}>
                  {item.currency}
                  {/* Subtle red/green indicator if highly polar */}
                  {item.bars >= 8 && <span style={{ position: 'absolute', top: -8, right: -8, fontSize: 8 }}>↗</span>}
                  {item.bars <= 3 && <span style={{ position: 'absolute', top: -8, right: -8, fontSize: 8, color: '#ff4444' }}>↘</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
