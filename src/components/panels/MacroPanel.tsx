'use client';

import { useEffect, useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, CachedBadge } from '@/components/ui/Panel';
import { useMacroStore } from '@/store/macroStore';
import { MACRO_INDICATORS as MOCK_MACRO } from '@/lib/mockData';

// Map FRED series_ids to display config
const DISPLAY_ORDER = [
  { series_id: 'VIXCLS',    label: 'VIX',            unit: '' },
  { series_id: 'DGS10',     label: 'US 10Y',         unit: '%' },
  { series_id: 'DGS2',      label: 'US 2Y',          unit: '%' },
  { series_id: 'FEDFUNDS',  label: 'Fed Rate',       unit: '%' },
  { series_id: 'CPIAUCSL',  label: 'CPI YoY',        unit: '%' },
  { series_id: 'UNRATE',    label: 'Unemployment',   unit: '%' },
  { series_id: 'DTWEXBGS',  label: 'DXY',            unit: '' },
  { series_id: '2S10S_SPREAD', label: '2s10s Sprd',  unit: '%' },
  // Real-time RT supplements from Yahoo
  { series_id: 'DGS10_RT',  label: '10Y (RT)',       unit: '%' },
  { series_id: 'DGS5_RT',   label: '5Y (RT)',        unit: '%' },
  { series_id: 'DGS30_RT',  label: '30Y (RT)',       unit: '%' },
  { series_id: 'DGS3MO_RT', label: '3M (RT)',        unit: '%' },
];

export function MacroPanel() {
  const { indicators, isRealtimeConnected, initializeRealtime } = useMacroStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  const hasLiveData = Object.keys(indicators).length > 0;

  // Build the display rows
  const displayRows = useMemo(() => {
    if (!hasLiveData) {
      return MOCK_MACRO.map(m => ({
        label: m.label,
        value: m.value,
        unit: m.unit,
        change: m.change,
      }));
    }

    return DISPLAY_ORDER
      .filter(cfg => indicators[cfg.series_id] !== undefined)
      .map(cfg => {
        const ind = indicators[cfg.series_id];
        return {
          label: cfg.label,
          value: ind.value,
          unit: cfg.unit,
          change: ind.change_pct,
        };
      });
  }, [indicators, hasLiveData]);

  return (
    <Panel>
      <PanelHeader
        title="Macro Indicators"
        badge={isRealtimeConnected ? <LiveBadge /> : <CachedBadge label="6h" />}
      />
      <PanelContent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {displayRows.map((m, i) => {
            const up = m.change >= 0;
            return (
              <div
                key={m.label + i}
                style={{
                  padding: '8px 10px',
                  background: 'var(--overlay-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                }}
              >
                <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: 0.5, marginBottom: 2 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {typeof m.value === 'number'
                    ? m.value.toFixed(m.value < 10 ? 2 : 1)
                    : m.value}{m.unit}
                </div>
                {m.change !== 0 && (
                  <div style={{ fontSize: 9, color: up ? '#44ff88' : '#ff4444', marginTop: 2 }}>
                    {up ? '▲' : '▼'} {Math.abs(m.change).toFixed(2)}
                    {m.unit === '%' ? 'bps' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PanelContent>
    </Panel>
  );
}
