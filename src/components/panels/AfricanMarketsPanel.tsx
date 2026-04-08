'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { AFRICAN_MARKETS } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

const NGX_SYMBOLS = ['GTCO', 'ZENITHBANK', 'ACCESSCORP', 'MTNN', 'DANGCEM', 'UBA'];

export default function AfricanMarketsPanel() {
  const { prices } = useMarketStore();

  // USD/NGN — from Yahoo Finance cron via Supabase, or static fallback (no noise)
  const usdNgn = useMemo(() => {
    const live = prices['USDNGN=X'];
    return {
      value: live?.price ?? AFRICAN_MARKETS.usdNgn.value,
      change: live?.change_pct ?? 0,
    };
  }, [prices]);

  // NGX All-Share Index — from Supabase cron or static fallback (no noise)
  const ngxAllShare = useMemo(() => {
    const live = prices['NGX.LG'];
    return {
      value: live?.price ?? AFRICAN_MARKETS.ngxAllShare.value,
      change: live?.change_pct ?? 0,
    };
  }, [prices]);

  // NGX Banking Index — from Supabase cron or static fallback (no noise)
  const ngxBanking = useMemo(() => {
    const live = prices['NGXBANKING.LG'];
    return {
      value: live?.price ?? AFRICAN_MARKETS.ngxBanking.value,
      change: live?.change_pct ?? 0,
    };
  }, [prices]);

  const ngxStocks = useMemo(() => {
    const defaultData = [
      { symbol: 'GTCO', price: 47.50, change: 0 },
      { symbol: 'ZENITHBANK', price: 41.20, change: 0 },
      { symbol: 'ACCESSCORP', price: 24.15, change: 0 },
      { symbol: 'MTNN', price: 230.50, change: 0 },
      { symbol: 'DANGCEM', price: 650.00, change: 0 },
      { symbol: 'UBA', price: 28.40, change: 0 },
    ];

    return NGX_SYMBOLS.map(sym => {
      const live = prices[`${sym}.LG`];
      const fallback = defaultData.find(d => d.symbol === sym)!;
      // Exact Supabase price or exact fallback — NO noise
      return {
        symbol: sym,
        price: live?.price ?? fallback.price,
        change: live?.change_pct ?? fallback.change,
      };
    }).sort((a, b) => b.change - a.change);
  }, [prices]);

  const topGainers = ngxStocks.filter(s => s.change >= 0).slice(0, 3);
  const topLosers = ngxStocks.filter(s => s.change < 0).reverse().slice(0, 3); // most negative first

  // If there aren't any losers in the top 3, pad with the lowest gainers conceptually
  if (topLosers.length < 3) {
    const padded = ngxStocks.slice(-3).reverse();
    topLosers.splice(0, topLosers.length, ...padded);
  }

  return (
    <Panel>
      <PanelHeader title="African Markets — NGX" badge={<LiveBadge />} />
      <PanelContent>
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
          {[
            { label: 'NGX ALL-SHARE', value: ngxAllShare.value.toLocaleString(undefined, {maximumFractionDigits: 1}), change: ngxAllShare.change },
            { label: 'NGX BANKING', value: ngxBanking.value.toLocaleString(undefined, {maximumFractionDigits: 1}), change: ngxBanking.change },
            { label: 'USD/NGN', value: usdNgn.value.toLocaleString(undefined, {maximumFractionDigits: 0}), change: usdNgn.change },
          ].map(stat => {
            const up = stat.change >= 0;
            return (
              <div key={stat.label} style={{
                padding: '8px 10px', background: 'var(--overlay-subtle)',
                border: '1px solid var(--border)', borderRadius: 2,
              }}>
                <div style={{ fontSize: 9, color: 'var(--text-ghost)', marginBottom: 2, letterSpacing: 0.5 }}>{stat.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: up ? '#44ff88' : '#ff4444', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {up ? '+' : ''}{stat.change.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Gainers / Losers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: '#44ff88', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>▲ TOP MOVERS</div>
            {topGainers.map((s, i) => (
              <div key={`${s.symbol}-${i}`} className="flex justify-between items-center" style={{ padding: '4px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 10 }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.symbol}</span>
                <div className="text-right">
                  <div style={{ color: 'var(--text-dim)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>₦{s.price.toFixed(2)}</div>
                  <div style={{ color: '#44ff88', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>+{s.change.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#ff4444', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>▼ LAGGARDS</div>
            {topLosers.map((s, i) => (
              <div key={`${s.symbol}-${i}`} className="flex justify-between items-center" style={{ padding: '4px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 10 }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.symbol}</span>
                <div className="text-right">
                  <div style={{ color: 'var(--text-dim)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>₦{s.price.toFixed(2)}</div>
                  <div style={{ color: s.change >= 0 ? '#44ff88' : '#ff4444', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 10, padding: '6px 10px', background: 'rgba(68,255,136,0.06)',
          border: '1px solid rgba(68,255,136,0.2)', borderRadius: 2, fontSize: 8, color: 'var(--text-muted)', textAlign: 'center',
        }}>
          🇳🇬 Nigerian Exchange Group · Lagos · WAT (UTC+1) · LIVE API
        </div>
      </PanelContent>
    </Panel>
  );
}
