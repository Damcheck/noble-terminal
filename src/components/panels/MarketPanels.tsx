'use client';

import { useEffect, useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

// Re-export MacroPanel from its own file
export { MacroPanel } from '@/components/panels/MacroPanel';

// ── Sector Performance — TradingView Market Overview widget ────
export function SectorPanel() {
  return (
    <Panel>
      <PanelHeader title="Sector Performance" badge={<LiveBadge />} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <iframe
          src="https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%221D%22%2C%22showChart%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Atrue%2C%22showSymbolLogo%22%3Atrue%2C%22showFloatingTooltip%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Sectors%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22AMEX%3AXLK%22%2C%22d%22%3A%22Technology%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLV%22%2C%22d%22%3A%22Healthcare%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLF%22%2C%22d%22%3A%22Financials%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLY%22%2C%22d%22%3A%22Consumer+Disc%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLE%22%2C%22d%22%3A%22Energy%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLI%22%2C%22d%22%3A%22Industrials%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLB%22%2C%22d%22%3A%22Materials%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLU%22%2C%22d%22%3A%22Utilities%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLP%22%2C%22d%22%3A%22Consumer+Staples%22%7D%2C%7B%22s%22%3A%22AMEX%3AXLRE%22%2C%22d%22%3A%22Real+Estate%22%7D%5D%2C%22originalTitle%22%3A%22Sectors%22%7D%5D%7D"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Sector Performance"
          allowFullScreen
        />
      </div>
    </Panel>
  );
}

// ── Commodities — live Finnhub ticks + Supabase fallback ──────
const COMMODITY_SYMBOLS = ['XAUUSD', 'XAGUSD', 'USOIL', 'BRENT', 'COPPER'];
const COMMODITY_META: Record<string, { name: string; unit: string; highlight?: boolean }> = {
  'XAUUSD': { name: 'Gold',         unit: 'XAU/USD · per oz',   highlight: true },
  'XAGUSD': { name: 'Silver',       unit: 'XAG/USD · per oz' },
  'USOIL':  { name: 'Crude Oil',    unit: 'WTI · per bbl',       highlight: true },
  'BRENT':  { name: 'Brent Oil',    unit: 'UKOIL · per bbl' },
  'COPPER': { name: 'Copper',       unit: 'per lb' },
};

export function CommoditiesPanel() {
  const { prices, initializeRealtime } = useMarketStore();
  const { ticks } = useFinnhubStore();

  useEffect(() => { initializeRealtime(); }, [initializeRealtime]);

  const commodityRows = useMemo(() => {
    return COMMODITY_SYMBOLS.map(sym => {
      const meta = COMMODITY_META[sym];
      // Priority: Finnhub tick → Supabase price → Realistic Anchor if DB isn't synced
      const tick = ticks[sym] || ticks[`OANDA:${sym}`];
      const live = prices[sym] || prices[sym === 'USOIL' ? 'CL=F' : ''];

      let price = 0;
      let change = 0;

      if (tick?.price) {
        price = tick.price;
        const prev = tick.prevPrice ?? tick.price;
        change = prev > 0 ? ((tick.price - prev) / prev) * 100 : 0;
      } else if (live?.price) {
        price = live.price;
        change = live.change_pct;
      } else {
        // Only if user hasn't run crons or finnhub is disconnected
        price = sym === 'XAUUSD' ? 2450.10 : sym === 'USOIL' ? 82.50 : sym === 'XAGUSD' ? 30.2 : sym === 'BRENT' ? 86.40 : 4.50;
        change = 0;
      }

      return { symbol: sym, name: meta.name, unit: meta.unit, price, change, highlight: meta.highlight };
    });
  }, [prices, ticks]);

  const hasLive = commodityRows.some(r => ticks[r.symbol]?.price || prices[r.symbol]?.price);

  return (
    <Panel>
      <PanelHeader
        title="Commodities"
        count={commodityRows.length}
        badge={<LiveBadge />}
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['COMMODITY', 'PRICE', 'CHG%'].map(h => (
                <th key={h} style={{
                  padding: '5px 8px', textAlign: 'left', fontSize: 9,
                  color: 'var(--text-ghost)', fontWeight: 600,
                  letterSpacing: 0.5, borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commodityRows.map((c, i) => {
              const up = c.change >= 0;
              return (
                <tr key={c.symbol} style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: c.highlight ? 'rgba(255,170,0,0.06)' : i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                }}>
                  <td style={{ padding: '6px 8px' }}>
                    <div style={{ fontWeight: 700, color: c.highlight ? '#ffaa00' : 'var(--text)', fontSize: 10 }}>{c.name}</div>
                    <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{c.unit}</div>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontSize: 10 }}>
                    {c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                  </td>
                  <td style={{ padding: '6px 8px', color: up ? '#44ff88' : '#ff4444', fontWeight: 700, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {up ? '+' : ''}{c.change.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!hasLive && (
          <div style={{ padding: '4px 8px', fontSize: 8, color: 'var(--text-ghost)', textAlign: 'right' }}>
            Waiting for Finnhub tick…
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
