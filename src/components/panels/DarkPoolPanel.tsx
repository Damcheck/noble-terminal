'use client';

import { useState, useEffect, useRef } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

// Dark pool trades are institutional block trades. Real data costs $10k+/mo.
// We simulate them using live Finnhub tick data as the price anchor — making
// the prices, sizes, and timing match actual market conditions.

const SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'JPM', 'SPY', 'QQQ'];
const CONDITIONS = ['BLOCK', 'CROSS', 'SWEEP', 'MELO', 'MIDPT', 'DARK'];
const VENUES = ['IEX', 'CBSX', 'BIDS', 'JPMS', 'MS DP', 'GS MTF'];

function randBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface DarkTrade {
  id: string;
  time: string;
  symbol: string;
  size: number;
  price: number;
  notional: number;
  cond: string;
  venue: string;
  side: 'BUY' | 'SELL';
}

function generateTrade(ticks: Record<string, { price: number }>, prices: Record<string, { price: number }>): DarkTrade {
  const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const basePrice = ticks[sym]?.price ?? prices[sym]?.price ?? (50 + Math.random() * 300);
  const slippage = (Math.random() - 0.5) * 0.003; // ±0.15% from live price
  const price = basePrice * (1 + slippage);
  const size = Math.round(randBetween(1000, 150000) / 100) * 100;
  const now = new Date();
  return {
    id: Math.random().toString(36).slice(2, 8),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    symbol: sym,
    size,
    price,
    notional: size * price,
    cond: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
    venue: VENUES[Math.floor(Math.random() * VENUES.length)],
    side: Math.random() > 0.5 ? 'BUY' : 'SELL',
  };
}

function formatM(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function DarkPoolPanel() {
  const { ticks } = useFinnhubStore();
  const { prices } = useMarketStore();
  const [trades, setTrades] = useState<DarkTrade[]>([]);
  const lastTickTime = useRef(0);

  // Generate a new trade every 2–5 seconds (mimics real dark pool flow)
  useEffect(() => {
    const generateInitial = () => {
      const initial: DarkTrade[] = [];
      for (let i = 0; i < 8; i++) initial.push(generateTrade(ticks, prices));
      setTrades(initial);
    };
    generateInitial();

    const interval = setInterval(() => {
      const newTrade = generateTrade(ticks, prices);
      setTrades(prev => [newTrade, ...prev.slice(0, 14)]);
    }, Math.floor(randBetween(2000, 5000)));

    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // Also regenerate when we get a new tick (so prices are anchored to live)
  useEffect(() => {
    const now = Date.now();
    if (now - lastTickTime.current > 3000) {
      lastTickTime.current = now;
      setTrades(prev => {
        if (prev.length === 0) return prev;
        const newTrade = generateTrade(ticks, prices);
        return [newTrade, ...prev.slice(0, 14)];
      });
    }
  }, [ticks, prices]);

  return (
    <Panel>
      <PanelHeader title="Dark Pool Flow" count={trades.length} badge={<LiveBadge />} />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['TIME', 'SYM', 'SIDE', 'SIZE', 'NOTIONAL', 'COND', 'VENUE'].map(h => (
                <th key={h} style={{
                  padding: '4px 5px', textAlign: 'left', fontSize: 8,
                  color: 'var(--text-ghost)', fontWeight: 600,
                  letterSpacing: 0.5, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={t.id} style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: i === 0 ? 'rgba(68,255,136,0.04)' : 'transparent',
                transition: 'background 0.5s',
              }}>
                <td style={{ padding: '3px 5px', color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', fontSize: 8 }}>{t.time}</td>
                <td style={{ padding: '3px 5px', fontWeight: 700, color: 'var(--text)', fontSize: 9 }}>{t.symbol}</td>
                <td style={{ padding: '3px 5px', color: t.side === 'BUY' ? '#44ff88' : '#ff4444', fontWeight: 700, fontSize: 8 }}>{t.side}</td>
                <td style={{ padding: '3px 5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 8 }}>
                  {t.size.toLocaleString()}
                </td>
                <td style={{ padding: '3px 5px', color: t.notional >= 10_000_000 ? '#ffaa00' : 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: t.notional >= 10_000_000 ? 700 : 400, fontSize: 8 }}>
                  {formatM(t.notional)}
                </td>
                <td style={{ padding: '3px 5px' }}>
                  <span style={{
                    fontSize: 7, padding: '1px 3px', borderRadius: 2,
                    background: 'var(--overlay-subtle)', color: 'var(--text-dim)',
                  }}>{t.cond}</span>
                </td>
                <td style={{ padding: '3px 5px', color: 'var(--text-ghost)', fontSize: 8 }}>{t.venue}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '3px 8px', fontSize: 7, color: 'var(--text-ghost)', borderTop: '1px solid var(--border-subtle)' }}>
          Prices anchored to live Finnhub ticks · Block trades simulated
        </div>
      </PanelContent>
    </Panel>
  );
}
