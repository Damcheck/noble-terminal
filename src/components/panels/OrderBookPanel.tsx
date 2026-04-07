'use client';

import { useMemo, useState, useEffect } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

// Generate dynamic levels based on a tick state to simulate depth flowing
function generateLevels(mid: number, count: number, side: 'ask' | 'bid', tick: number) {
  const levels = [];
  let cumSize = 0;
  const tickSize = mid > 1000 ? 0.5 : mid > 10 ? 0.05 : 0.0001;
  const isJpy = tickSize === 0.05;
  const isGold = tickSize === 0.5;

  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * tickSize;
    const price = side === 'ask' ? mid + offset : mid - offset;
    
    // Size micro-variance based on the tick interval
    const noise = (Math.sin(tick * (i + 1)) + 1) * 2; 
    const size = Math.max(0.1, (Math.random() * 2 + noise + (isGold ? 5 : isJpy ? 2 : 1)));
    
    cumSize += size;
    levels.push({ price, size, total: cumSize });
  }
  return side === 'ask' ? levels.reverse() : levels;
}

export default function OrderBookPanel() {
  const { prices, selectedSymbol } = useMarketStore();
  const { ticks } = useFinnhubStore();
  const [tick, setTick] = useState(0);

  // Update order sizes multiple times a second to look like a true Level 2 DOM
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 300);
    return () => clearInterval(id);
  }, []);

  // Use the globally selected symbol for the order book (maps FX_IDC:EURUSD to EURUSD)
  const cleanSymbol = selectedSymbol.split(':')[1] || selectedSymbol;
  
  const livePrice =
    ticks[cleanSymbol]?.price ||
    prices[cleanSymbol]?.price ||
    (cleanSymbol.includes('JPY') ? 150.32 : cleanSymbol.includes('XAU') ? 2450.10 : 1.085);

  const book = useMemo(() => {
    const mid = livePrice;
    const asks = generateLevels(mid, 7, 'ask', tick);
    const bids = generateLevels(mid, 7, 'bid', tick);
    const spreadDecimals = cleanSymbol.includes('JPY') ? 3 : cleanSymbol.includes('XAU') ? 2 : 5;
    const spread = (asks[asks.length - 1].price - bids[0].price).toFixed(spreadDecimals);
    return { asks, bids, spread };
  }, [livePrice, tick, cleanSymbol]);

  const maxTotal = Math.max(
    ...book.asks.map(a => a.total),
    ...book.bids.map(b => b.total)
  );

  const label = cleanSymbol || 'XAUUSD';
  const priceDecimals = cleanSymbol.includes('JPY') ? 3 : cleanSymbol.includes('XAU') ? 2 : 5;

  return (
    <Panel>
      <PanelHeader title={`Order Flow DOM — ${label}`} badge={<LiveBadge />} />
      <PanelContent noPad>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '4px 8px',
          fontSize: 9, color: 'var(--text-ghost)', borderBottom: '1px solid var(--border)',
          background: 'var(--overlay-subtle)',
        }}>
          <span>PRICE</span>
          <span style={{ textAlign: 'center' }}>SIZE</span>
          <span style={{ textAlign: 'right' }}>TOTAL</span>
        </div>

        {/* Asks (Sell Orders - Red) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {book.asks.map(ask => {
            const barW = (ask.total / maxTotal) * 100;
            return (
              <div key={ask.price} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 8px',
                fontSize: 10, fontFamily: 'var(--font-mono)', position: 'relative', cursor: 'pointer',
              }}>
                <div style={{
                  position: 'absolute', right: 0, top: 0, height: '100%', width: `${barW}%`,
                  background: 'rgba(255,68,68,0.12)', zIndex: 0, transition: 'width 0.3s',
                }} />
                <span style={{ color: '#ff4444', position: 'relative', zIndex: 1, fontWeight: 600 }}>{ask.price.toFixed(priceDecimals)}</span>
                <span style={{ color: 'var(--text-dim)', textAlign: 'center', position: 'relative', zIndex: 1 }}>{ask.size.toFixed(2)}</span>
                <span style={{ color: 'var(--text-muted)', textAlign: 'right', position: 'relative', zIndex: 1 }}>{ask.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Spread Row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '4px 8px', background: 'var(--overlay-light)',
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: 10,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>SPREAD</span>
          <span style={{ color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{book.spread}</span>
        </div>

        {/* Bids (Buy Orders - Green) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {book.bids.map(bid => {
            const barW = (bid.total / maxTotal) * 100;
            return (
              <div key={bid.price} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 8px',
                fontSize: 10, fontFamily: 'var(--font-mono)', position: 'relative', cursor: 'pointer',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%', width: `${barW}%`,
                  background: 'rgba(68,255,136,0.1)', zIndex: 0, transition: 'width 0.3s',
                }} />
                <span style={{ color: '#44ff88', position: 'relative', zIndex: 1, fontWeight: 600 }}>{bid.price.toFixed(priceDecimals)}</span>
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
