'use client';

import { useEffect, useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, Sparkline } from '@/components/ui/Panel';
import { CRYPTO_LIST as MOCK_CRYPTO_LIST } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

const FEAR_GREED_MOCK = { value: 61, label: 'GREED' };

function getFearColor(v: number) {
  if (v < 25) return '#ff4444';
  if (v < 45) return '#ff8800';
  if (v < 55) return '#ffaa00';
  if (v < 75) return '#44aa44';
  return '#44ff88';
}

export default function CryptoPanel() {
  const { prices, isRealtimeConnected, initializeRealtime } = useMarketStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  const globalMeta = prices['__CRYPTO_GLOBAL__'];
  const btcDom = globalMeta?.extra?.btc_dominance 
    ? `${Number(globalMeta.extra.btc_dominance).toFixed(1)}%` 
    : '52.4%';
  const totalMcap = globalMeta?.price 
    ? `$${(globalMeta.price / 1e12).toFixed(2)}T` 
    : '2.81T';

  const color = getFearColor(FEAR_GREED_MOCK.value);
  const fill = (FEAR_GREED_MOCK.value / 100) * 157;

  // Merge Realtime Data into Mock data array for layout stability
  const renderList = useMemo(() => {
    return MOCK_CRYPTO_LIST.map(mockItem => {
      // Find matching crypto in the store. Supabase might store BTC-USD or just BTC. 
      // Our mock has "BTC", "ETH" etc.
      const liveData = prices[`${mockItem.symbol}-USD`] || prices[mockItem.symbol];
      if (liveData) {
        return {
          ...mockItem,
          price: liveData.price || mockItem.price,
          change24h: liveData.change_pct || mockItem.change24h,
          mcap: liveData.market_cap ? `$${(liveData.market_cap / 1e9).toFixed(1)}B` : mockItem.mcap,
        };
      }
      return mockItem;
    });
  }, [prices]);

  return (
    <Panel>
      <PanelHeader 
        title="Crypto" 
        count={renderList.length} 
        badge={isRealtimeConnected ? <LiveBadge /> : undefined} 
      />
      <PanelContent noPad>
        {/* Fear & Greed + Stats */}
        <div
          className="flex items-center gap-4 px-3 py-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--overlay-subtle)' }}
        >
          {/* Mini gauge */}
          <svg viewBox="0 0 80 46" style={{ width: 80, height: 46, flexShrink: 0 }}>
            <path d="M 7 40 A 33 33 0 0 1 73 40" fill="none" stroke="var(--border-strong)" strokeWidth={5} strokeLinecap="round" />
            <path d="M 7 40 A 33 33 0 0 1 73 40" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${fill * 0.67} 105`} />
            <text x="40" y="36" textAnchor="middle" fill={color} fontSize="14" fontWeight="700" fontFamily="var(--font-mono)">{FEAR_GREED_MOCK.value}</text>
          </svg>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: 0.5 }}>FEAR & GREED</div>
            <div style={{ fontSize: 12, fontWeight: 700, color }}>{FEAR_GREED_MOCK.label}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>BTC DOM</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{btcDom}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)' }}>TOTAL MCAP</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{totalMcap}</div>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'var(--overlay-subtle)' }}>
              {['COIN', 'PRICE', '24H%', 'MCAP', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '5px 8px',
                    textAlign: 'left',
                    fontSize: 9,
                    color: 'var(--text-ghost)',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderList.map((c, i) => {
              const up = c.change24h >= 0;
              return (
                <tr
                  key={c.symbol}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--overlay-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--overlay-subtle)'; }}
                >
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 10 }}>{c.symbol}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{c.name}</div>
                  </td>
                  <td style={{ padding: '5px 8px', color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    {c.price >= 1000
                      ? c.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
                      : c.price.toFixed(4)}
                  </td>
                  <td style={{ padding: '5px 8px', color: up ? '#44ff88' : '#ff4444', fontWeight: 600, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {up ? '+' : ''}{c.change24h.toFixed(2)}%
                  </td>
                  <td style={{ padding: '5px 8px', color: 'var(--text-muted)', textAlign: 'right', fontSize: 9 }}>
                    {c.mcap}
                  </td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                    <Sparkline data={c.spark} up={up} width={48} height={16} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PanelContent>
    </Panel>
  );
}
