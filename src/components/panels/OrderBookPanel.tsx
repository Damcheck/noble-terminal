'use client';

import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { ORDER_BOOK } from '@/lib/mockData';

export default function OrderBookPanel() {
  const maxTotal = Math.max(
    ...ORDER_BOOK.asks.map(a => a.total),
    ...ORDER_BOOK.bids.map(b => b.total)
  );

  return (
    <Panel>
      <PanelHeader title="Order Book" badge={<LiveBadge />} />
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
          {ORDER_BOOK.asks.map(ask => {
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
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    width: `${barW}%`,
                    background: 'rgba(255,68,68,0.12)',
                    zIndex: 0,
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '5px 8px',
            background: 'var(--overlay-light)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            fontSize: 10,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>SPREAD</span>
          <span style={{ color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {ORDER_BOOK.spread}
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>
            ({((parseFloat(ORDER_BOOK.spread) / ORDER_BOOK.bids[0].price) * 100).toFixed(4)}%)
          </span>
        </div>

        {/* Bids (buy orders — green) */}
        <div>
          {ORDER_BOOK.bids.map(bid => {
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
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${barW}%`,
                    background: 'rgba(68,255,136,0.1)',
                    zIndex: 0,
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
