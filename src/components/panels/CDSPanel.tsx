'use client';

import { Panel, PanelHeader, PanelContent, CachedBadge } from '@/components/ui/Panel';
import { CDS_SPREADS } from '@/lib/mockData';

function getStatusColor(status: string) {
  switch (status) {
    case 'SAFE': return '#44ff88';
    case 'MOD': return '#3388ff';
    case 'RISK': return '#ffaa00';
    case 'WATCH': return '#ff6600';
    case 'DIST': return '#ff4444';
    default: return 'var(--text)';
  }
}

export default function CDSPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Credit Default Swaps"
        badge={<CachedBadge label="DAILY" />}
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['ENTITY (5Y)', 'SPREAD', 'CHG', 'DISTRESS'].map(h => (
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
            {CDS_SPREADS.map((c, i) => {
              const statusColor = getStatusColor(c.status);
              return (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                  }}
                >
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontWeight: 700 }}>{c.entity}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.spread} bps</td>
                  <td style={{ padding: '6px 8px', color: c.change > 0 ? '#ffaa00' : '#44ff88', fontFamily: 'var(--font-mono)' }}>
                    {c.change > 0 ? '+' : ''}{c.change}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{
                      fontSize: 8, padding: '2px 4px', borderRadius: 2, fontWeight: 700,
                      background: `${statusColor}22`,
                      color: statusColor,
                      border: `1px solid ${statusColor}44`
                    }}>
                      {c.status}
                    </span>
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
