'use client';

import { useState, useEffect, useRef } from 'react';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

export default function TerminalFooter() {
  const [latency, setLatency] = useState<number | null>(null);
  const [mem, setMem] = useState<number | null>(null);
  const [opsPerSec, setOpsPerSec] = useState(0);
  const [diagOpen, setDiagOpen] = useState(false);

  // Toggle raw stream capture when diagnostics window opens/closes.
  // This prevents 30x/sec Zustand re-renders when the modal is closed.
  const openDiag = () => { setDiagnosticsEnabled(true); setDiagOpen(true); };
  const closeDiag = () => { setDiagnosticsEnabled(false); setDiagOpen(false); };
  const opsCountRef = useRef(0);
  const lastTicksRef = useRef<Record<string, unknown>>({});

  const { isConnected: finnhubConnected, ticks, setDiagnosticsEnabled } = useFinnhubStore();
  const { isRealtimeConnected: supabaseConnected } = useMarketStore();

  const isConnected = finnhubConnected || supabaseConnected;

  // Count WebSocket tick messages per second as "ops"
  useEffect(() => {
    const tickKeys = Object.keys(ticks);
    const prevKeys = Object.keys(lastTicksRef.current);
    if (tickKeys.length > prevKeys.length || tickKeys.some(k => ticks[k] !== lastTicksRef.current[k])) {
      opsCountRef.current += Object.keys(ticks).length;
    }
    lastTicksRef.current = ticks as Record<string, unknown>;
  }, [ticks]);

  useEffect(() => {
    // Ops counter flush every second
    const opsInterval = setInterval(() => {
      setOpsPerSec(opsCountRef.current);
      opsCountRef.current = 0;
    }, 1000);

    // Memory usage (Chrome only — window.performance.memory)
    const memInterval = setInterval(() => {
      const perf = performance as typeof performance & { memory?: { usedJSHeapSize: number } };
      if (perf?.memory?.usedJSHeapSize) {
        setMem(Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)));
      }
    }, 3000);

    // Latency: measure round-trip to our own edge server
    const pingInterval = setInterval(async () => {
      const t0 = performance.now();
      try {
        await fetch(window.location.origin, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const t1 = performance.now();
        setLatency(Math.round(t1 - t0));
      } catch {
        // network offline or adblocker
      }
    }, 10000); // every 10s

    // Initial latency ping
    (async () => {
      const t0 = performance.now();
      try { 
        await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' }); 
        setLatency(Math.round(performance.now() - t0));
      } catch { /* ok */ }
    })();

    return () => {
      clearInterval(opsInterval);
      clearInterval(memInterval);
      clearInterval(pingInterval);
    };
  }, []);

  const formatOps = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };

  return (
    <footer
      className="flex-none flex items-center justify-between px-3"
      style={{
        height: 24,
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        zIndex: 50,
      }}
    >
      {/* Left — Connection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isConnected ? '#44ff88' : '#ff4444',
              animation: isConnected ? 'pulse-dot 2s ease-in-out infinite' : 'none',
              boxShadow: isConnected ? '0 0 4px rgba(68,255,136,0.5)' : '0 0 4px rgba(255,68,68,0.5)',
            }}
          />
          <span style={{ color: isConnected ? '#44ff88' : '#ff4444', fontWeight: 600 }}>
            {isConnected ? 'CONNECTED' : 'RECONNECTING'}
          </span>
          <span style={{ color: 'var(--text-faint)' }}>
            ({latency !== null ? `${latency}ms` : '…'})
          </span>
        </div>
        <span style={{ color: 'var(--text-ghost)' }}>WSS://API.NOBLE-TERMINAL.COM</span>
      </div>

      {/* Center — Brand */}
      <div style={{ color: 'var(--text-ghost)', letterSpacing: '0.1em', fontSize: 9 }}>
        NOBLE TERMINAL — INSTITUTIONAL INTELLIGENCE FOR ALL
      </div>

      {/* Right — Live system stats */}
      <div className="flex items-center gap-4">
        <span style={{ color: isConnected ? '#44ff88' : '#ff4444' }}>
          DATA: {isConnected ? 'REAL-TIME SECURE' : 'RECONNECTING…'}
        </span>
        {mem !== null && <span>MEM: {mem}MB</span>}
        <span>
          VOL:{' '}
          <span style={{ color: opsPerSec > 0 ? '#44ff88' : 'var(--text-muted)' }}>
            {formatOps(opsPerSec)} OPS/s
          </span>
        </span>
        <div style={{ width: 1, height: 10, background: 'var(--border)', margin: '0 2px' }} />
        <button
          onClick={openDiag}
          style={{ color: 'var(--text-faint)', cursor: 'pointer', background: 'transparent', border: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
        >
          [ DIAGNOSTICS ]
        </button>
        <a
          href="https://t.me/noblefunded"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-faint)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
        >
          TELEGRAM
        </a>
      </div>

      {/* Diagnostics Modal */}
      {diagOpen && (
        <DiagnosticsModal onClose={closeDiag} />
      )}
    </footer>
  );
}

function DiagnosticsModal({ onClose }: { onClose: () => void }) {
  const { rawStream, isConnected } = useFinnhubStore();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '90%', maxWidth: 800, height: '80%', background: '#0a0a0a',
        border: '1px solid #44ff88', borderRadius: 4, display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 30px rgba(68, 255, 136, 0.1)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '8px 12px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between',
          background: '#111', color: '#44ff88', fontFamily: 'var(--font-mono)', fontSize: 12
        }}>
          <span>SYSTEM_DIAGNOSTICS_TERMINAL // WSS://WS.FINNHUB.IO</span>
          <button onClick={onClose} style={{ color: '#ff4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>[ CLOSE ]</button>
        </div>
        
        {/* Body */}
        <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
          {rawStream.map((packet, idx) => (
            <div key={idx} style={{ 
              color: '#44ff88', opacity: 1 - (idx * 0.05), fontSize: 11, fontFamily: 'var(--font-mono)',
              lineHeight: 1.4, borderBottom: '1px solid rgba(68,255,136,0.1)', paddingBottom: 4, marginBottom: 4,
              wordBreak: 'break-all'
            }}>
              <span style={{ color: '#888', marginRight: 8 }}>[{new Date().toISOString().substring(11, 23)}]</span>
              {packet.substring(0, 300)}{packet.length > 300 ? '...' : ''}
            </div>
          ))}
          {!isConnected && (
            <div style={{ color: '#ff4444' }}>AWAITING SOCKET CONNECTION...</div>
          )}
        </div>
      </div>
    </div>
  );
}
