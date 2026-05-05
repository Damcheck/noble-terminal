'use client';

import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';

function formatNumber(n: number | undefined | null, decimals = 2): string {
  if (n == null) return '—';
  return n.toFixed(decimals);
}

function formatChange(n: number | undefined | null): { text: string; color: string } {
  if (n == null) return { text: '—', color: 'var(--text-ghost)' };
  if (n > 0) return { text: `+${n.toFixed(2)}%`, color: '#44ff88' };
  if (n < 0) return { text: `${n.toFixed(2)}%`, color: '#ff4444' };
  return { text: '0.00%', color: 'var(--text-muted)' };
}

export default function VixBreadthPanel() {
  const prices = useMarketStore(s => s.prices);

  // VIX Data
  const vix = prices['^VIX'];
  
  // Breadth proxy using Sector ETFs (11 GICS sectors)
  const sectors = ['XLK', 'XLV', 'XLF', 'XLY', 'XLI', 'XLE', 'XLC', 'XLB', 'XLU', 'XLRE'];
  let advancers = 0;
  let decliners = 0;
  let unchanged = 0;

  sectors.forEach(s => {
    const p = prices[s];
    if (p && p.change_pct != null) {
      if (p.change_pct > 0) advancers++;
      else if (p.change_pct < 0) decliners++;
      else unchanged++;
    }
  });

  const totalSectors = advancers + decliners + unchanged;
  const advanceRatio = totalSectors > 0 ? advancers / totalSectors : 0.5;

  const getVixStatus = (val: number) => {
    if (val < 15) return { label: 'LOW FEAR', color: '#44ff88' };
    if (val < 20) return { label: 'NORMAL', color: '#ffaa00' };
    if (val < 30) return { label: 'HIGH FEAR', color: '#ff4444' };
    return { label: 'EXTREME', color: '#ff0000' };
  };

  const vixStatus = vix ? getVixStatus(vix.price) : { label: '—', color: 'var(--text-ghost)' };
  const vixChange = formatChange(vix?.change_pct);

  return (
    <Panel>
      <PanelHeader title="VIX & Market Breadth" badge={<LiveBadge />} />
      <PanelContent noPad>
        <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: 9, color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5, fontFamily: 'var(--font-mono)' }}>CBOE VOLATILITY INDEX (VIX)</span>
            <span style={{
              fontSize: 7, padding: '2px 6px', borderRadius: 2, fontWeight: 700,
              background: `${vixStatus.color}18`, color: vixStatus.color, letterSpacing: 0.5,
              fontFamily: 'var(--font-mono)'
            }}>
              {vixStatus.label}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 300, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
              {formatNumber(vix?.price)}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: vixChange.color, fontFamily: 'var(--font-mono)' }}>
              {vixChange.text}
            </span>
          </div>
        </div>

        <div style={{ padding: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: 9, color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5, fontFamily: 'var(--font-mono)' }}>SECTOR ADVANCE / DECLINE</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#44ff88' }}>{advancers} ADV</span>
            <span style={{ color: 'var(--text-ghost)' }}>{unchanged} UNC</span>
            <span style={{ color: '#ff4444' }}>{decliners} DEC</span>
          </div>

          {/* Breadth Bar */}
          <div style={{ width: '100%', height: 4, background: 'var(--overlay-subtle)', borderRadius: 2, display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: `${(advancers / Math.max(1, totalSectors)) * 100}%`, background: '#44ff88', transition: 'width 0.3s' }} />
            <div style={{ width: `${(unchanged / Math.max(1, totalSectors)) * 100}%`, background: 'var(--text-ghost)', transition: 'width 0.3s' }} />
            <div style={{ width: `${(decliners / Math.max(1, totalSectors)) * 100}%`, background: '#ff4444', transition: 'width 0.3s' }} />
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
