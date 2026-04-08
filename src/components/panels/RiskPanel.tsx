'use client';

import { useState, useEffect, useCallback } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useMarketStore } from '@/store/marketStore';

interface FearGreed { value: number; classification: string; }

function GaugeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ width: 80, fontSize: 9, color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--overlay-subtle)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 1s ease' }} />
      </div>
      <span style={{ width: 32, fontSize: 9, color, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

export default function RiskPanel() {
  const { ticks } = useFinnhubStore();
  const { prices } = useMarketStore();
  const [fearGreed, setFearGreed] = useState<FearGreed | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Fetch Fear & Greed from Alternative.me (free, no key)
  const fetchFearGreed = useCallback(async () => {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      const data = await res.json();
      if (data?.data?.[0]) {
        setFearGreed({ value: Number(data.data[0].value), classification: data.data[0].value_classification });
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchFearGreed();
    const id = setInterval(fetchFearGreed, 300_000); // every 5 min
    return () => clearInterval(id);
  }, [fetchFearGreed]);

  // Live VIX — Finnhub tick > Supabase price > fallback
  useEffect(() => {
    const id = setInterval(() => setLastUpdate(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const [vixPrice, setVixPrice] = useState<number | null>(null);

  // Fetch VIX via Finnhub REST (free tier) — WebSocket doesn't stream it
  const fetchVix = useCallback(async () => {
    try {
      const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
      if (!token) return;
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=%5EVIX&token=${token}`);
      const data = await res.json();
      if (data?.c && data.c > 0) setVixPrice(data.c);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchVix();
    const id = setInterval(fetchVix, 60_000); // every 60s
    return () => clearInterval(id);
  }, [fetchVix]);

  // BTC price via Finnhub WebSocket (key: BTC-USD from BINANCE:BTCUSDT mapping)
  const btcPrice = ticks['BTC-USD']?.price ?? prices['BTC-USD']?.price ?? null;
  // Fallback map: Live Finnhub -> Vercel Cron -> Null
  const vix = vixPrice ?? prices['^VIX']?.price ?? null;
  const fearVal = fearGreed?.value ?? 50;

  // Derive risk levels from live data
  const marketRisk = vix ? Math.min(Math.round(((vix - 10) / 35) * 100), 99) : 50;
  const cryptoRisk = vix ? Math.min(Math.round(((100 - fearVal) * 0.8) + (vix * 0.5)), 99) : 50;
  const liquidityRisk = vix ? Math.min(Math.round(vix * 1.8 + 5), 99) : 50;
  const correlationRisk = vix ? Math.min(Math.round(vix * 1.2 + 10), 95) : 50;
  const tailRisk = vix ? Math.min(Math.round(vix * 1.5 + 8), 95) : 50;

  const vixColor = !vix ? 'var(--text-muted)' : vix > 30 ? '#ff4444' : vix > 20 ? '#ffaa00' : '#44ff88';
  const fearColor = fearVal < 25 ? '#ff4444' : fearVal < 50 ? '#ffaa00' : fearVal < 75 ? '#44ff88' : '#44ff88';
  const fearLabel = fearGreed?.classification ?? (fearVal < 25 ? 'Extreme Fear' : fearVal < 50 ? 'Fear' : fearVal < 75 ? 'Greed' : 'Extreme Greed');

  return (
    <Panel>
      <PanelHeader title="Risk Overview" badge={<LiveBadge />} />
      <PanelContent>
        {/* Live VIX + Fear & Greed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          <div style={{
            padding: '8px', background: 'var(--overlay-subtle)', borderRadius: 4,
            border: `1px solid ${vixColor}30`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: 0.5 }}>VIX · LIVE</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: vixColor, fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
              {vix !== null ? vix.toFixed(2) : '---'}
            </div>
            <div style={{ fontSize: 8, color: vixColor }}>{!vix ? 'AWAITING API' : vix > 30 ? 'HIGH RISK' : vix > 20 ? 'ELEVATED' : 'STABLE'}</div>
          </div>
          <div style={{
            padding: '8px', background: 'var(--overlay-subtle)', borderRadius: 4,
            border: `1px solid ${fearColor}30`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 8, color: 'var(--text-ghost)', letterSpacing: 0.5 }}>CRYPTO F&G</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: fearColor, fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
              {fearVal}
            </div>
            <div style={{ fontSize: 8, color: fearColor }}>{fearLabel.toUpperCase()}</div>
          </div>
        </div>

        {/* Risk gauges derived from live VIX */}
        <div style={{ fontSize: 8, color: 'var(--text-ghost)', marginBottom: 5, letterSpacing: 0.5 }}>RISK METRICS — DERIVED FROM LIVE VIX</div>
        <GaugeBar label="Market Risk" value={marketRisk} color={marketRisk > 70 ? '#ff4444' : marketRisk > 45 ? '#ffaa00' : '#44ff88'} />
        <GaugeBar label="Crypto Risk" value={cryptoRisk} color={cryptoRisk > 70 ? '#ff4444' : cryptoRisk > 45 ? '#ffaa00' : '#44ff88'} />
        <GaugeBar label="Liquidity" value={liquidityRisk} color={liquidityRisk > 70 ? '#ff4444' : liquidityRisk > 45 ? '#ffaa00' : '#44ff88'} />
        <GaugeBar label="Correlation" value={correlationRisk} color={correlationRisk > 70 ? '#ff4444' : correlationRisk > 45 ? '#ffaa00' : '#44ff88'} />
        <GaugeBar label="Tail Risk" value={tailRisk} color={tailRisk > 70 ? '#ff4444' : tailRisk > 45 ? '#ffaa00' : '#44ff88'} />

        {/* BTC Price context */}
        <div style={{ marginTop: 8, padding: '5px 8px', background: 'var(--overlay-subtle)', borderRadius: 3 }}>
          <div style={{ fontSize: 8, color: 'var(--text-ghost)' }}>BTC PRICE CONTEXT</div>
          <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {btcPrice !== null ? `$${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'AWAITING API'}
          </div>
        </div>

        <div style={{ fontSize: 7, color: 'var(--text-ghost)', marginTop: 8, textAlign: 'right' }}>
          VIX from Finnhub · F&G from alternative.me · Updated {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </PanelContent>
    </Panel>
  );
}
