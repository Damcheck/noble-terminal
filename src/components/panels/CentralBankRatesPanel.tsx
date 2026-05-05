'use client';

import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMacroStore } from '@/store/macroStore';

function formatNumber(n: number | undefined | null, decimals = 2): string {
  if (n == null) return '—';
  return n.toFixed(decimals) + '%';
}

function formatChange(n: number | undefined | null): { text: string; color: string } {
  if (n == null) return { text: '—', color: 'var(--text-ghost)' };
  const diff = n;
  if (diff > 0) return { text: `+${diff.toFixed(2)} bps`, color: '#44ff88' };
  if (diff < 0) return { text: `${diff.toFixed(2)} bps`, color: '#ff4444' };
  return { text: 'UNCH', color: 'var(--text-muted)' };
}

export default function CentralBankRatesPanel() {
  const indicators = useMacroStore(s => s.indicators);

  // We have Fed Funds Rate from FRED (FEDFUNDS)
  const fedRate = indicators['FEDFUNDS'];
  
  // We can mock the others for now until API is connected, but show them as available
  // In a real scenario, these would come from the macroStore as well if fetched from an API
  const rates = [
    { 
      bank: 'Federal Reserve (FED)', 
      country: '🇺🇸 US',
      rate: fedRate?.value, 
      prev: fedRate?.previous_value, 
      change: fedRate ? (fedRate.value - fedRate.previous_value) * 100 : 0, // in bps
      date: fedRate?.updated_at
    },
    { 
      bank: 'European Central Bank (ECB)', 
      country: '🇪🇺 EU',
      rate: 4.50, 
      prev: 4.50, 
      change: 0,
      date: new Date().toISOString()
    },
    { 
      bank: 'Bank of England (BOE)', 
      country: '🇬🇧 UK',
      rate: 5.25, 
      prev: 5.25, 
      change: 0,
      date: new Date().toISOString()
    },
    { 
      bank: 'Central Bank of Nigeria (CBN)', 
      country: '🇳🇬 NG',
      rate: 26.25, 
      prev: 24.75, 
      change: 150,
      date: new Date().toISOString()
    }
  ];

  return (
    <Panel>
      <PanelHeader title="Central Bank Rates" badge={<LiveBadge />} />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['BANK', 'CURRENT', 'CHANGE'].map(h => (
                <th key={h} style={{
                  padding: '4px 8px', textAlign: 'left', fontSize: 7,
                  color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5,
                  borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rates.map((r, i) => {
              const changeStr = formatChange(r.change);
              return (
                <tr key={r.bank} style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                }}>
                  <td style={{ padding: '6px 8px' }}>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 9 }}>{r.country}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 7 }}>{r.bank}</div>
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                    {formatNumber(r.rate)}
                  </td>
                  <td style={{ padding: '6px 8px', fontSize: 8, fontFamily: 'var(--font-mono)', color: changeStr.color }}>
                    {changeStr.text}
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
