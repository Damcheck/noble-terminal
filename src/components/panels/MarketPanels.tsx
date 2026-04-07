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
const COMMODITY_SYMBOLS = ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'PL=F'];
const COMMODITY_META: Record<string, { name: string; unit: string; highlight?: boolean }> = {
  'GC=F': { name: 'Gold',         unit: 'XAU/USD · per oz',   highlight: true },
  'SI=F': { name: 'Silver',       unit: 'XAG/USD · per oz' },
  'CL=F': { name: 'Crude Oil',    unit: 'WTI · per bbl',       highlight: true },
  'NG=F': { name: 'Natural Gas',  unit: 'per MMBtu' },
  'HG=F': { name: 'Copper',       unit: 'per lb' },
  'PL=F': { name: 'Platinum',     unit: 'per oz' },
};

const COMMODITY_FALLBACK = [
  { symbol: 'GC=F',  name: 'Gold',        unit: 'XAU/USD · per oz',  price: 2978.45, change: 1.34, highlight: true },
  { symbol: 'SI=F',  name: 'Silver',       unit: 'XAG/USD · per oz',  price: 34.12,   change: 0.82 },
  { symbol: 'CL=F',  name: 'Crude Oil',    unit: 'WTI · per bbl',     price: 71.34,   change: -0.94, highlight: true },
  { symbol: 'NG=F',  name: 'Natural Gas',  unit: 'per MMBtu',         price: 3.45,    change: 1.21 },
  { symbol: 'HG=F',  name: 'Copper',       unit: 'per lb',            price: 4.87,    change: -0.3 },
  { symbol: 'PL=F',  name: 'Platinum',     unit: 'per oz',            price: 980.0,   change: 0.5 },
];

export function CommoditiesPanel() {
  const { prices, initializeRealtime } = useMarketStore();
  const { ticks } = useFinnhubStore();

  useEffect(() => { initializeRealtime(); }, [initializeRealtime]);

  const commodityRows = useMemo(() => {
    return COMMODITY_SYMBOLS.map(sym => {
      const meta = COMMODITY_META[sym];
      // Priority: Finnhub tick → Supabase price → fallback
      const tick = ticks[sym];
      const live = prices[sym];
      const fb = COMMODITY_FALLBACK.find(c => c.symbol === sym)!;

      if (tick?.price) {
        const prev = tick.prevPrice ?? tick.price;
        const changePct = prev > 0 ? ((tick.price - prev) / prev) * 100 : 0;
        return { symbol: sym, name: meta.name, unit: meta.unit, price: tick.price, change: changePct, highlight: meta.highlight };
      }
      if (live?.price) {
        return { symbol: sym, name: meta.name, unit: meta.unit, price: live.price, change: live.change_pct, highlight: meta.highlight };
      }
      return fb;
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
