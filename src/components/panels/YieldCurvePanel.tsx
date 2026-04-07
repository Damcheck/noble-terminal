'use client';

import { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Panel, PanelHeader, PanelContent, LiveBadge, CachedBadge } from '@/components/ui/Panel';
import { useYieldStore } from '@/store/yieldStore';
import { YIELD_CURVE as MOCK_YIELD } from '@/lib/mockData';

const MATURITY_ORDER = ['1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', '20Y', '30Y'];

function getCurveStatus(spread: number) {
  if (spread < -0.1) return { label: 'INVERTED', color: '#ff4444' };
  if (spread < 0.3) return { label: 'FLAT', color: '#ffaa00' };
  return { label: 'NORMAL', color: '#44ff88' };
}

export default function YieldCurvePanel() {
  const { yields, isRealtimeConnected, initializeRealtime } = useYieldStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  // Use live data if available, else fallback to mock
  const hasLiveData = Object.keys(yields).length >= 3;
  const chartData = hasLiveData
    ? MATURITY_ORDER
        .filter(m => yields[m] !== undefined)
        .map(m => ({ maturity: m, rate: yields[m].rate }))
    : MOCK_YIELD;

  const y10 = chartData.find(y => y.maturity === '10Y')?.rate ?? 0;
  const y2  = chartData.find(y => y.maturity === '2Y')?.rate ?? 0;
  const spread = y10 - y2;
  const curveStatus = getCurveStatus(spread);

  return (
    <Panel>
      <PanelHeader
        title="Yield Curve"
        badge={isRealtimeConnected ? <LiveBadge /> : <CachedBadge label="DAILY" />}
      />
      <PanelContent>
        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            padding: '6px 8px',
            background: 'var(--overlay-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 2,
          }}
        >
          <div>
            <span style={{ fontSize: 9, color: 'var(--text-ghost)', marginRight: 6 }}>2s10s SPREAD</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: curveStatus.color,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {spread >= 0 ? '+' : ''}{spread.toFixed(2)}%
            </span>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 2,
              background: `${curveStatus.color}22`,
              color: curveStatus.color,
              border: `1px solid ${curveStatus.color}44`,
              letterSpacing: 1,
            }}
          >
            {curveStatus.label}
          </span>
        </div>

        {/* Chart */}
        <div style={{ height: 120, marginBottom: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3388ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3388ff" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="maturity"
                tick={{ fontSize: 9, fill: '#555' }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#555' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: '#141414',
                  border: '1px solid #2a2a2a',
                  borderRadius: 2,
                  fontSize: 10,
                  color: '#ccc',
                }}
                formatter={(value: any) => {
                  const n = typeof value === 'number' ? value : parseFloat(value);
                  return [`${n.toFixed(2)}%`, 'Yield'];
                }}
              />
              <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#3388ff"
                strokeWidth={2}
                fill="url(#yieldGrad)"
                dot={{ fill: '#3388ff', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#fff', r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Rate grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {chartData.map(y => (
            <div
              key={y.maturity}
              style={{
                padding: '4px 6px',
                background: 'var(--overlay-subtle)',
                borderRadius: 2,
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>{y.maturity}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#3388ff', fontWeight: 600 }}>
                {y.rate.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}
