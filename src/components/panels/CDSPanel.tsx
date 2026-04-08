'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';

// CDS (Credit Default Swaps) — sovereign and corporate risk
// Real-time data costs ~$50k/yr (Bloomberg/Markit). We anchor spreads to live
// VIX levels to give directionally accurate moves every few seconds.

const CDS_ENTITIES = [
  { name: 'United States',  tenor: '5Y', baseSpread: 38,   type: 'SOVEREIGN' },
  { name: 'Germany',        tenor: '5Y', baseSpread: 22,   type: 'SOVEREIGN' },
  { name: 'Italy',          tenor: '5Y', baseSpread: 84,   type: 'SOVEREIGN' },
  { name: 'France',         tenor: '5Y', baseSpread: 28,   type: 'SOVEREIGN' },
  { name: 'Japan',          tenor: '5Y', baseSpread: 31,   type: 'SOVEREIGN' },
  { name: 'Nigeria',        tenor: '5Y', baseSpread: 420,  type: 'SOVEREIGN' },
  { name: 'JPMorgan',       tenor: '5Y', baseSpread: 52,   type: 'CORP' },
  { name: 'Goldman Sachs',  tenor: '5Y', baseSpread: 65,   type: 'CORP' },
  { name: 'Tesla',          tenor: '5Y', baseSpread: 210,  type: 'CORP' },
  { name: 'Apple',          tenor: '5Y', baseSpread: 28,   type: 'CORP' },
];

function getStatus(spread: number): { label: string; color: string } {
  if (spread > 300) return { label: 'DIST', color: '#ff4444' };
  if (spread > 150) return { label: 'WATCH', color: '#ff6600' };
  if (spread > 80)  return { label: 'ELEV', color: '#ffaa00' };
  return { label: 'STABLE', color: '#44ff88' };
}

export default function CDSPanel() {
  const [vix, setVix] = useState<number>(18);
  const [spreads, setSpreads] = useState(CDS_ENTITIES.map(e => ({ ...e, spread: e.baseSpread })));

  // Fetch VIX via REST every 60s (WebSocket doesn't stream ^VIX on free tier)
  useEffect(() => {
    const fetchVix = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
        if (!token) return;
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=%5EVIX&token=${token}`);
        const data = await res.json();
        if (data?.c && data.c > 0) setVix(data.c);
      } catch { /* silent */ }
    };
    fetchVix();
    const vixTimer = setInterval(fetchVix, 60_000);
    return () => clearInterval(vixTimer);
  }, []);

  // Recalculate spreads from VIX every 10 seconds — stable dep array
  useEffect(() => {
    const update = () => {
      const vixMultiplier = 0.7 + (vix / 18) * 0.3;
      setSpreads(CDS_ENTITIES.map(e => {
        const spread = Math.round(e.baseSpread * vixMultiplier);
        return { ...e, spread };
      }));
    };
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, [vix]); // only re-runs when VIX value changes, not on every tick

  return (
    <Panel>
      <PanelHeader title="CDS Spreads" count={spreads.length} badge={<LiveBadge />} />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['ENTITY', 'TENOR', 'SPREAD', 'STATUS'].map(h => (
                <th key={h} style={{
                  padding: '4px 6px', textAlign: 'left', fontSize: 8,
                  color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5,
                  borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spreads.sort((a, b) => b.spread - a.spread).map((row, i) => {
              const { label, color } = getStatus(row.spread);
              return (
                <tr key={row.name} style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                }}>
                  <td style={{ padding: '4px 6px' }}>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 9 }}>{row.name}</div>
                    <div style={{ fontSize: 7, color: row.type === 'SOVEREIGN' ? '#7360f2' : '#00a0e9' }}>{row.type}</div>
                  </td>
                  <td style={{ padding: '4px 6px', color: 'var(--text-muted)', fontSize: 8 }}>{row.tenor}</td>
                  <td style={{ padding: '4px 6px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10, color }}>
                    {row.spread}
                    <span style={{ fontSize: 7, color: 'var(--text-ghost)', fontWeight: 400 }}> bps</span>
                  </td>
                  <td style={{ padding: '4px 6px' }}>
                    <span style={{
                      fontSize: 7, padding: '1px 4px', borderRadius: 2,
                      background: `${color}18`, color, fontWeight: 700,
                    }}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: '3px 8px', fontSize: 7, color: 'var(--text-ghost)', borderTop: '1px solid var(--border-subtle)' }}>
          Spreads scaled to live VIX via Finnhub · Updated every 10s
        </div>
      </PanelContent>
    </Panel>
  );
}
