'use client';

import { useEffect, useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, CachedBadge, LiveBadge, Sparkline } from '@/components/ui/Panel';
import { SECTOR_PERFORMANCE, COMMODITIES } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

// Re-export MacroPanel from its own file
export { MacroPanel } from '@/components/panels/MacroPanel';

// Sector ETF symbols map (must match cron/sectors output)
const SECTOR_ETF_SYMBOLS = [
  'XLK', 'XLV', 'XLF', 'XLY', 'XLI', 'XLE', 'XLC', 'XLB', 'XLU', 'XLRE', 'XLP'
];

// ── Sector Performance Panel ────────────────────────────────
export function SectorPanel() {
  const { prices, isRealtimeConnected, initializeRealtime } = useMarketStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  // Build from live data if available, else fallback to mock
  const sectorData = useMemo(() => {
    const liveSectors = SECTOR_ETF_SYMBOLS
      .map(sym => prices[sym])
      .filter(Boolean);

    if (liveSectors.length >= 3) {
      return liveSectors.map(p => ({
        name: (p.extra as any)?.name || p.symbol,
        change: p.change_pct,
      }));
    }
    return SECTOR_PERFORMANCE;
  }, [prices]);

  const maxAbs = Math.max(...sectorData.map(s => Math.abs(s.change)), 0.01);

  return (
    <Panel>
      <PanelHeader
        title="Sector Performance"
        badge={isRealtimeConnected ? <LiveBadge /> : <CachedBadge label="15m" />}
      />
      <PanelContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[...sectorData].sort((a, b) => b.change - a.change).map(s => {
            const up = s.change >= 0;
            const barW = (Math.abs(s.change) / maxAbs) * 100;
            return (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 90, fontSize: 9, color: 'var(--text-dim)', flexShrink: 0, textAlign: 'right' }}>
                  {s.name}
                </span>
                <div style={{ flex: 1, height: 14, background: 'var(--overlay-subtle)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      [up ? 'left' : 'right']: 0,
                      top: 0,
                      height: '100%',
                      width: `${barW}%`,
                      background: up ? 'rgba(68,255,136,0.35)' : 'rgba(255,68,68,0.35)',
                      borderRadius: 1,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 48,
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: up ? '#44ff88' : '#ff4444',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {up ? '+' : ''}{s.change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </PanelContent>
    </Panel>
  );
}

// MacroPanel is now in its own file (MacroPanel.tsx) and re-exported above

// Commodity Yahoo Finance symbols (must match cron/prices output)
const COMMODITY_SYMBOLS = ['GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'PL=F'];
const COMMODITY_META: Record<string, { name: string; unit: string; highlight?: boolean }> = {
  'GC=F': { name: 'Gold',         unit: 'per oz',  highlight: true },
  'SI=F': { name: 'Silver',       unit: 'per oz' },
  'CL=F': { name: 'Crude Oil',    unit: 'per bbl' },
  'NG=F': { name: 'Natural Gas',  unit: 'per MMBtu' },
  'HG=F': { name: 'Copper',       unit: 'per lb' },
  'PL=F': { name: 'Platinum',     unit: 'per oz' },
};

// ── Commodities Panel ─────────────────────────────────────────
export function CommoditiesPanel() {
  const { prices, isRealtimeConnected, initializeRealtime } = useMarketStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  const commodityRows = useMemo(() => {
    const live = COMMODITY_SYMBOLS.map(sym => prices[sym]).filter(Boolean);
    if (live.length >= 3) {
      return live.map(p => ({
        symbol: p.symbol,
        name: COMMODITY_META[p.symbol]?.name || p.symbol,
        unit: COMMODITY_META[p.symbol]?.unit || '',
        price: p.price,
        change: p.change_pct,
        highlight: COMMODITY_META[p.symbol]?.highlight,
        spark: [] as number[],
      }));
    }
    return COMMODITIES;
  }, [prices]);

  return (
    <Panel>
      <PanelHeader
        title="Commodities"
        count={commodityRows.length}
        badge={isRealtimeConnected ? <LiveBadge /> : <CachedBadge label="5m" />}
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['COMMODITY', 'PRICE', 'CHG%', ''].map(h => (
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
            {commodityRows.map((c, i) => {
              const up = c.change >= 0;
              return (
                <tr
                  key={c.symbol}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: c.highlight
                      ? 'rgba(255,170,0,0.06)'
                      : i % 2 === 0
                      ? 'transparent'
                      : 'var(--overlay-subtle)',
                  }}
                >
                  <td style={{ padding: '6px 8px' }}>
                    <div style={{ fontWeight: 700, color: c.highlight ? '#ffaa00' : 'var(--text)', fontSize: 10 }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{c.unit}</div>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    {c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                  </td>
                  <td style={{ padding: '6px 8px', color: up ? '#44ff88' : '#ff4444', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {up ? '+' : ''}{c.change.toFixed(2)}%
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    <Sparkline data={c.spark ?? []} up={up} width={48} height={16} />
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
