'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, ArcGauge, LiveBadge, CachedBadge } from '@/components/ui/Panel';
import { RISK_GAUGES } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

export default function RiskPanel() {
  const { prices, isRealtimeConnected } = useMarketStore();

  // Pull live VIX from store if available (stored as ^VIX or VIXCLS in macro)
  const liveVix = prices['^VIX']?.price ?? prices['VIXCLS']?.price ?? null;

  // Derive live risk gauges from available data
  const riskData = useMemo(() => {
    const vix = liveVix ?? RISK_GAUGES.vix;
    // Market risk: scale 0-100 from VIX (VIX 10=low, VIX 40=very high)
    const marketRisk = Math.min(Math.max(((vix - 10) / 30) * 100, 0), 100);
    // Volatility: similarly scaled
    const volatility = Math.min(Math.max(((vix - 8) / 35) * 100, 0), 100);
    // Sentiment: inverse of market risk (high VIX = fear = low sentiment)
    const sentiment = 100 - marketRisk;

    return {
      vix,
      marketRisk: Math.round(marketRisk),
      volatility: Math.round(volatility),
      sentiment: Math.round(sentiment),
    };
  }, [liveVix]);

  const stats = [
    { label: 'VIX', value: riskData.vix.toFixed(2), change: liveVix ? (liveVix - RISK_GAUGES.vix) : -3.21 },
    { label: 'PUT/CALL', value: RISK_GAUGES.putCallRatio.toFixed(2), change: 0.04 },
    { label: 'ADV/DEC', value: RISK_GAUGES.advanceDecline.toFixed(2), change: 0.21 },
    { label: 'BREADTH', value: RISK_GAUGES.breadth + '%', change: 2.1 },
  ];

  return (
    <Panel>
      <PanelHeader
        title="Risk Overview"
        badge={isRealtimeConnected ? <LiveBadge /> : <CachedBadge label="LIVE" />}
      />
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
          <ArcGauge value={riskData.marketRisk} label="Market Risk" size={90} />
          <ArcGauge value={riskData.volatility} label="Volatility" size={90} />
          <ArcGauge value={riskData.sentiment} label="Sentiment" size={90} />
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
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
                <div style={{ fontSize: 9, color: up ? '#44ff88' : '#ff4444', marginTop: 2 }}>
                  {up ? '▲' : '▼'} {Math.abs(s.change).toFixed(2)}
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
