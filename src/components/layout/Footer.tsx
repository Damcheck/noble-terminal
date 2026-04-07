'use client';

import { useState, useEffect } from 'react';

export default function TerminalFooter() {
  const [latency] = useState(14);
  const [mem] = useState(47);
  const [ops] = useState('1.2M');

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
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#44ff88',
              animation: 'pulse-dot 2s ease-in-out infinite',
              boxShadow: '0 0 4px rgba(68,255,136,0.5)',
            }}
          />
          <span style={{ color: '#44ff88', fontWeight: 600 }}>CONNECTED</span>
          <span style={{ color: 'var(--text-faint)' }}>({latency}ms)</span>
        </div>
        <span style={{ color: 'var(--text-ghost)' }}>WSS://API.NOBLE-TERMINAL.COM</span>
      </div>

      {/* Center — Brand */}
      <div style={{ color: 'var(--text-ghost)', letterSpacing: '0.1em', fontSize: 9 }}>
        NOBLE TERMINAL — INSTITUTIONAL INTELLIGENCE FOR ALL
      </div>

      {/* Right — System stats */}
      <div className="flex items-center gap-4">
        <span>DATA: REAL-TIME SECURE</span>
        <span>MEM: {mem}MB</span>
        <span>VOL: {ops} OPS</span>
        <div
          style={{
            width: 1,
            height: 10,
            background: 'var(--border)',
            margin: '0 2px',
          }}
        />
        <a
          href="#"
          style={{ color: 'var(--text-faint)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
        >
          DOCS
        </a>
        <a
          href="#"
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
