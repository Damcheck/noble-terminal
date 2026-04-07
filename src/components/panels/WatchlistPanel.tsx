'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, WSBadge, Sparkline, TickingPrice } from '@/components/ui/Panel';
import { WATCHLIST as MOCK_WATCHLIST } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

export default function WatchlistPanel() {
  const { prices, isRealtimeConnected } = useMarketStore();
  const { ticks, isConnected: isFinnhubConnected } = useFinnhubStore();

  const renderList = useMemo(() => {
    return MOCK_WATCHLIST.map(mockItem => {
      // Priority 1: Finnhub live tick (second-by-second)
      const tick = ticks[mockItem.symbol];
      if (tick) {
        return {
          ...mockItem,
          price: tick.price,
          change: prices[mockItem.symbol]?.change_pct ?? mockItem.change,
          volume: prices[mockItem.symbol]?.volume
            ? (prices[mockItem.symbol].volume! / 1e6).toFixed(1) + 'M'
            : mockItem.volume,
          _hasTick: true,
        };
      }

      // Priority 2: Supabase DB price (every 5 min)
      const liveData = prices[mockItem.symbol];
      if (liveData) {
        return {
          ...mockItem,
          price: liveData.price ?? mockItem.price,
          change: liveData.change_pct ?? mockItem.change,
          volume: liveData.volume
            ? (liveData.volume / 1e6).toFixed(1) + 'M'
            : mockItem.volume,
          _hasTick: false,
        };
      }

      return { ...mockItem, _hasTick: false };
    });
  }, [prices, ticks]);

  const badge = isFinnhubConnected
    ? <WSBadge />
    : isRealtimeConnected
    ? <LiveBadge />
    : undefined;

  return (
    <Panel>
      <PanelHeader title="Watchlist" count={renderList.length} badge={badge} />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['SYMBOL', 'PRICE', 'CHG%', 'VOL', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '5px 8px', textAlign: 'left', fontSize: 9,
                    color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5,
                    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderList.map((item, i) => {
              const up = item.change >= 0;
              return (
                <tr
                  key={item.symbol}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--overlay-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)'; }}
                >
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 10 }}>{item.symbol}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{item.name}</div>
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                    <TickingPrice
                      price={item.price}
                      style={{ fontSize: 10, color: 'var(--text)' }}
                    />
                  </td>
                  <td style={{ padding: '5px 8px', color: up ? '#44ff88' : '#ff4444', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {up ? '+' : ''}{item.change.toFixed(2)}%
                  </td>
                  <td style={{ padding: '5px 8px', color: 'var(--text-muted)', textAlign: 'right', fontSize: 9 }}>
                    {item.volume}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                    <Sparkline data={item.spark} up={up} width={52} height={18} />
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
