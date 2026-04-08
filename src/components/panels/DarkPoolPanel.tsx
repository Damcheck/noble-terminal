'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

// Time & Sales (Recent Trades) — displaying live trade prints directly from Finnhub WebSocket.
// Replaced fabricated Dark Pool data with 100% real tick data.

export default function TimeAndSalesPanel() {
  const { tradeHistory, isConnected } = useFinnhubStore();
  const { selectedSymbol } = useMarketStore();
  
  const rawSymbol = selectedSymbol.includes(':') ? selectedSymbol.split(':')[1] : selectedSymbol;

  // Filter global history to only show real trades for the currently selected symbol
  const recentTrades = useMemo(() => {
    // If we're looking at a specific crypto shortcode, check for variants
    const variants = [
      rawSymbol,
      `${rawSymbol}-USD`,
      rawSymbol.replace('-USD', '')
    ];
    return tradeHistory.filter(t => variants.includes(t.symbol));
  }, [tradeHistory, rawSymbol]);

  return (
    <Panel>
      <PanelHeader title={`Time & Sales (Tape) — ${rawSymbol || '---'}`} count={recentTrades.length} badge={<LiveBadge />} />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['TIME', 'SYM', 'SIDE', 'PRICE', 'SIZE', 'COND', 'EXCH'].map(h => (
                <th key={h} style={{
                  padding: '4px 5px', textAlign: 'left', fontSize: 8,
                  color: 'var(--text-ghost)', fontWeight: 600,
                  letterSpacing: 0.5, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentTrades.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1 }}>
                  {!isConnected ? '[ AWAITING SOCKET CONNECTION ]' : '[ WAITING FOR LIVE EXCHANGE PRINTS ]'}
                </td>
              </tr>
            ) : recentTrades.map((t, i) => {
              // Determine side based on price tick direction
              const isUp = t.prevPrice ? t.price >= t.prevPrice : true;
              const sideColor = isUp ? '#44ff88' : '#ff4444';
              const timeStr = new Date(t.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const dec = t.price < 10 ? 4 : 2;

              return (
              <tr key={`${t.symbol}-${t.timestamp}-${i}`} style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
              }}>
                <td style={{ padding: '4px 5px', color: 'var(--text-muted)' }}>{timeStr}</td>
                <td style={{ padding: '4px 5px', fontWeight: 600 }}>{t.symbol}</td>
                <td style={{ padding: '4px 5px', color: sideColor }}>{isUp ? 'BUY' : 'SELL'}</td>
                <td style={{ padding: '4px 5px', fontFamily: 'var(--font-mono)' }}>{t.price.toFixed(dec)}</td>
                <td style={{ padding: '4px 5px', fontFamily: 'var(--font-mono)' }}>{t.volume.toLocaleString(undefined, { maximumFractionDigits: 5 })}</td>
                <td style={{ padding: '4px 5px', color: 'var(--text-ghost)', fontSize: 8 }}>AUTO</td>
                <td style={{ padding: '4px 5px', color: 'var(--text-ghost)', fontSize: 8 }}>F-HUB</td>
              </tr>
            )})}
          </tbody>
        </table>
      </PanelContent>
    </Panel>
  );
}
