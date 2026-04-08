'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';

interface Session {
  name: string;
  openUTC: number; // 0-24
  closeUTC: number; // 0-24
}

const SESSIONS: Session[] = [
  { name: 'Sydney', openUTC: 22, closeUTC: 7 },
  { name: 'Tokyo', openUTC: 0, closeUTC: 9 },
  { name: 'London', openUTC: 8, closeUTC: 16 },
  { name: 'New York', openUTC: 13, closeUTC: 22 },
];

function formatLocalTime(utcHour: number): string {
  const d = new Date();
  d.setUTCHours(Math.floor(utcHour), (utcHour % 1) * 60, 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getCountdown(now: Date, targetUTC: number, isNextDay: boolean): string {
  const target = new Date(now);
  target.setUTCHours(Math.floor(targetUTC), (targetUTC % 1) * 60, 0, 0);
  
  if (isNextDay) {
    target.setUTCDate(target.getUTCDate() + 1);
  } else if (target.getTime() < now.getTime()) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function MarketSessionsPanel() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initial mount sync
    setTime(new Date());
    // 1-second ultra-precise ticker
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) {
    return (
      <Panel>
        <PanelHeader title="Global Market Sessions" badge={<LiveBadge />} />
        <PanelContent>
          <div style={{ color: 'var(--text-ghost)', fontSize: 10, padding: 10 }}>Initializing clock...</div>
        </PanelContent>
      </Panel>
    );
  }

  const currentUTC = time.getUTCHours() + time.getUTCMinutes() / 60 + time.getUTCSeconds() / 3600;

  return (
    <Panel>
      <PanelHeader title="Global Market Sessions" badge={<LiveBadge />} />
      <PanelContent>
        {/* The 24-hour visualization bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: 'var(--text-ghost)', marginBottom: 2 }}>
            <span>00:00 UTC</span>
            <span>Current: {time.toISOString().substring(11, 19)} UTC</span>
            <span>23:59 UTC</span>
          </div>
          <div style={{
            height: 6, width: '100%', background: 'var(--overlay-subtle)', borderRadius: 3, position: 'relative'
          }}>
            {/* Session blocks */}
            <div style={{ position: 'absolute', left: '33.3%', width: '33.3%', height: '100%', background: 'rgba(68,255,136,0.1)' }} /> {/* London: 8 to 16 */}
            <div style={{ position: 'absolute', left: '54.1%', width: '37.5%', height: '100%', background: 'rgba(0,160,233,0.1)' }} /> {/* NY: 13 to 22 */}
            {/* Real-time playhead */}
            <div style={{
              position: 'absolute',
              left: `${(currentUTC / 24) * 100}%`,
              top: -2, bottom: -2, width: 2,
              background: '#ff4444',
              boxShadow: '0 0 4px #ff4444',
              zIndex: 10
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SESSIONS.map(session => {
            // Determine if active
            let isOpen = false;
            if (session.openUTC < session.closeUTC) {
              isOpen = currentUTC >= session.openUTC && currentUTC < session.closeUTC;
            } else {
              // Crosses midnight (e.g. Sydney 22 to 7)
              isOpen = currentUTC >= session.openUTC || currentUTC < session.closeUTC;
            }

            const stateColor = isOpen ? '#44ff88' : 'var(--text-ghost)';
            
            // Calculate countdowns
            const countdown = isOpen 
              ? getCountdown(time, session.closeUTC, session.openUTC > session.closeUTC && currentUTC >= session.openUTC) 
              : getCountdown(time, session.openUTC, false);

            return (
              <div key={session.name} style={{
                background: 'var(--overlay-subtle)',
                border: `1px solid ${isOpen ? 'rgba(68,255,136,0.2)' : 'var(--border-subtle)'}`,
                borderRadius: 4,
                padding: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isOpen ? 'var(--text)' : 'var(--text-muted)' }}>
                    {session.name}
                  </span>
                  <span style={{
                    fontSize: 7, fontWeight: 700,
                    background: isOpen ? 'rgba(68,255,136,0.1)' : 'var(--overlay-light)',
                    color: stateColor,
                    padding: '2px 4px', borderRadius: 2
                  }}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                  <div style={{ color: 'var(--text-ghost)' }}>Local Market Hours</div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {formatLocalTime(session.openUTC)} - {formatLocalTime(session.closeUTC)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, marginTop: 4 }}>
                  <div style={{ color: 'var(--text-ghost)' }}>
                    {isOpen ? 'Closes in' : 'Opens in'}
                  </div>
                  <div style={{
                    color: isOpen ? '#44ff88' : 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}>
                    {countdown}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{ fontSize: 7, color: 'var(--text-ghost)', textAlign: 'center', marginTop: 8 }}>
          Hours automatically projected to your system's timezone
        </div>
      </PanelContent>
    </Panel>
  );
}
