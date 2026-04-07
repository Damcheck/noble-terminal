'use client';

import { useEffect } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, CachedBadge, ImpactBars } from '@/components/ui/Panel';
import { useEconCalStore } from '@/store/econCalStore';
import { ECONOMIC_CALENDAR } from '@/lib/mockData';

const countryFlag: Record<string, string> = {
  US: '🇺🇸', EU: '🇪🇺', GB: '🇬🇧', JP: '🇯🇵', AU: '🇦🇺', NG: '🇳🇬',
  CA: '🇨🇦', CH: '🇨🇭', CN: '🇨🇳', DE: '🇩🇪', FR: '🇫🇷',
  // legacy currency codes  
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺', NGN: '🇳🇬',
};

function formatEventTime(isoString: string | null): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function EconCalendarPanel() {
  const { events, isRealtimeConnected, initializeRealtime } = useEconCalStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  // Use live data if available, else fall back to mock
  const displayEvents = events.length > 0
    ? events
    : ECONOMIC_CALENDAR.map(e => ({
        event_name: e.event,
        country: e.country,
        impact: e.impact as 'HIGH' | 'MEDIUM' | 'LOW',
        event_time: null,
        previous: e.previous,
        forecast: e.forecast,
        actual: e.actual,
        updated_at: new Date().toISOString(),
      }));

  return (
    <Panel>
      <PanelHeader
        title="Economic Calendar"
        count={displayEvents.length}
        badge={isRealtimeConnected ? <LiveBadge /> : <CachedBadge label="1h" />}
      />
      <PanelContent noPad>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['TIME', 'EVENT', 'IMP', 'PREV', 'FCST', 'ACT'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '5px 6px',
                    textAlign: 'left',
                    fontSize: 9,
                    color: 'var(--text-ghost)',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayEvents.map((ev, i) => {
              const isReleased = !!ev.actual;
              const hasSurprise =
                ev.actual != null && ev.forecast != null && ev.actual !== ev.forecast;

              return (
                <tr
                  key={ev.event_name + i}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: hasSurprise
                      ? 'rgba(255,170,0,0.04)'
                      : i % 2 === 0
                      ? 'transparent'
                      : 'var(--overlay-subtle)',
                    opacity: isReleased ? 0.7 : 1,
                  }}
                >
                  <td style={{ padding: '6px 6px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: 10 }}>
                      {formatEventTime(ev.event_time)}
                    </span>
                  </td>
                  <td style={{ padding: '6px 6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{countryFlag[ev.country] || '🌐'}</span>
                      <span style={{ color: 'var(--text)', fontSize: 10 }}>{ev.event_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '6px 6px' }}>
                    <ImpactBars impact={ev.impact} />
                  </td>
                  <td style={{ padding: '6px 6px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    {ev.previous || '—'}
                  </td>
                  <td style={{ padding: '6px 6px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    {ev.forecast || '—'}
                  </td>
                  <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {ev.actual ? (
                      <span style={{ fontWeight: 700, color: hasSurprise ? '#ffaa00' : '#44ff88' }}>
                        {ev.actual}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-ghost)' }}>—</span>
                    )}
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
