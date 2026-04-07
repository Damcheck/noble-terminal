'use client';

import { Panel, PanelHeader, PanelContent, CachedBadge } from '@/components/ui/Panel';
import { SPLC_DATA } from '@/lib/mockData';

export default function SupplyChainPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Supply Chain (SPLC)"
        badge={<CachedBadge label="WEEKLY" />}
      />
      <PanelContent>
        {/* Core Focal Company */}
        <div className="flex flex-col items-center justify-center mb-6 mt-4">
          <div
            style={{
              padding: '10px 24px',
              border: '2px solid var(--border-strong)',
              borderRadius: 4,
              background: 'var(--overlay-subtle)',
              textAlign: 'center',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
              {SPLC_DATA.focal}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Revenue: {SPLC_DATA.revenue}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 12 }}>
          {/* Suppliers */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: 0.5, marginBottom: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 4 }}>
              DEPENDENT CAPEX (UPSTREAM)
            </div>
            <div className="flex flex-col gap-2">
              {SPLC_DATA.suppliers.map(s => (
                <div
                  key={s.name}
                  style={{
                    padding: '6px 8px',
                    background: 'var(--overlay-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{s.name}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', background: 'var(--bg)', padding: '1px 4px', borderRadius: 2 }}>{s.relation}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <div>
                      <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>REV DEPENDENCY</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#ffaa00', fontFamily: 'var(--font-mono)' }}>{s.dependency}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>IMPACT</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: s.impact > 0 ? '#44ff88' : '#ff4444', fontFamily: 'var(--font-mono)' }}>{s.impact}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--border)' }} />

          {/* Customers */}
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: 0.5, marginBottom: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 4 }}>
              REVENUE DRIVERS (DOWNSTREAM)
            </div>
            <div className="flex flex-col gap-2">
              {SPLC_DATA.customers.map(c => (
                <div
                  key={c.name}
                  style={{
                    padding: '6px 8px',
                    background: 'var(--overlay-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{c.name}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', background: 'var(--bg)', padding: '1px 4px', borderRadius: 2 }}>{c.relation}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <div>
                      <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>REV DEPENDENCY</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#3388ff', fontFamily: 'var(--font-mono)' }}>{c.dependency}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>IMPACT</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: c.impact > 0 ? '#44ff88' : '#ff4444', fontFamily: 'var(--font-mono)' }}>+{c.impact}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
