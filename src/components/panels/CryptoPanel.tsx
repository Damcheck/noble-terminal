'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, WSBadge, Sparkline, TickingPrice } from '@/components/ui/Panel';
import { CRYPTO_LIST as MOCK_CRYPTO_LIST } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

function getFearColor(v: number) {
  if (v < 25) return '#ff4444';
  if (v < 45) return '#ff8800';
  if (v < 55) return '#ffaa00';
  if (v < 75) return '#44aa44';
  return '#44ff88';
}

export default function CryptoPanel() {
  const { prices, isRealtimeConnected, initializeRealtime, setSelectedSymbol } = useMarketStore();
  const { ticks, isConnected: isFinnhubConnected } = useFinnhubStore();

  // Live Fear & Greed from Alternative.me (free, no key needed)
  const [fearGreed, setFearGreed] = useState<{ value: number; label: string } | null>(null);
  const fetchFearGreed = useCallback(async () => {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      const data = await res.json();
      if (data?.data?.[0]) {
        setFearGreed({ value: Number(data.data[0].value), label: data.data[0].value_classification.toUpperCase() });
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchFearGreed();
    const id = setInterval(fetchFearGreed, 300_000); // refresh every 5 min
    return () => clearInterval(id);
  }, [fetchFearGreed]);

  const globalMeta = prices['__CRYPTO_GLOBAL__'];
  const btcDom = globalMeta?.extra?.btc_dominance 
    ? `${Number(globalMeta.extra.btc_dominance).toFixed(1)}%` 
    : '52.4%';
  const totalMcap = globalMeta?.price 
    ? `$${(globalMeta.price / 1e12).toFixed(2)}T` 
    : '2.81T';

  const fearVal = fearGreed?.value ?? 50;
  const fearLabel = fearGreed?.label ?? 'LOADING';
  const color = getFearColor(fearVal);
  const fill = (fearVal / 100) * 157;

  // Merge Realtime Data into Mock data array for layout stability
  const renderList = useMemo(() => {
    return MOCK_CRYPTO_LIST.map(mockItem => {
      // Find matching crypto in the store. Supabase might store BTC-USD or just BTC. 
      // Our mock has "BTC", "ETH" etc.
      const ticker = `${mockItem.symbol}-USD`; // Matches our internal finnhub keys

      // Priority 1: Finnhub live tick
      const tick = ticks[ticker];
      if (tick) {
        return {
          ...mockItem,
          price: tick.price,
          change24h: prices[ticker]?.change_pct ?? mockItem.change24h,
          mcap: prices[ticker]?.market_cap ? `$${(prices[ticker]!.market_cap! / 1e9).toFixed(1)}B` : mockItem.mcap,
          _hasTick: true,
        };
      }

      // Priority 2: Supabase DB price
      const liveData = prices[ticker] || prices[mockItem.symbol];
      if (liveData) {
        return {
          ...mockItem,
          price: liveData.price || mockItem.price,
          change24h: liveData.change_pct || mockItem.change24h,
          mcap: liveData.market_cap ? `$${(liveData.market_cap / 1e9).toFixed(1)}B` : mockItem.mcap,
          _hasTick: false,
        };
      }
      return { ...mockItem, _hasTick: false };
    });
  }, [prices, ticks]);

  return (
    <Panel>
      <PanelHeader 
        title="Crypto" 
        count={renderList.length} 
        badge={isFinnhubConnected ? <WSBadge /> : isRealtimeConnected ? <LiveBadge /> : undefined} 
      />
      <PanelContent noPad>
        {/* Fear & Greed + Stats */}
        <div
          className="flex items-center gap-4 px-3 py-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--overlay-subtle)' }}
        >
          {/* Mini gauge */}
          <svg viewBox="0 0 80 46" style={{ width: 80, height: 46, flexShrink: 0 }}>
            <path d="M 7 40 A 33 33 0 0 1 73 40" fill="none" stroke="var(--border-strong)" strokeWidth={5} strokeLinecap="round" />
            <path d="M 7 40 A 33 33 0 0 1 73 40" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${fill * 0.67} 105`} />
            <text x="40" y="36" textAnchor="middle" fill={color} fontSize="14" fontWeight="700" fontFamily="var(--font-mono)">{fearVal}</text>
          </svg>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: 0.5 }}>FEAR &amp; GREED</div>
            <div style={{ fontSize: 12, fontWeight: 700, color }}>{fearLabel}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>BTC DOM</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{btcDom}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>TOTAL MCAP</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{totalMcap}</div>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['COIN', 'PRICE', '24H%', 'MCAP', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '5px 8px',
                    textAlign: 'left',
                    fontSize: 9,
                    color: 'var(--text-ghost)',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderList.map((c, i) => {
              const up = c.change24h >= 0;
              return (
                <tr
                  key={c.symbol}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onClick={() => setSelectedSymbol(`${c.symbol}-USD`)}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--overlay-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)'; }}
                >
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 10 }}>{c.symbol}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{c.name}</div>
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                    <TickingPrice 
                      price={c.price} 
                      style={{ fontSize: 10, color: 'var(--text)', fontFamily: 'var(--font-mono)' }} 
                    />
                  </td>
                  <td style={{ padding: '5px 8px', color: up ? '#44ff88' : '#ff4444', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {up ? '+' : ''}{c.change24h.toFixed(2)}%
                  </td>
                  <td style={{ padding: '5px 8px', color: 'var(--text-muted)', textAlign: 'right', fontSize: 9 }}>
                    {c.mcap}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                    <Sparkline data={c.spark} up={up} width={48} height={16} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PanelContent>
    </Panel>
  );
}
