'use client';

import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { DARK_POOL_TRADES } from '@/lib/mockData';

export default function DarkPoolPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Dark Pool / Institutional Block Trades"
        badge={<LiveBadge />}
        count={DARK_POOL_TRADES.length}
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['TIME', 'SYM', 'SIZE', 'PRICE', 'NOTIONAL', 'COND'].map(h => (
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
            {DARK_POOL_TRADES.map((t, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                }}
              >
                <td style={{ padding: '6px 8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{t.time}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 700 }}>{t.symbol}</td>
                <td style={{ padding: '6px 8px', color: '#ffaa00', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{t.size}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{t.price.toFixed(2)}</td>
                <td style={{ padding: '6px 8px', color: '#44ff88', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{t.notion}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: 8, padding: '2px 4px', background: 'var(--border)', borderRadius: 2 }}>{t.condition}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PanelContent>
    </Panel>
  );
}
