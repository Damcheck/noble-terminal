'use client';

import { useState, useEffect, useRef } from 'react';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

export default function TerminalFooter() {
  const [latency, setLatency] = useState<number | null>(null);
  const [mem, setMem] = useState<number | null>(null);
  const [opsPerSec, setOpsPerSec] = useState(0);
  const opsCountRef = useRef(0);
  const lastTicksRef = useRef<Record<string, unknown>>({});

  const { isConnected: finnhubConnected, ticks } = useFinnhubStore();
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

    // Latency: measure round-trip to Finnhub via small fetch
    const pingInterval = setInterval(async () => {
      const t0 = performance.now();
      try {
        await fetch('https://finnhub.io/api/v1/quote?symbol=AAPL&token=' + process.env.NEXT_PUBLIC_FINNHUB_TOKEN, {
          method: 'HEAD',
          cache: 'no-store',
        });
      } catch {
        // fallback: measure a local API call
      }
      const t1 = performance.now();
      setLatency(Math.round(t1 - t0));
    }, 10000); // every 10s

    // Initial latency ping
    (async () => {
      const t0 = performance.now();
      try { await fetch('/api/health', { cache: 'no-store' }); } catch { /* ok */ }
      setLatency(Math.round(performance.now() - t0));
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
        <a
          href="https://discord.gg/noblefunded"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-faint)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
        >
          DISCORD
        </a>
      </div>
    </footer>
  );
}
