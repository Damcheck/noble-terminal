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
        <div style={{ padding: '8px 12px', height: '100%' }}>
        {/* The 24-hour visualization bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontWeight: 600, color: 'var(--text-ghost)', marginBottom: 4 }}>
            <span>00:00</span>
            <span style={{ color: 'var(--text)', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' }}>{time.toISOString().substring(11, 19)} UTC</span>
            <span>23:59</span>
          </div>
          <div style={{
            height: 4, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 2, position: 'relative'
          }}>
            {/* Session blocks */}
            <div style={{ position: 'absolute', left: '33.3%', width: '33.3%', height: '100%', background: 'rgba(68,255,136,0.3)', boxShadow: '0 0 6px rgba(68,255,136,0.2)' }} />
            <div style={{ position: 'absolute', left: '54.1%', width: '37.5%', height: '100%', background: 'rgba(0,160,233,0.3)', boxShadow: '0 0 6px rgba(0,160,233,0.2)' }} />
            {/* Real-time playhead */}
            <div style={{
              position: 'absolute',
              left: `${(currentUTC / 24) * 100}%`,
              top: -3, bottom: -3, width: 2,
              background: '#fff',
              boxShadow: '0 0 8px #fff',
              zIndex: 10
            }} />
          </div>
        </div>

        {/* Stacked Glassmorphic Gantt Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SESSIONS.map(session => {
            let isOpen = false;
            if (session.openUTC < session.closeUTC) {
              isOpen = currentUTC >= session.openUTC && currentUTC < session.closeUTC;
            } else {
              isOpen = currentUTC >= session.openUTC || currentUTC < session.closeUTC;
            }

            const stateColor = isOpen ? '#44ff88' : 'var(--text-ghost)';
            const countdown = isOpen 
              ? getCountdown(time, session.closeUTC, session.openUTC > session.closeUTC && currentUTC >= session.openUTC) 
              : getCountdown(time, session.openUTC, false);

            return (
              <div key={session.name} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isOpen ? 'rgba(68,255,136,0.15)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: isOpen ? '0 4px 12px rgba(68,255,136,0.05)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {/* Active Dot */}
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: stateColor,
                  boxShadow: isOpen ? `0 0 8px ${stateColor}` : 'none',
                  marginRight: 12,
                  opacity: isOpen ? 1 : 0.3
                }} />
                
                {/* Info Block */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: isOpen ? 'var(--text)' : 'var(--text-muted)' }}>
                      {session.name}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>
                      ({formatLocalTime(session.openUTC)} - {formatLocalTime(session.closeUTC)} Local)
                    </span>
                  </div>
                </div>

                {/* Inline Glass Timer */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ fontSize: 7, textTransform: 'uppercase', color: 'var(--text-ghost)', letterSpacing: 0.5 }}>
                    {isOpen ? 'Closes in' : 'Opens in'}
                  </span>
                  <span style={{
                    fontSize: 11, 
                    fontFamily: 'var(--font-mono)', 
                    fontWeight: 700, 
                    color: isOpen ? '#44ff88' : 'var(--text-muted)'
                  }}>
                    {countdown}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </PanelContent>
    </Panel>
  );
}
