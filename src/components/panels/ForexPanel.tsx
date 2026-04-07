'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, WSBadge, Sparkline, TickingPrice } from '@/components/ui/Panel';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

// Strictly configured without ANY slashes so that Finnhub WebSocket ticks route perfectly
const FOREX_ONLY_PAIRS = [
  { symbol: 'EURUSD', name: 'Euro / USD', bid: 1.0841, ask: 1.0843, change: -0.22, spark: [1.0860, 1.0855, 1.0850, 1.0845, 1.0843, 1.0843, 1.0842, 1.0841] },
  { symbol: 'GBPUSD', name: 'British Pound / USD', bid: 1.2739, ask: 1.2741, change: 0.15, spark: [1.273, 1.273, 1.274, 1.274, 1.274, 1.274, 1.274, 1.274] },
  { symbol: 'USDJPY', name: 'USD / Yen', bid: 151.42, ask: 151.45, change: 0.31, spark: [151.1, 151.2, 151.3, 151.3, 151.4, 151.4, 151.4, 151.4] },
  { symbol: 'USDCHF', name: 'USD / Swiss Franc', bid: 0.8923, ask: 0.8925, change: -0.09, spark: [0.893, 0.893, 0.892, 0.892, 0.892, 0.892, 0.892, 0.892] },
  { symbol: 'AUDUSD', name: 'Aussie / USD', bid: 0.6441, ask: 0.6443, change: 0.28, spark: [0.642, 0.643, 0.643, 0.644, 0.644, 0.644, 0.644, 0.644] },
  { symbol: 'NZDUSD', name: 'Kiwi / USD', bid: 0.5981, ask: 0.5983, change: -0.15, spark: [0.599, 0.598, 0.598, 0.597, 0.598, 0.598, 0.598, 0.598] },
  { symbol: 'EURGBP', name: 'Euro / British Pound', bid: 0.8505, ask: 0.8507, change: -0.11, spark: [0.851, 0.851, 0.851, 0.850, 0.850, 0.850, 0.850, 0.850] },
  { symbol: 'USDCAD', name: 'USD / Canadian Dlr', bid: 1.3541, ask: 1.3543, change: 0.12, spark: [1.353, 1.354, 1.354, 1.354, 1.354, 1.354, 1.354, 1.354] },
];

export default function ForexPanel() {
  const { setSelectedSymbol } = useMarketStore();
  const { ticks, isConnected: isFinnhubConnected } = useFinnhubStore();

  const renderList = useMemo(() => {
    return FOREX_ONLY_PAIRS.map(baseItem => {
      const tick = ticks[baseItem.symbol];

      if (tick) {
        return {
          ...baseItem,
          bid: tick.price,
          ask: tick.price * 1.00015, // dynamic 1.5 pip spread estimation for FX
          // In a full production app, you would source the % change from a daily anchor.
          // For now, we return baseItem.change to maintain stability or a fixed anchor point.
          change: baseItem.change, 
        };
      }
      return baseItem;
    });
  }, [ticks]);

  return (
    <Panel>
      <PanelHeader 
        title="Forex" 
        count={renderList.length} 
        badge={isFinnhubConnected ? <WSBadge /> : <LiveBadge />} 
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
                  key={item.symbol}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onClick={() => setSelectedSymbol(item.symbol)}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = 'var(--overlay-light)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)';
                  }}
                >
                  <td style={{ padding: '6px 8px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: 'var(--text)',
                        fontSize: 10,
                      }}
                    >
                      {item.symbol.substring(0, 3)}/{item.symbol.substring(3)}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    <TickingPrice 
                      price={Number(item.bid)} 
                      decimals={item.symbol.includes('JPY') ? 3 : 4} 
                      style={{ fontSize: 10, color: 'var(--text)', fontFamily: 'var(--font-mono)' }} 
                    />
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontSize: 10 }}>
                    {typeof item.ask === 'number' ? item.ask.toFixed(item.symbol.includes('JPY') ? 3 : 4) : Number(item.ask).toFixed(item.symbol.includes('JPY') ? 3 : 4)}
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
