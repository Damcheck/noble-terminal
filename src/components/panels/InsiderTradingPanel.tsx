'use client';

import { Panel, PanelHeader, PanelContent, CachedBadge } from '@/components/ui/Panel';
import { CAPITOL_HILL_TRADES } from '@/lib/mockData';

export default function InsiderTradingPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Capitol Hill Flow"
        badge={<CachedBadge label="DAILY" />}
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['DATE', 'POLITICIAN', 'SYM', 'ACT', 'SIZE', 'IMPACT'].map(h => (
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
            {CAPITOL_HILL_TRADES.map((t, i) => {
              const isBuy = t.type === 'BUY';
              return (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                  }}
                >
                  <td style={{ padding: '6px 8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{t.date}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)' }}>{t.politician}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 700 }}>{t.asset}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{
                      fontSize: 8, padding: '2px 4px', borderRadius: 2, fontWeight: 700,
                      background: isBuy ? 'rgba(68,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                      color: isBuy ? '#44ff88' : '#ff4444'
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{t.amount}</td>
                  <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: t.impact > 0 ? '#44ff88' : '#ff4444' }}>
                    {t.impact > 0 ? '+' : ''}{t.impact}%
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
