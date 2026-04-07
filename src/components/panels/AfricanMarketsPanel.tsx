'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, CachedBadge, LiveBadge } from '@/components/ui/Panel';
import { AFRICAN_MARKETS } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

// NGX tickers as stored by our cron job
const NGX_SYMBOLS = ['GTCO.LG', 'ZENITHBANK.LG', 'ACCESSCORP.LG', 'MTNN.LG', 'DANGCEM.LG', 'UBA.LG'];

export default function AfricanMarketsPanel() {
  const { prices, isRealtimeConnected } = useMarketStore();

  // Pull USD/NGN rate from forex store
  const usdNgn = useMemo(() => {
    const live = prices['USDNGN=X'] || prices['USD/NGN'];
    if (live) return { value: live.price, change: live.change_pct };
    return AFRICAN_MARKETS.usdNgn;
  }, [prices]);

  // Pull NGX index if available
  const ngxAllShare = useMemo(() => {
    const live = prices['NGX.LG'] || prices['NGXASI'];
    if (live) return { value: live.price, change: live.change_pct };
    return AFRICAN_MARKETS.ngxAllShare;
  }, [prices]);

  // Build live NGX stocks table
  const ngxStocks = useMemo(() => {
    const live = NGX_SYMBOLS
      .map(sym => prices[sym])
      .filter(Boolean)
      .map(p => ({
        symbol: p.symbol.replace('.LG', ''),
        price: p.price,
        change: p.change_pct,
      }))
      .sort((a, b) => b.change - a.change);

    return live.length > 0 ? live : null;
  }, [prices]);

  const topGainers = ngxStocks
    ? ngxStocks.filter(s => s.change >= 0).slice(0, 3)
    : AFRICAN_MARKETS.topGainers;

  const topLosers = ngxStocks
    ? ngxStocks.filter(s => s.change < 0).slice(0, 3)
    : AFRICAN_MARKETS.topLosers;

  return (
    <Panel>
      <PanelHeader
        title="African Markets — NGX"
        badge={
          isRealtimeConnected ? <LiveBadge /> :
          <span
            style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 10,
              color: '#44ff88', border: '1px solid rgba(68,255,136,0.4)',
              background: 'rgba(68,255,136,0.1)',
            }}
          >
            NGX
          </span>
        }
      />
      <PanelContent>
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
          {[
            { label: 'NGX ALL-SHARE', value: ngxAllShare.value.toLocaleString(), change: ngxAllShare.change },
            { label: 'NGX BANKING', value: AFRICAN_MARKETS.ngxBanking.value.toFixed(1), change: AFRICAN_MARKETS.ngxBanking.change },
            { label: 'USD/NGN', value: usdNgn.value.toLocaleString(), change: usdNgn.change },
          ].map(stat => {
            const up = stat.change >= 0;
            return (
              <div
                key={stat.label}
                style={{
                  padding: '8px 10px',
                  background: 'var(--overlay-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 2,
                }}
              >
                <div style={{ fontSize: 9, color: 'var(--text-ghost)', marginBottom: 2, letterSpacing: 0.5 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 9, color: up ? '#44ff88' : '#ff4444', marginTop: 2 }}>
                  {up ? '+' : ''}{stat.change.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Gainers / Losers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: '#44ff88', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>
              ▲ TOP GAINERS
            </div>
            {topGainers.map(s => (
              <div
                key={s.symbol}
                className="flex justify-between items-center"
                style={{ padding: '4px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 10 }}
              >
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.symbol}</span>
                <div className="text-right">
                  <div style={{ color: 'var(--text-dim)', fontSize: 9 }}>₦{s.price.toFixed(2)}</div>
                  <div style={{ color: '#44ff88', fontWeight: 700 }}>+{s.change.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#ff4444', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>
              ▼ TOP LOSERS
            </div>
            {topLosers.map(s => (
              <div
                key={s.symbol}
                className="flex justify-between items-center"
                style={{ padding: '4px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 10 }}
              >
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.symbol}</span>
                <div className="text-right">
                  <div style={{ color: 'var(--text-dim)', fontSize: 9 }}>₦{s.price.toFixed(2)}</div>
                  <div style={{ color: '#ff4444', fontWeight: 700 }}>{s.change.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: 10, padding: '6px 10px',
            background: 'rgba(68,255,136,0.06)',
            border: '1px solid rgba(68,255,136,0.2)',
            borderRadius: 2, fontSize: 9, color: 'var(--text-muted)', textAlign: 'center',
          }}
        >
          🇳🇬 Nigerian Exchange Group · Lagos · WAT (UTC+1) · {isRealtimeConnected ? 'LIVE' : 'DATA: NGX API'}
        </div>
      </PanelContent>
    </Panel>
  );
}
