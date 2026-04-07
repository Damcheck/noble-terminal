'use client';

import React, { useRef, useEffect, useState } from 'react';

// ── Ticking Price — flashes green/red on every live update ──────
interface TickingPriceProps {
  price: number;
  flash?: 'up' | 'down' | null;
  decimals?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function TickingPrice({ price, flash, decimals, style, className }: TickingPriceProps) {
  const [currentFlash, setCurrentFlash] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef<number>(price);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (price !== prevPrice.current) {
      const dir = price > prevPrice.current ? 'up' : 'down';
      setCurrentFlash(dir);
      prevPrice.current = price;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCurrentFlash(null), 600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [price]);

  const auto = decimals ?? (price >= 1000 ? 2 : price >= 1 ? 4 : 6);
  const priceStr = price.toLocaleString('en-US', {
    minimumFractionDigits: auto,
    maximumFractionDigits: auto,
  });

  const flashColor = currentFlash === 'up'
    ? 'rgba(68,255,136,0.25)'
    : currentFlash === 'down'
    ? 'rgba(255,68,68,0.25)'
    : 'transparent';

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        transition: 'background 0.1s ease',
        background: flashColor,
        borderRadius: 2,
        padding: '0 2px',
        ...style,
      }}
    >
      {priceStr}
    </span>
  );
}

// ── WS Badge — shows when Finnhub WebSocket is active ──────────
export function WSBadge() {
  return (
    <span
      className="flex items-center gap-1"
      style={{
        fontSize: 9,
        padding: '2px 6px',
        borderRadius: 10,
        color: '#3af',
        border: '1px solid rgba(51,170,255,0.45)',
        background: 'rgba(51,170,255,0.12)',
      }}
    >
      <span
        style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#3af', display: 'inline-block',
          animation: 'pulse-dot 1s ease-in-out infinite',
        }}
      />
      WS
    </span>
  );
}



// ── Panel Container ─────────────────────────────────────────
interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden h-full ${className}`}
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </div>
  );
}

// ── Panel Header ────────────────────────────────────────────
interface PanelHeaderProps {
  title: string;
  count?: string | number;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PanelHeader({ title, count, badge, actions }: PanelHeaderProps) {
  return (
    <div
      className="flex items-center justify-between gap-2 flex-shrink-0"
      style={{
        padding: '6px 10px',
        background: 'var(--overlay-subtle)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        {count !== undefined && (
          <span
            style={{
              fontSize: 10,
              color: 'var(--text-dim)',
              background: 'var(--border)',
              padding: '2px 6px',
              borderRadius: 2,
            }}
          >
            {count}
          </span>
        )}
        {badge}
      </div>
      {actions && <div className="flex items-center gap-1.5 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ── Panel Content ────────────────────────────────────────────
interface PanelContentProps {
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}

export function PanelContent({ children, className = '', noPad = false }: PanelContentProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto min-w-0 ${className}`}
      style={{ padding: noPad ? 0 : 8 }}
    >
      {children}
    </div>
  );
}

// ── Live Badge ────────────────────────────────────────────────
export function LiveBadge() {
  return (
    <span
      className="flex items-center gap-1"
      style={{
        fontSize: 9,
        padding: '2px 6px',
        borderRadius: 10,
        color: '#44ff88',
        border: '1px solid rgba(86,217,130,0.45)',
        background: 'rgba(86,217,130,0.12)',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#44ff88',
          display: 'inline-block',
          animation: 'pulse-dot 1.5s ease-in-out infinite',
        }}
      />
      LIVE
    </span>
  );
}

// ── Cached Badge ───────────────────────────────────────────────
export function CachedBadge({ label = 'CACHED' }: { label?: string }) {
  return (
    <span
      style={{
        fontSize: 9,
        padding: '2px 6px',
        borderRadius: 10,
        color: '#ffaa00',
        border: '1px solid rgba(255,170,0,0.45)',
        background: 'rgba(255,170,0,0.12)',
      }}
    >
      {label}
    </span>
  );
}

// ── Phase Badge ───────────────────────────────────────────────
interface PhaseBadgeProps {
  phase: 'ALERT' | 'DEVELOPING' | 'SUSTAINED';
}

const phaseStyles: Record<string, React.CSSProperties> = {
  ALERT: {
    background: '#f97316',
    color: 'var(--bg)',
    animation: 'pulse-alert 1.5s infinite',
  },
  DEVELOPING: {
    background: '#ffaa00',
    color: 'var(--bg)',
  },
  SUSTAINED: {
    background: '#64748b',
    color: 'var(--bg)',
  },
};

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <span
      style={{
        fontSize: 8,
        fontWeight: 700,
        padding: '1px 5px',
        borderRadius: 2,
        letterSpacing: 0.5,
        flexShrink: 0,
        ...phaseStyles[phase],
      }}
    >
      {phase}
    </span>
  );
}

// ── Sparkline ──────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  up?: boolean;
  width?: number;
  height?: number;
}

export function Sparkline({ data, up, width = 60, height = 20 }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 2) + 1;
    const y = height - 1 - ((v - min) / range) * (height - 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const isUp = up !== undefined ? up : data[data.length - 1] >= data[0];
  const color = isUp ? '#44ff88' : '#ff4444';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Impact Bars ────────────────────────────────────────────────
interface ImpactBarsProps {
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function ImpactBars({ impact }: ImpactBarsProps) {
  const colors = {
    HIGH: ['#ff4444', '#ff4444', '#ff4444'],
    MEDIUM: ['#ffaa00', '#ffaa00', 'var(--border-strong)'],
    LOW: ['#3388ff', 'var(--border-strong)', 'var(--border-strong)'],
  };
  const bars = colors[impact];
  return (
    <div className="flex gap-0.5 items-end">
      {bars.map((color, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: 4 + i * 2,
            background: color,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

// ── Value Display (up/down colored) ────────────────────────────
interface ValProps {
  value: number | string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function Val({ value, decimals = 2, prefix = '', suffix = '' }: ValProps) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const up = num >= 0;
  return (
    <span style={{ color: up ? '#44ff88' : '#ff4444' }}>
      {up ? '+' : ''}{prefix}{typeof value === 'string' ? value : num.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── SVG Arc Gauge ──────────────────────────────────────────────
interface GaugeProps {
  value: number; // 0–100
  label: string;
  size?: number;
}

function getGaugeColor(v: number) {
  if (v < 33) return '#44ff88';
  if (v < 66) return '#ffaa00';
  return '#ff4444';
}

export function ArcGauge({ value, label, size = 100 }: GaugeProps) {
  const color = getGaugeColor(value);
  const arcLen = 157;
  const fill = (value / 100) * arcLen;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 120 70"
        style={{ width: size, height: size * 0.6 }}
      >
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${arcLen}`}
        />
        <text
          x="60" y="54"
          textAnchor="middle"
          fill={color}
          fontSize="18"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {value}
        </text>
      </svg>
      <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

// ── Tab Bar ────────────────────────────────────────────────────
interface TabBarProps {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}

export function TabBar({ tabs, active, onSelect }: TabBarProps) {
  return (
    <div
      className="flex gap-0 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '5px 10px',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            background: active === tab ? 'var(--overlay-light)' : 'transparent',
            color: active === tab ? 'var(--text)' : 'var(--text-muted)',
            borderBottom: active === tab ? '1px solid var(--text)' : '1px solid transparent',
            marginBottom: -1,
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
