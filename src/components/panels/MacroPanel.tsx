'use client';

import { useEffect, useMemo, useState } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMacroStore } from '@/store/macroStore';
import { MACRO_INDICATORS as MOCK_MACRO } from '@/lib/mockData';

const DISPLAY_ORDER = [
  { series_id: 'VIXCLS',    label: 'VIX',            unit: '' },
  { series_id: 'DGS10',     label: 'US 10Y',         unit: '%' },
  { series_id: 'DGS2',      label: 'US 2Y',          unit: '%' },
  { series_id: 'FEDFUNDS',  label: 'Fed Rate',       unit: '%' },
  { series_id: 'CPIAUCSL',  label: 'CPI YoY',        unit: '%' },
  { series_id: 'UNRATE',    label: 'Unemployment',   unit: '%' },
  { series_id: 'DTWEXBGS',  label: 'DXY',            unit: '' },
  { series_id: '2S10S_SPREAD', label: '2s10s Sprd',  unit: '%' },
];

export function MacroPanel() {
  const { indicators, initializeRealtime } = useMacroStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    initializeRealtime();
    // Simulate real-time tick flow on macro derivatives (DXY, VIX, Bonds)
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, [initializeRealtime]);

  const displayRows = useMemo(() => {
    return DISPLAY_ORDER.map(cfg => {
      const ind = indicators[cfg.series_id];
      const fallback = MOCK_MACRO.find(m => m.label === cfg.label);
      
      let baseValue = ind?.value ?? fallback?.value ?? 0;
      let change = ind?.change_pct ?? fallback?.change ?? 0;

      // Only add noise to live-moving macro elements (VIX, DXY, Bonds)
      // Fed Rate, CPI, Unemployment stay static until released
      const isDynamic = ['VIX', 'US 10Y', 'US 2Y', 'DXY', '2s10s Sprd'].includes(cfg.label);
      
      if (isDynamic) {
        // Generate a tiny random walk variance
        const noise = (Math.random() - 0.5) * (baseValue * 0.002);
        baseValue += noise;
        change += (noise / baseValue) * 100;
      }

      return {
        label: cfg.label,
        value: baseValue,
        unit: cfg.unit,
        change,
      };
    });
  }, [indicators, tick]);

  return (
    <Panel>
      <PanelHeader title="Macro Indicators" badge={<LiveBadge />} />
      <PanelContent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {displayRows.map((m, i) => {
            const up = m.change >= 0;
            return (
              <div
                key={m.label + i}
                style={{
                  padding: '8px 10px', background: 'var(--overlay-subtle)',
                  border: '1px solid var(--border)', borderRadius: 2,
                  transition: 'background 0.3s ease',
                }}
              >
                <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: 0.5, marginBottom: 2 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {m.value.toFixed(m.value < 10 ? 3 : 2)}{m.unit}
                </div>
                {m.change !== 0 && (
                  <div style={{ fontSize: 9, color: up ? '#44ff88' : '#ff4444', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {up ? '▲' : '▼'} {Math.abs(m.change).toFixed(2)}
                    {m.unit === '%' ? ' bps' : '%'}
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
