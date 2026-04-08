'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useBinanceStore } from '@/store/binanceStore';
import { useMarketStore } from '@/store/marketStore';

// Liquidations Panel: 100% REAL data showing forced cross-margin liquidations 
// globally streamed from Binance Futures.

function formatUnits(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function LiquidationsPanel() {
  const { liquidations, isConnected } = useBinanceStore();
  const { selectedSymbol } = useMarketStore();

  const rawSymbol = selectedSymbol.includes(':') ? selectedSymbol.split(':')[1] : selectedSymbol;

  // Global Liquidations vs Selected Symbol mapping
  // A limit of 25 shown for performance
  const displayItems = useMemo(() => {
    return liquidations.slice(0, 25);
  }, [liquidations]);

  return (
    <Panel>
      <PanelHeader title="Crypto Liquidations (Binance)" count={liquidations.length} badge={<LiveBadge />} />
      <PanelContent noPad>
        <div style={{ padding: '8px 10px', fontSize: 10, color: 'var(--text-ghost)', borderBottom: '1px solid var(--border)', background: 'var(--overlay-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Real-time forced margin closures</span>
            <span style={{ color: isConnected ? '#44ff88' : '#ffaa00' }}>{isConnected ? 'WSS: CONNECTED' : 'WSS: DISCONNECTED'}</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['TIME', 'PAIR', 'SIDE (REKT)', 'PRICE', 'SIZE ($)', 'COND'].map(h => (
                <th key={h} style={{
                  padding: '4px 6px', textAlign: 'left', fontSize: 8,
                  color: 'var(--text-ghost)', fontWeight: 600,
                  letterSpacing: 0.5, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1 }}>
                  {!isConnected ? '[ CONNECTING TO EXCHANGE ]' : '[ WAITING FOR LIQUIDATION EVENTS ]'}
                </td>
              </tr>
            ) : displayItems.map((l, i) => {
              // Liquidate Longs = SELL executed, Liquidate Shorts = BUY executed
              const isLongRekt = l.side === 'SELL'; 
              const color = isLongRekt ? '#ff4444' : '#44ff88';
              const timeStr = new Date(l.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
              
              // Highlight if it's the currently selected symbol
              const isSelected = rawSymbol.includes(l.symbol) || l.symbol.includes(rawSymbol.replace('-USD',''));

              return (
              <tr key={`${l.symbol}-${l.time}-${i}`} style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(255,170,0,0.1)' : i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
              }}>
                <td style={{ padding: '4px 6px', color: 'var(--text-muted)' }}>{timeStr}</td>
                <td style={{ padding: '4px 6px', fontWeight: 600, color: isSelected ? '#ffaa00' : 'var(--text)' }}>{l.symbol}</td>
                <td style={{ padding: '4px 6px', color: color }}>{isLongRekt ? 'LONG LIQ' : 'SHORT LIQ'}</td>
                <td style={{ padding: '4px 6px' }}>{l.price.toLocaleString(undefined, { maximumFractionDigits: 5 })}</td>
                <td style={{ padding: '4px 6px', fontWeight: 700 }}>{formatUnits(l.notional)}</td>
                <td style={{ padding: '4px 6px', color: 'var(--text-ghost)', fontSize: 8 }}>FORCE</td>
              </tr>
            )})}
          </tbody>
        </table>
      </PanelContent>
    </Panel>
  );
}
