'use client';

import { Panel, PanelHeader, PanelContent, ArcGauge, CachedBadge } from '@/components/ui/Panel';
import { RISK_GAUGES } from '@/lib/mockData';

const stats = [
  { label: 'VIX', value: RISK_GAUGES.vix.toFixed(2), change: -3.21, unit: '' },
  { label: 'PUT/CALL', value: RISK_GAUGES.putCallRatio.toFixed(2), change: 0.04, unit: '' },
  { label: 'ADV/DEC', value: RISK_GAUGES.advanceDecline.toFixed(2), change: 0.21, unit: '' },
  { label: 'BREADTH', value: RISK_GAUGES.breadth + '%', change: 2.1, unit: '' },
];

export default function RiskPanel() {
  return (
    <Panel>
      <PanelHeader title="Risk Overview" badge={<CachedBadge label="LIVE" />} />
      <PanelContent>
        {/* Gauges Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <ArcGauge value={RISK_GAUGES.marketRisk} label="Market Risk" size={90} />
          <ArcGauge value={RISK_GAUGES.volatility} label="Volatility" size={90} />
          <ArcGauge value={RISK_GAUGES.sentiment} label="Sentiment" size={90} />
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
          }}
        >
          {stats.map(s => {
            const up = s.change >= 0;
            return (
              <div
                key={s.label}
                style={{
                  padding: '8px 10px',
                  background: 'var(--overlay-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                }}
              >
                <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: 0.5, marginBottom: 3 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: up ? '#44ff88' : '#ff4444',
                    marginTop: 2,
                  }}
                >
                  {up ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}{s.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk legend */}
        <div
          className="flex items-center justify-between mt-3"
          style={{ fontSize: 9, color: 'var(--text-muted)' }}
        >
          <span style={{ color: '#44ff88' }}>■ LOW RISK</span>
          <span style={{ color: '#ffaa00' }}>■ MODERATE</span>
          <span style={{ color: '#ff4444' }}>■ HIGH RISK</span>
        </div>
      </PanelContent>
    </Panel>
  );
}
