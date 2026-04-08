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
  const [vixLive, setVixLive] = useState<number | null>(null);

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  // Fetch live VIX via REST to replace the macro store VIX with real data
  useEffect(() => {
    const fetchVix = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
        if (!token) return;
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=%5EVIX&token=${token}`);
        const data = await res.json();
        if (data?.c && data.c > 0) setVixLive(data.c);
      } catch { /* silent */ }
    };
    fetchVix();
    const id = setInterval(fetchVix, 60_000);
    return () => clearInterval(id);
  }, []);

  const displayRows = useMemo(() => {
    return DISPLAY_ORDER.map(cfg => {
      const ind = indicators[cfg.series_id];
      const fallback = MOCK_MACRO.find(m => m.label === cfg.label);
      
      // Use real VIX REST value if available, otherwise use Supabase/fallback
      let baseValue = cfg.label === 'VIX' && vixLive
        ? vixLive
        : parseFloat((ind?.value ?? fallback?.value ?? 0).toString());
      
      const change = parseFloat((ind?.change_pct ?? fallback?.change ?? 0).toString());

      return {
        label: cfg.label,
        value: baseValue,
        unit: cfg.unit,
        change,
      };
    });
  }, [indicators, vixLive]);

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
                  {typeof m.value === 'number' ? m.value.toFixed(m.value < 10 ? 3 : 2) : m.value}{m.unit}
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
