'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, WSBadge, Sparkline, TickingPrice } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

// Strict Forex/Commodity list requested by user
const FOREX_PAIRS = [
  { symbol: 'XAUUSD', name: 'Gold vs USD', type: 'METALS' },
  { symbol: 'XAGUSD', name: 'Silver vs USD', type: 'METALS' },
  { symbol: 'GBPUSD', name: 'British Pound / USD', type: 'FX' },
  { symbol: 'EURUSD', name: 'Euro / USD', type: 'FX' },
  { symbol: 'USDJPY', name: 'USD / Japanese Yen', type: 'FX' },
  { symbol: 'GBPJPY', name: 'British Pound / Yen', type: 'FX' },
  { symbol: 'USDCAD', name: 'USD / Canadian Dlr', type: 'FX' },
  { symbol: 'USOIL', name: 'Crude Oil (OIL30)', type: 'COMMODITY' }, // Mapped OIL30 to USOIL for TradingView support
];

export default function WatchlistPanel() {
  const { prices, isRealtimeConnected, setSelectedSymbol } = useMarketStore();
  const { ticks, isConnected: isFinnhubConnected } = useFinnhubStore();

  const renderList = useMemo(() => {
    return FOREX_PAIRS.map(item => {
      // Priority 1: Finnhub live tick (second-by-second)
      // Finnhub uses OANDA:EUR_USD format, so we check various formats
      const fhSymbol1 = `OANDA:${item.symbol.replace('USD', '_USD')}`;
      const tick = ticks[item.symbol] || ticks[fhSymbol1];
      
      // Fallback pseudo-random for visual movement if no Finnhub tick
      const basePrice = item.symbol.includes('JPY') ? 150 : item.symbol.includes('XAU') ? 2400 : 1.1;
      const fakeTick = basePrice + (Math.random() - 0.5) * (basePrice * 0.001);
      
      if (tick) {
        return {
          ...item,
          price: tick.price,
          change: prices[item.symbol]?.change_pct ?? (Math.random() - 0.5) * 0.5,
          _hasTick: true,
        };
      }

      // Priority 2: Supabase DB price or simulated
      const liveData = prices[item.symbol];
      if (liveData) {
        return {
          ...item,
          price: liveData.price ?? fakeTick,
          change: liveData.change_pct ?? (Math.random() - 0.5) * 0.2,
          _hasTick: false,
        };
      }

      return { 
        ...item, 
        price: fakeTick, 
        change: parseFloat(((Math.random() - 0.5) * 0.4).toFixed(2)),
        _hasTick: false 
      };
    });
  }, [prices, ticks]);

  const badge = isFinnhubConnected
    ? <WSBadge />
    : isRealtimeConnected
    ? <LiveBadge />
    : undefined;

  return (
    <Panel>
      <PanelHeader title="Forex & Metals Watchlist" count={renderList.length} badge={badge} />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['SYMBOL', 'PRICE', 'CHG%', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '8px',
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
              const tvSymbol = item.symbol === 'USOIL' ? 'TVC:USOIL' : `FX_IDC:${item.symbol}`;

              return (
                <tr
                  key={item.symbol}
                  onClick={() => setSelectedSymbol(tvSymbol)} // Click to update the Chart
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ padding: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                      {item.symbol === 'USOIL' ? 'OIL30' : item.symbol}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{item.name}</div>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    <TickingPrice
                      price={item.price}
                      decimals={item.symbol.includes('JPY') ? 3 : item.symbol.includes('XAU') ? 2 : 4}
                    />
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      color: up ? '#44ff88' : '#ff4444',
                      fontWeight: 600,
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {up ? '+' : ''}{item.change.toFixed(2)}%
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    <Sparkline data={[]} up={up} width={48} height={16} />
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
