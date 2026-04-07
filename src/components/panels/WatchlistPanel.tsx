'use client';

import { useEffect, useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, Sparkline } from '@/components/ui/Panel';
import { WATCHLIST as MOCK_WATCHLIST } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

export default function WatchlistPanel() {
  const { prices, initializeRealtime, isRealtimeConnected } = useMarketStore();

  // Initialize Supabase realtime listeners on mount!
  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  // Merge Realtime Data into Mock data array for layout stability
  const renderList = useMemo(() => {
    return MOCK_WATCHLIST.map(mockItem => {
      // If we have live Supabase data for this symbol, layer it cleanly!
      const liveData = prices[mockItem.symbol];
      if (liveData) {
        return {
          ...mockItem,
          price: liveData.price || mockItem.price,
          change: liveData.change_pct || mockItem.change,
          volume: liveData.volume ? liveData.volume.toLocaleString() : mockItem.volume,
        };
      }
      return mockItem;
    });
  }, [prices]);

  return (
    <Panel>
      <PanelHeader 
        title="Watchlist (Live)" 
        count={renderList.length} 
        badge={isRealtimeConnected ? <LiveBadge /> : undefined} 
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['SYMBOL', 'PRICE', 'CHG%', 'VOL', ''].map(h => (
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
                    whiteSpace: 'nowrap',
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
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = 'var(--overlay-light)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)';
                  }}
                >
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 10 }}>{item.symbol}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{item.name}</div>
                  </td>
                  <td style={{ padding: '5px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '5px 8px', color: up ? '#44ff88' : '#ff4444', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {up ? '+' : ''}{item.change.toFixed(2)}%
                  </td>
                  <td style={{ padding: '5px 8px', color: 'var(--text-muted)', textAlign: 'right', fontSize: 9 }}>
                    {item.volume}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                    {/* The Sparkline defaults to the mock array to retain a stable graph UI until live history pipelines are built */}
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
