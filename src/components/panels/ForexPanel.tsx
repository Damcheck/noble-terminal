'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, Sparkline } from '@/components/ui/Panel';
import { FOREX_PAIRS as MOCK_FOREX_PAIRS } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

export default function ForexPanel() {
  const { prices, isRealtimeConnected } = useMarketStore();

  // Merge Realtime Data into Mock data array for layout stability
  const renderList = useMemo(() => {
    return MOCK_FOREX_PAIRS.map(mockItem => {
      // Find matching forex pair in the store. Supabase might store EUR/USD or EURUSD=X. 
      // We will check multiple variations.
      const liveData = prices[mockItem.pair] || prices[`${mockItem.pair.replace('/', '')}=X`];
      
      if (liveData) {
        return {
          ...mockItem,
          bid: liveData.bid?.toFixed(4) || mockItem.bid,
          ask: liveData.ask?.toFixed(4) || mockItem.ask,
          change: liveData.change_pct || mockItem.change,
        };
      }
      return mockItem;
    });
  }, [prices]);

  return (
    <Panel>
      <PanelHeader 
        title="Forex" 
        count={renderList.length} 
        badge={isRealtimeConnected ? <LiveBadge /> : undefined} 
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['PAIR', 'BID', 'ASK', 'CHG%', ''].map(h => (
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
            {renderList.map((item, i) => {
              const up = item.change >= 0;
              return (
                <tr
                  key={item.pair}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: item.highlight
                      ? 'rgba(255,170,0,0.06)'
                      : i % 2 === 0
                      ? 'transparent'
                      : 'var(--overlay-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = item.highlight
                      ? 'rgba(255,170,0,0.12)'
                      : 'var(--overlay-light)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = item.highlight
                      ? 'rgba(255,170,0,0.06)'
                      : i % 2 === 0
                      ? 'transparent'
                      : 'var(--overlay-subtle)';
                  }}
                >
                  <td style={{ padding: '6px 8px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: item.highlight ? '#ffaa00' : 'var(--text)',
                        fontSize: 10,
                      }}
                    >
                      {item.pair}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontSize: 10 }}>
                    {item.bid}
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontSize: 10 }}>
                    {item.ask}
                  </td>
                  <td style={{ padding: '6px 8px', color: up ? '#44ff88' : '#ff4444', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {up ? '+' : ''}{item.change.toFixed(2)}%
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    <Sparkline data={item.spark} up={up} width={48} height={16} />
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
