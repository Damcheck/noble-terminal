'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { ORDER_BOOK } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

// Generate simulated order-book levels around a mid price
function generateLevels(mid: number, count: number, side: 'ask' | 'bid') {
  const levels = [];
  let cumSize = 0;
  const tickSize = mid > 1000 ? 0.5 : mid > 10 ? 0.05 : 0.0001;
  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * tickSize;
    const price = side === 'ask' ? mid + offset : mid - offset;
    const size = parseFloat((Math.random() * 3 + 0.3).toFixed(2));
    cumSize += size;
    levels.push({ price, size, total: parseFloat(cumSize.toFixed(2)) });
  }
  return side === 'ask' ? levels.reverse() : levels;
}

export default function OrderBookPanel() {
  const { prices, isRealtimeConnected, selectedSymbol } = useMarketStore();
  const { ticks } = useFinnhubStore();

  // Use the globally selected symbol for the order book
  const livePrice =
    ticks[selectedSymbol]?.price ||
    prices[selectedSymbol]?.price ||
    prices[selectedSymbol]?.bid;

  const book = useMemo(() => {
    if (!livePrice) return ORDER_BOOK;
    const mid = livePrice;
    const asks = generateLevels(mid, 5, 'ask');
    const bids = generateLevels(mid, 5, 'bid');
    const spread = (asks[asks.length - 1].price - bids[0].price).toFixed(2);
    return { asks, bids, spread };
  }, [livePrice]);

  const maxTotal = Math.max(
    ...book.asks.map(a => a.total),
    ...book.bids.map(b => b.total)
  );

  const label = selectedSymbol || 'XAU/USD';

  return (
    <Panel>
      <PanelHeader
        title={`Order Book — ${label}`}
        badge={isRealtimeConnected ? <LiveBadge /> : undefined}
      />
      <PanelContent noPad>
        {/* Column Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '4px 8px',
            fontSize: 9,
            color: 'var(--text-ghost)',
            borderBottom: '1px solid var(--border)',
            background: 'var(--overlay-subtle)',
          }}
        >
          <span>PRICE</span>
          <span style={{ textAlign: 'center' }}>SIZE</span>
          <span style={{ textAlign: 'right' }}>TOTAL</span>
        </div>

        {/* Asks (sell orders — red) */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
          {book.asks.map(ask => {
            const barW = (ask.total / maxTotal) * 100;
            return (
              <div
                key={ask.price}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '3px 8px',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,68,68,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div
                  style={{
                    position: 'absolute', right: 0, top: 0,
                    height: '100%', width: `${barW}%`,
                    background: 'rgba(255,68,68,0.12)', zIndex: 0,
                  }}
                />
                <span style={{ color: '#ff4444', position: 'relative', zIndex: 1 }}>{ask.price.toFixed(2)}</span>
                <span style={{ color: 'var(--text-dim)', textAlign: 'center', position: 'relative', zIndex: 1 }}>{ask.size.toFixed(2)}</span>
                <span style={{ color: 'var(--text-muted)', textAlign: 'right', position: 'relative', zIndex: 1 }}>{ask.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Spread */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '5px 8px', background: 'var(--overlay-light)',
            borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: 10,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>SPREAD</span>
          <span style={{ color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {book.spread}
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>
            ({((parseFloat(book.spread) / book.bids[0].price) * 100).toFixed(4)}%)
          </span>
        </div>

        {/* Bids (buy orders — green) */}
        <div>
          {book.bids.map(bid => {
            const barW = (bid.total / maxTotal) * 100;
            return (
              <div
                key={bid.price}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '3px 8px',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(68,255,136,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div
                  style={{
                    position: 'absolute', left: 0, top: 0,
                    height: '100%', width: `${barW}%`,
                    background: 'rgba(68,255,136,0.1)', zIndex: 0,
                  }}
                />
                <span style={{ color: '#44ff88', position: 'relative', zIndex: 1 }}>{bid.price.toFixed(2)}</span>
                <span style={{ color: 'var(--text-dim)', textAlign: 'center', position: 'relative', zIndex: 1 }}>{bid.size.toFixed(2)}</span>
                <span style={{ color: 'var(--text-muted)', textAlign: 'right', position: 'relative', zIndex: 1 }}>{bid.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </PanelContent>
    </Panel>
  );
}
