'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';

interface EarningsEntry {
  symbol: string;
  date: string;
  hour: 'bmo' | 'amc' | 'dmh' | ''; // before/after market open, during market hours
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
  quarter: number;
  year: number;
}

type Filter = 'ALL' | 'TODAY' | 'BEAT' | 'MISS';

// Top 40 stocks traders care about most
const FOCUS_SYMBOLS = new Set([
  'AAPL','MSFT','NVDA','TSLA','META','GOOGL','AMZN','JPM','V','MA',
  'NFLX','AMD','INTC','BABA','BAC','WMT','DIS','PYPL','UBER','COIN',
  'SNAP','TWTR','CRM','ORCL','IBM','GS','MS','C','WFC','PFE',
  'JNJ','XOM','CVX','BA','GE','F','GM','PLTR','CRWD','SHOP'
]);

function fmt(n: number | null): string {
  if (n == null) return '—';
  return n > 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
}

function fmtRev(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

function getStatus(entry: EarningsEntry): 'BEAT' | 'MISS' | 'INLINE' | 'PENDING' {
  if (entry.epsActual == null || entry.epsEstimate == null) return 'PENDING';
  const diff = entry.epsActual - entry.epsEstimate;
  if (diff > 0.01) return 'BEAT';
  if (diff < -0.01) return 'MISS';
  return 'INLINE';
}

function getHourLabel(hour: string): string {
  if (hour === 'bmo') return 'PRE';
  if (hour === 'amc') return 'POST';
  if (hour === 'dmh') return 'MKT';
  return '—';
}

function getDateLabel(dateStr: string): string {
  const today = new Date();
  const d = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone shifts
  const diff = Math.round((d.getTime() - today.setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 0) return 'TODAY';
  if (diff === 1) return 'TMR';
  if (diff === -1) return 'YEST';
  if (diff > 1 && diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

const STATUS_COLORS: Record<string, string> = {
  BEAT: '#44ff88',
  MISS: '#ff4444',
  INLINE: '#ffaa00',
  PENDING: '#888',
};

export default function EarningsCalendarPanel() {
  const [earnings, setEarnings] = useState<EarningsEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEarnings = async () => {
    const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
    if (!token) return;

    try {
      // Fetch this week + next week
      const today = new Date();
      const from = today.toISOString().split('T')[0];
      const to = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0];

      const res = await fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${token}`,
        { cache: 'no-store' }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data?.earningsCalendar) return;

      // Filter to focus symbols for signal/noise ratio
      const filtered: EarningsEntry[] = data.earningsCalendar
        .filter((e: any) => FOCUS_SYMBOLS.has(e.symbol))
        .map((e: any) => ({
          symbol: e.symbol,
          date: e.date,
          hour: e.hour || '',
          epsEstimate: e.epsEstimate ?? null,
          epsActual: e.epsActual ?? null,
          revenueEstimate: e.revenueEstimate ?? null,
          revenueActual: e.revenueActual ?? null,
          quarter: e.quarter,
          year: e.year,
        }))
        .sort((a: EarningsEntry, b: EarningsEntry) => a.date.localeCompare(b.date));

      setEarnings(filtered);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('[EarningsCalendar] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
    const interval = setInterval(fetchEarnings, 1 * 60 * 1000); // refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const displayed = earnings.filter(e => {
    if (filter === 'TODAY') return e.date === todayStr;
    if (filter === 'BEAT') return getStatus(e) === 'BEAT';
    if (filter === 'MISS') return getStatus(e) === 'MISS';
    return true;
  });

  const todayCount = earnings.filter(e => e.date === todayStr).length;
  const beatCount = earnings.filter(e => getStatus(e) === 'BEAT').length;
  const missCount = earnings.filter(e => getStatus(e) === 'MISS').length;

  const filters: { key: Filter; label: string; count: number; color?: string }[] = [
    { key: 'ALL', label: 'ALL', count: earnings.length },
    { key: 'TODAY', label: 'TODAY', count: todayCount, color: '#ffaa00' },
    { key: 'BEAT', label: 'BEAT', count: beatCount, color: '#44ff88' },
    { key: 'MISS', label: 'MISS', count: missCount, color: '#ff4444' },
  ];

  return (
    <Panel>
      <PanelHeader
        title="Earnings Calendar"
        count={displayed.length}
        badge={<LiveBadge />}
      />

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 4, padding: '4px 8px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontSize: 8, padding: '2px 7px', borderRadius: 2,
              border: `1px solid ${filter === f.key ? (f.color || 'var(--accent)') : 'var(--border-subtle)'}`,
              background: filter === f.key ? `${f.color || 'var(--accent)'}18` : 'transparent',
              color: filter === f.key ? (f.color || 'var(--accent)') : 'var(--text-ghost)',
              cursor: 'pointer', letterSpacing: 0.5, fontFamily: 'var(--font-mono)',
              fontWeight: filter === f.key ? 700 : 400,
              transition: 'all 0.1s',
            }}
          >
            {f.label} {f.count > 0 && <span style={{ opacity: 0.7 }}>({f.count})</span>}
          </button>
        ))}

        {lastUpdated && (
          <span style={{
            marginLeft: 'auto', fontSize: 7, color: 'var(--text-ghost)',
            fontFamily: 'var(--font-mono)', alignSelf: 'center',
          }}>
            UPD {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <PanelContent noPad>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
            <span style={{ fontSize: 9, color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>
              LOADING EARNINGS DATA...
            </span>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
            <span style={{ fontSize: 9, color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>
              NO EARNINGS THIS PERIOD
            </span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: 'var(--overlay-subtle)', position: 'sticky', top: 0, zIndex: 1 }}>
                {['DATE', 'SYM', 'QTR', 'TIME', 'EPS EST', 'EPS ACT', 'REV EST', 'REV ACT', 'STATUS'].map(h => (
                  <th key={h} style={{
                    padding: '4px 5px', textAlign: 'left', fontSize: 7,
                    color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5,
                    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((e, i) => {
                const status = getStatus(e);
                const statusColor = STATUS_COLORS[status];
                const isToday = e.date === todayStr;
                return (
                  <tr key={`${e.symbol}-${e.date}`} style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isToday
                      ? 'rgba(255,170,0,0.04)'
                      : i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                  }}>
                    <td style={{ padding: '4px 5px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 2,
                        background: isToday ? 'rgba(255,170,0,0.15)' : 'transparent',
                        color: isToday ? '#ffaa00' : 'var(--text-ghost)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {getDateLabel(e.date)}
                      </span>
                    </td>
                    <td style={{ padding: '4px 5px', fontWeight: 700, color: 'var(--accent)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                      {e.symbol}
                    </td>
                    <td style={{ padding: '4px 5px', color: 'var(--text-ghost)', fontSize: 7 }}>
                      Q{e.quarter} '{String(e.year).slice(2)}
                    </td>
                    <td style={{ padding: '4px 5px' }}>
                      <span style={{
                        fontSize: 7, padding: '1px 3px', borderRadius: 2,
                        background: 'var(--overlay-subtle)',
                        color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                      }}>
                        {getHourLabel(e.hour)}
                      </span>
                    </td>
                    <td style={{ padding: '4px 5px', color: 'var(--text-muted)', fontSize: 8, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {fmt(e.epsEstimate)}
                    </td>
                    <td style={{ padding: '4px 5px', fontWeight: 700, fontSize: 8, fontFamily: 'var(--font-mono)', textAlign: 'right', color: statusColor }}>
                      {fmt(e.epsActual)}
                    </td>
                    <td style={{ padding: '4px 5px', color: 'var(--text-muted)', fontSize: 8, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {fmtRev(e.revenueEstimate)}
                    </td>
                    <td style={{ padding: '4px 5px', color: 'var(--text-muted)', fontSize: 8, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {fmtRev(e.revenueActual)}
                    </td>
                    <td style={{ padding: '4px 5px' }}>
                      <span style={{
                        fontSize: 7, padding: '1px 5px', borderRadius: 2, fontWeight: 700,
                        background: `${statusColor}18`,
                        color: statusColor,
                        letterSpacing: 0.3,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div style={{
          padding: '3px 8px', fontSize: 7, color: 'var(--text-ghost)',
          borderTop: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
        }}>
          Earnings data via Finnhub · Next 7 days · Top 40 symbols · Refreshes every 1min
        </div>
      </PanelContent>
    </Panel>
  );
}
