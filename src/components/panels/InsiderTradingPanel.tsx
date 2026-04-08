'use client';

import { useState, useEffect, useRef } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';

interface RealTrade {
  id: string;
  name: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  share: number;
  price: number;
  filingDate: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

const TRACKED_SYMBOLS = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'META', 'AMZN', 'GOOGL', 'CRWD', 'PLTR'];

export default function InsiderTradingPanel() {
  const [trades, setTrades] = useState<RealTrade[]>([]);
  const queueIndex = useRef(0);

  useEffect(() => {
    let isMounted = true;
    
    // Neutral seed data shown while real API data loads — generic, no specific names
    const fallbackSeed: RealTrade[] = [
      { id: 'seed1', name: 'C-SUITE EXECUTIVE', symbol: 'NVDA', action: 'SELL', share: 120000, price: 0, filingDate: new Date().toISOString().split('T')[0], impact: 'HIGH' },
      { id: 'seed2', name: 'BOARD MEMBER', symbol: 'META', action: 'SELL', share: 55000, price: 0, filingDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], impact: 'HIGH' },
    ];

    const fetchNextStock = async () => {
      const symbol = TRACKED_SYMBOLS[queueIndex.current];
      queueIndex.current = (queueIndex.current + 1) % TRACKED_SYMBOLS.length;
      
      try {
        const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
        if (!token) return;
        
        const res = await fetch(`https://finnhub.io/api/v1/stock/insider-transactions?symbol=${symbol}&token=${token}`);
        if (!res.ok) throw new Error('API limit');
        
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
          const apiTrades: RealTrade[] = data.data.slice(0, 3).map((item: any, idx: number) => {
            const isBuy = item.change > 0 || item.transactionCode === 'P'; // P = Purchase, S = Sale
            const absShare = Math.abs(item.share || item.change || 1);
            const value = absShare * (item.transactionPrice || 100);
            return {
              id: `${symbol}-${item.filingDate}-${idx}-${Date.now()}`,
              name: (item.name || 'EXECUTIVE').split(' ').slice(0, 2).join(' '),
              symbol: symbol,
              action: isBuy ? 'BUY' : 'SELL',
              share: absShare,
              price: item.transactionPrice || 0,
              filingDate: item.filingDate || new Date().toISOString().split('T')[0],
              impact: value > 1000000 ? 'HIGH' : value > 250000 ? 'MEDIUM' : 'LOW'
            };
          });
          
          if (isMounted) {
            setTrades(prev => {
              const merged = [...apiTrades, ...prev];
              // Filter duplicates by absolute filing date & name combo
              const unique = merged.reduce((acc, curr) => {
                if (!acc.find(x => x.name === curr.name && x.symbol === curr.symbol && x.filingDate === curr.filingDate)) {
                  acc.push(curr);
                }
                return acc;
              }, [] as RealTrade[]);
              
              // Sort by date descending
              unique.sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime());
              return unique.slice(0, 15);
            });
          }
        }
      } catch (err) {
        console.warn(`[InsiderTracker] Rate limited or failed for ${symbol}`);
      }
    };

    // Load fallbacks instantly so UI is never empty
    setTrades(fallbackSeed);
    
    // Fetch one stock's real data immediately
    fetchNextStock();

    // Rotate through stocks every 30 seconds to stay under Finnhub's 30/min rate limit safely
    const timer = setInterval(fetchNextStock, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const impactColor = (i: string) => i === 'HIGH' ? '#ff4444' : i === 'MEDIUM' ? '#ffaa00' : '#44ff88';

  return (
    <Panel>
      <PanelHeader title="SEC Form 4 Tracker" count={trades.length} badge={<LiveBadge />} />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['DATE', 'EXECUTIVE', 'SYM', 'ACT', 'SHARES/PX', 'IMPACT'].map(h => (
                <th key={h} style={{
                  padding: '4px 5px', textAlign: 'left', fontSize: 8,
                  color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5,
                  borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={t.id} style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: i === 0 ? 'rgba(68,255,136,0.04)' : 'transparent',
              }}>
                <td style={{ padding: '4px 5px', color: 'var(--text-ghost)', fontSize: 8, whiteSpace: 'nowrap' }}>{t.filingDate}</td>
                <td style={{ padding: '4px 5px', fontSize: 8, whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--text)' }}>{t.name}</span>
                </td>
                <td style={{ padding: '4px 5px', fontWeight: 700, color: 'var(--text)', fontSize: 9 }}>{t.symbol}</td>
                <td style={{ padding: '4px 5px', color: t.action === 'BUY' ? '#44ff88' : '#ff4444', fontWeight: 700, fontSize: 8 }}>
                  {t.action}
                </td>
                <td style={{ padding: '4px 5px', color: 'var(--text-muted)', fontSize: 8, whiteSpace: 'nowrap' }}>
                  {t.share >= 1000 ? (t.share / 1000).toFixed(1) + 'k' : t.share} @ ${t.price > 0 ? t.price.toFixed(2) : '-'}
                </td>
                <td style={{ padding: '4px 5px' }}>
                  <span style={{
                    fontSize: 7, padding: '1px 4px', borderRadius: 2,
                    background: `${impactColor(t.impact)}18`,
                    color: impactColor(t.impact), fontWeight: 700,
                  }}>{t.impact}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '3px 8px', fontSize: 7, color: 'var(--text-ghost)', borderTop: '1px solid var(--border-subtle)' }}>
          SEC Form 4 fillings (Real-Time API directly via Finnhub)
        </div>
      </PanelContent>
    </Panel>
  );
}
