'use client';

import { useEffect, useState, useRef } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

const FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  AUD: '🇦🇺', NZD: '🇳🇿', CAD: '🇨🇦', CHF: '🇨🇭',
};
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];

// The 7 USD base pairs we receive from Finnhub OANDA WebSocket
const BASE_PAIRS = ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDJPY', 'USDCAD', 'USDCHF'];

// Supabase/Yahoo Finance format — used as fallback reference
const SUPABASE_MAP: Record<string, string> = {
  EURUSD: 'EURUSD=X', GBPUSD: 'GBPUSD=X', AUDUSD: 'AUDUSD=X',
  NZDUSD: 'NZDUSD=X', USDJPY: 'USDJPY=X', USDCAD: 'USDCAD=X', USDCHF: 'USDCHF=X',
};

// ─────────────────────────────────────────────────────────────────────────────
// Derive all 28 major cross rates from the 7 base USD pairs using triangular
// arithmetic — the industry-standard method for currency strength calculation.
//
// Formula logic:
//   EUR/GBP  = EUR/USD ÷ GBP/USD
//   EUR/JPY  = EUR/USD × USD/JPY
//   CAD/JPY  = USD/JPY ÷ USD/CAD   (= JPY per CAD)
//   CHF/JPY  = USD/JPY ÷ USD/CHF
// ─────────────────────────────────────────────────────────────────────────────
function derive28Rates(r: Record<string, number>): Array<{ pair: string; base: string; quote: string; rate: number }> {
  const { EURUSD, GBPUSD, AUDUSD, NZDUSD, USDJPY, USDCAD, USDCHF } = r;
  if (!EURUSD || !GBPUSD || !AUDUSD || !NZDUSD || !USDJPY || !USDCAD || !USDCHF) return [];

  return [
    // 7 direct USD pairs
    { pair: 'EURUSD', base: 'EUR', quote: 'USD', rate: EURUSD },
    { pair: 'GBPUSD', base: 'GBP', quote: 'USD', rate: GBPUSD },
    { pair: 'AUDUSD', base: 'AUD', quote: 'USD', rate: AUDUSD },
    { pair: 'NZDUSD', base: 'NZD', quote: 'USD', rate: NZDUSD },
    { pair: 'USDJPY', base: 'USD', quote: 'JPY', rate: USDJPY },
    { pair: 'USDCAD', base: 'USD', quote: 'CAD', rate: USDCAD },
    { pair: 'USDCHF', base: 'USD', quote: 'CHF', rate: USDCHF },
    // 6 EUR crosses
    { pair: 'EURGBP', base: 'EUR', quote: 'GBP', rate: EURUSD / GBPUSD },
    { pair: 'EURJPY', base: 'EUR', quote: 'JPY', rate: EURUSD * USDJPY },
    { pair: 'EURCHF', base: 'EUR', quote: 'CHF', rate: EURUSD * USDCHF },
    { pair: 'EURCAD', base: 'EUR', quote: 'CAD', rate: EURUSD * USDCAD },
    { pair: 'EURAUD', base: 'EUR', quote: 'AUD', rate: EURUSD / AUDUSD },
    { pair: 'EURNZD', base: 'EUR', quote: 'NZD', rate: EURUSD / NZDUSD },
    // 5 GBP crosses
    { pair: 'GBPJPY', base: 'GBP', quote: 'JPY', rate: GBPUSD * USDJPY },
    { pair: 'GBPCHF', base: 'GBP', quote: 'CHF', rate: GBPUSD * USDCHF },
    { pair: 'GBPCAD', base: 'GBP', quote: 'CAD', rate: GBPUSD * USDCAD },
    { pair: 'GBPAUD', base: 'GBP', quote: 'AUD', rate: GBPUSD / AUDUSD },
    { pair: 'GBPNZD', base: 'GBP', quote: 'NZD', rate: GBPUSD / NZDUSD },
    // 4 AUD crosses
    { pair: 'AUDJPY', base: 'AUD', quote: 'JPY', rate: AUDUSD * USDJPY },
    { pair: 'AUDCHF', base: 'AUD', quote: 'CHF', rate: AUDUSD * USDCHF },
    { pair: 'AUDCAD', base: 'AUD', quote: 'CAD', rate: AUDUSD * USDCAD },
    { pair: 'AUDNZD', base: 'AUD', quote: 'NZD', rate: AUDUSD / NZDUSD },
    // 3 NZD crosses
    { pair: 'NZDJPY', base: 'NZD', quote: 'JPY', rate: NZDUSD * USDJPY },
    { pair: 'NZDCHF', base: 'NZD', quote: 'CHF', rate: NZDUSD * USDCHF },
    { pair: 'NZDCAD', base: 'NZD', quote: 'CAD', rate: NZDUSD * USDCAD },
    // 2 CAD crosses
    { pair: 'CADJPY', base: 'CAD', quote: 'JPY', rate: USDJPY / USDCAD },
    { pair: 'CADCHF', base: 'CAD', quote: 'CHF', rate: USDCHF / USDCAD },
    // 1 CHF cross
    { pair: 'CHFJPY', base: 'CHF', quote: 'JPY', rate: USDJPY / USDCHF },
  ];
}

export default function CurrencyStrengthPanel() {
  const [bars, setBars] = useState<{ currency: string; score: number; trend: 'up' | 'down' | 'flat' }[]>(
    CURRENCIES.map(c => ({ currency: c, score: 50, trend: 'flat' }))
  );
  const [lastUpdate, setLastUpdate] = useState('--:--:--');
  const [pairsActive, setPairsActive] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Session-open baseline: first prices we see become the reference "open"
  const sessionOpenRef = useRef<Record<string, number>>({});
  const prevScoresRef = useRef<Record<string, number>>({});
  const hasOpenRef = useRef(false);

  useEffect(() => {
    const readyTimer = setTimeout(() => setIsReady(true), 1000);

    const compute = () => {
      const { ticks } = useFinnhubStore.getState();
      const { prices: dbPrices } = useMarketStore.getState();

      // Build live rate map: Finnhub WebSocket tick → Supabase DB fallback
      const liveRates: Record<string, number> = {};
      let activePairs = 0;

      for (const key of BASE_PAIRS) {
        const tickPrice = ticks[key]?.price;
        const dbPrice = dbPrices[SUPABASE_MAP[key]]?.price;
        const price = tickPrice ?? dbPrice ?? 0;
        if (price > 0) {
          liveRates[key] = price;
          activePairs++;
        }
      }

      if (activePairs < 4) return; // not enough base pairs yet
      setPairsActive(activePairs);

      // On first data arrival, lock in the session open baseline
      if (!hasOpenRef.current) {
        sessionOpenRef.current = { ...liveRates };
        hasOpenRef.current = true;
        return; // need a subsequent tick to have a real delta
      }

      // Derive all 28 current cross rates
      const currentCross = derive28Rates(liveRates);
      // Derive all 28 session-open cross rates
      const openCross = derive28Rates(sessionOpenRef.current);
      if (currentCross.length === 0 || openCross.length === 0) return;

      // Build session-open lookup map for fast access
      const openMap: Record<string, number> = {};
      openCross.forEach(p => { openMap[p.pair] = p.rate; });

      // ── Core algorithm ──────────────────────────────────────────
      // For each of the 28 pairs:
      //   pctChange = (currentRate - openRate) / openRate × 100
      //   base currency gets  +pctChange  (it strengthened)
      //   quote currency gets -pctChange  (it weakened)
      // ──────────────────────────────────────────────────────────
      const scores: Record<string, number> = {};
      CURRENCIES.forEach(c => (scores[c] = 0));

      let computedPairs = 0;
      for (const { pair, base, quote, rate } of currentCross) {
        const openRate = openMap[pair];
        if (!openRate || openRate <= 0) continue;
        const pctChange = ((rate - openRate) / openRate) * 100;
        scores[base] += pctChange;
        scores[quote] -= pctChange;
        computedPairs++;
      }

      if (computedPairs < 7) return;

      // Normalize raw scores to 0–100 scale
      const vals = Object.values(scores);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min < 0.000001 ? 0.000001 : max - min;

      const computed = CURRENCIES.map(c => {
        const normalizedScore = Math.round(((scores[c] - min) / range) * 100);
        const prevScore = prevScoresRef.current[c] ?? 50;
        const trend: 'up' | 'down' | 'flat' =
          normalizedScore > prevScore + 1 ? 'up' :
          normalizedScore < prevScore - 1 ? 'down' : 'flat';
        return { currency: c, score: normalizedScore, trend };
      });

      // Store previous scores for trend direction arrows
      computed.forEach(item => {
        prevScoresRef.current[item.currency] = item.score;
      });

      // Sort: strongest on left → weakest on right
      computed.sort((a, b) => b.score - a.score);
      setBars(computed);
      setLastUpdate(
        new Date().toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        })
      );
    };

    // Initial compute + 5-second polling loop
    compute();
    const interval = setInterval(compute, 5000);

    return () => {
      clearTimeout(readyTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <Panel>
      <PanelHeader title="Currency Strength Meter" badge={<LiveBadge />} />
      <PanelContent>
        <div style={{
          height: '100%', width: '100%',
          padding: '12px 8px 4px 8px',
          display: 'flex', flexDirection: 'column',
        }}>
          {!isReady ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--text-ghost)'
            }}>
              <div style={{ fontSize: 11 }}>Calculating 28 cross pairs...</div>
              <div style={{ fontSize: 9, opacity: 0.6 }}>
                Session-relative strength · Updates every 5s
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1, display: 'flex', gap: '6px',
              alignItems: 'flex-end', justifyContent: 'center'
            }}>
              {bars.map((item) => {
                const isStrong = item.score >= 50;
                const barColor = isStrong ? '#44ff88' : '#ff3344';
                const glowColor = isStrong ? 'rgba(68,255,136,0.4)' : 'rgba(255,51,68,0.4)';
                const heightPct = Math.max(item.score, 3);
                const trendIcon = item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '';

                return (
                  <div key={item.currency} style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {/* Score pill with trend arrow */}
                    <div style={{
                      marginBottom: 6, fontSize: 8, fontWeight: 800, color: 'white',
                      background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: 10,
                      boxShadow: `0 0 8px ${glowColor}`,
                      border: `1px solid ${glowColor}`,
                      transition: 'all 0.5s ease',
                      display: 'flex', alignItems: 'center', gap: 2
                    }}>
                      {item.score}
                      {trendIcon && (
                        <span style={{ fontSize: 7, color: barColor, fontWeight: 900 }}>{trendIcon}</span>
                      )}
                    </div>

                    {/* Vertical glowing bar */}
                    <div style={{
                      width: '16px', height: '100px',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                      marginBottom: 10
                    }}>
                      <div style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        background: `linear-gradient(to top, ${barColor}55, ${barColor})`,
                        borderRadius: 8,
                        boxShadow: `0 0 14px ${glowColor}, 0 0 4px ${glowColor}`,
                        transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} />
                    </div>

                    {/* Flag + ticker card */}
                    <div style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isStrong ? 'rgba(68,255,136,0.18)' : 'rgba(255,51,68,0.18)'}`,
                      borderRadius: '10px',
                      padding: '5px 2px',
                      width: '100%',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                      <div style={{ fontSize: 11 }}>{FLAGS[item.currency]}</div>
                      <div style={{
                        fontSize: 8, fontWeight: 700, letterSpacing: 0.5, marginTop: 1,
                        color: isStrong ? '#44ff88' : '#ff3344',
                      }}>
                        {item.currency}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer status bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '6px 2px 0 2px',
            fontSize: 7, color: 'var(--text-ghost)',
            borderTop: '1px solid var(--border-subtle)', marginTop: 6
          }}>
            <span>{pairsActive}/7 base pairs · 28 crosses derived · ≥50 = 🟢 strong</span>
            <span>Updated {lastUpdate}</span>
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
