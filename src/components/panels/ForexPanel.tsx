'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, WSBadge, Sparkline, TickingPrice } from '@/components/ui/Panel';
import { FOREX_PAIRS as MOCK_FOREX_PAIRS } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

export default function ForexPanel() {
  const { prices, isRealtimeConnected } = useMarketStore();
  const { ticks, isConnected: isFinnhubConnected } = useFinnhubStore();

  // Merge Realtime Data into Mock data array for layout stability
  const renderList = useMemo(() => {
    return MOCK_FOREX_PAIRS.map(mockItem => {
      // Priority 1: Finnhub live tick
      const tick = ticks[mockItem.pair]; // e.g. "EUR/USD"
      if (tick) {
        return {
          ...mockItem,
          bid: tick.price,
          ask: tick.price * 1.0002, // estimate ask from live tick
          change: prices[mockItem.pair]?.change_pct ?? mockItem.change,
        };
      }

      // Priority 2: Supabase DB price
      const liveData = prices[mockItem.pair] || prices[`${mockItem.pair.replace('/', '')}=X`];
      if (liveData) {
        return {
          ...mockItem,
          bid: liveData.bid || liveData.price || mockItem.bid,
          ask: liveData.ask || mockItem.ask,
          change: liveData.change_pct || mockItem.change,
        };
      }
      return mockItem;
    });
  }, [prices, ticks]);

  return (
    <Panel>
      <PanelHeader 
        title="Forex" 
        count={renderList.length} 
        badge={isFinnhubConnected ? <WSBadge /> : isRealtimeConnected ? <LiveBadge /> : undefined} 
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
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    <TickingPrice 
                      price={Number(item.bid)} 
                      decimals={4} 
                      style={{ fontSize: 10, color: 'var(--text)', fontFamily: 'var(--font-mono)' }} 
                    />
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontSize: 10 }}>
                    {typeof item.ask === 'number' ? item.ask.toFixed(4) : Number(item.ask).toFixed(4)}
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
