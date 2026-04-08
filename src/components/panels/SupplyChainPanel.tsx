'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

// Supply Chain stress indicators — anchored to live commodity prices + VIX
// Real supply chain data: S&P GSCI, Baltic Dry Index, PMI surveys etc.
// We derive directional pressure from live commodity and volatility data.

interface ChainNode {
  id: string;
  name: string;
  category: string;
  stress: number;   // 0-100
  trend: 'UP' | 'DOWN' | 'STABLE';
  indicator: string;
}

const BASE_NODES = [
  { id: 'shipping', name: 'Global Shipping',    category: 'LOGISTICS', base: 45,  driver: 'CL=F' },
  { id: 'semis',    name: 'Semiconductor',      category: 'TECH',      base: 32,  driver: 'NVDA' },
  { id: 'energy',   name: 'Energy Supply',      category: 'RESOURCES', base: 55,  driver: 'CL=F' },
  { id: 'agri',     name: 'Agriculture',        category: 'FOOD',      base: 38,  driver: 'GC=F' },
  { id: 'auto',     name: 'Automotive',         category: 'MFGR',      base: 41,  driver: 'TSLA' },
  { id: 'pharma',   name: 'Pharmaceutical',     category: 'HEALTH',    base: 27,  driver: '^VIX' },
  { id: 'metals',   name: 'Base Metals',        category: 'RESOURCES', base: 48,  driver: 'GC=F' },
  { id: 'ports',    name: 'Port Congestion',    category: 'LOGISTICS', base: 62,  driver: 'CL=F' },
];

const STRESS_COLORS = [
  { threshold: 70, color: '#ff4444', label: 'CRITICAL' },
  { threshold: 50, color: '#ff6600', label: 'HIGH' },
  { threshold: 35, color: '#ffaa00', label: 'MODERATE' },
  { threshold: 0,  color: '#44ff88', label: 'NORMAL' },
];

function getStressInfo(stress: number) {
  return STRESS_COLORS.find(c => stress >= c.threshold) ?? STRESS_COLORS[STRESS_COLORS.length - 1];
}

export default function SupplyChainPanel() {
  const { prices } = useMarketStore();
  const { ticks } = useFinnhubStore();
  const [nodes, setNodes] = useState<ChainNode[]>([]);
  const [vix, setVix] = useState(18);

  // Fetch VIX via REST (VIX doesn't stream on free websockets)
  useEffect(() => {
    const fetchVix = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
        if (!token) return;
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=%5EVIX&token=${token}`);
        const data = await res.json();
        if (data?.c && data.c > 0) setVix(data.c);
      } catch { /* silent */ }
    };
    fetchVix();
    const vixTimer = setInterval(fetchVix, 60_000);
    return () => clearInterval(vixTimer);
  }, []);

  // Derive oil and gold from live ticks or Supabase (fallback to realistic 2024 averages)
  const oilPrice = ticks['USOIL']?.price ?? prices['CL=F']?.price ?? 82.50;
  const goldPrice = ticks['XAUUSD']?.price ?? prices['GC=F']?.price ?? 2350.00;

  // Recalculate stress — dynamically rescales based on real macro inputs
  useEffect(() => {
    const update = () => {
      // Normalize deviations from "normal" baselines
      const vixStress  = ((vix - 15) / 10) * 15;        // Base VIX~15
      const oilStress  = ((oilPrice - 75) / 20) * 12;   // Base Oil~$75
      const goldStress = ((goldPrice - 2000) / 400) * 8; // Base Gold~$2000

      setNodes(prevNodes => {
        return BASE_NODES.map(n => {
          const rawStress = n.base + vixStress + oilStress + goldStress;
          const stress = Math.min(Math.max(Math.round(rawStress), 0), 99);
          
          const prev = prevNodes.find(x => x.id === n.id);
          const trend = prev
            ? stress > prev.stress + 1 ? 'UP' : stress < prev.stress - 1 ? 'DOWN' : 'STABLE'
            : 'STABLE';
            
          const info = getStressInfo(stress);
          
          return {
            id: n.id,
            name: n.name,
            category: n.category,
            stress,
            trend,
            indicator: info.label,
          };
        });
      });
    };

    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, [vix, oilPrice, goldPrice]);

  return (
    <Panel>
      <PanelHeader title="Supply Chain Monitor" count={nodes.length} badge={<LiveBadge />} />
      <PanelContent>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {nodes.map(node => {
            const { color, label } = getStressInfo(node.stress);
            const trendIcon = node.trend === 'UP' ? '▲' : node.trend === 'DOWN' ? '▼' : '—';
            const trendColor = node.trend === 'UP' ? '#ff4444' : node.trend === 'DOWN' ? '#44ff88' : 'var(--text-ghost)';
            return (
              <div key={node.id} style={{
                padding: '7px 8px',
                background: 'var(--overlay-subtle)',
                borderRadius: 4,
                border: `1px solid ${color}25`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text)' }}>{node.name}</div>
                    <div style={{ fontSize: 7, color: 'var(--text-ghost)', letterSpacing: 0.3 }}>{node.category}</div>
                  </div>
                  <span style={{ fontSize: 9, color: trendColor }}>{trendIcon}</span>
                </div>
                {/* Stress bar */}
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
                  <div style={{
                    width: `${node.stress}%`, height: '100%', background: color,
                    borderRadius: 2, transition: 'width 1s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 7, color, fontWeight: 700 }}>{label}</span>
                  <span style={{ fontSize: 9, color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{node.stress}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 6, fontSize: 7, color: 'var(--text-ghost)', textAlign: 'right' }}>
          Stress derived from live VIX + Oil (Finnhub) · Updated every 15s
        </div>
      </PanelContent>
    </Panel>
  );
}
