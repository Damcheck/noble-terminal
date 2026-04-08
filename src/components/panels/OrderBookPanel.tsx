'use client';

import { useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge } from '@/components/ui/Panel';
import { useMarketStore } from '@/store/marketStore';
import { useFinnhubStore } from '@/store/finnhubStore';

// TRUE Order Flow DOM using 100% REAL trade prints.
// Because free API tiers do not provide Level 2 standing limit orders,
// we visualize actual recent market buy/sell order executions to show depth.

export default function OrderBookPanel() {
  const { prices, selectedSymbol } = useMarketStore();
  const { ticks, tradeHistory } = useFinnhubStore();

  const resolvePrice = (sym: string): number | null => {
    const stripped = sym.includes(':') ? sym.split(':')[1] : sym;
    if (ticks[stripped]) return ticks[stripped].price;
    if (ticks[`${stripped}-USD`]) return ticks[`${stripped}-USD`].price;
    const noUsd = stripped.replace('-USD', '');
    if (ticks[noUsd]) return ticks[noUsd].price;
    if (prices[stripped]) return prices[stripped].price;
    if (prices[`${stripped}-USD`]) return prices[`${stripped}-USD`].price;
    if (prices[noUsd]) return prices[noUsd].price;
    return null;
  };

  const rawSymbol = selectedSymbol.includes(':') ? selectedSymbol.split(':')[1] : selectedSymbol;
  const livePrice = resolvePrice(selectedSymbol);

  const isJPY = rawSymbol.includes('JPY');
  const isGold = rawSymbol.includes('XAU') || rawSymbol === 'XAUUSD';
  const isCrypto = rawSymbol.includes('-USD') || rawSymbol === 'BTC' || rawSymbol === 'ETH';
  const priceDecimals = isCrypto ? 2 : isJPY ? 3 : isGold ? 2 : 5;

  // Filter global history for this symbol
  const filterTrades = useMemo(() => {
    const variants = [rawSymbol, `${rawSymbol}-USD`, rawSymbol.replace('-USD', '')];
    return tradeHistory.filter(t => variants.includes(t.symbol));
  }, [tradeHistory, rawSymbol]);

  const flow = useMemo(() => {
    // Separate real prints into buys (bid hits) and sells (ask hits) base on direction
    const buys = filterTrades.filter(t => t.prevPrice ? t.price >= t.prevPrice : true).slice(0, 7);
    const sells = filterTrades.filter(t => t.prevPrice ? t.price < t.prevPrice : false).slice(0, 7);

    // Calculate rolling volume totals
    let sTotal = 0;
    const asks = sells.map(s => {
      sTotal += s.volume;
      return { price: s.price, size: s.volume, total: sTotal };
    });

    let bTotal = 0;
    const bids = buys.map(b => {
      bTotal += b.volume;
      return { price: b.price, size: b.volume, total: bTotal };
    });

    // We must reverse asks so highest price is at top, just like a real DOM
    asks.sort((a, b) => b.price - a.price);
    bids.sort((a, b) => b.price - a.price);

    const spread = livePrice ? livePrice.toFixed(priceDecimals) : '---';

    return { asks, bids, spread };
  }, [filterTrades, livePrice, priceDecimals]);

  const maxTotal = Math.max(
    0.01,
    ...(flow.asks.length ? flow.asks.map(a => a.total) : [0]),
    ...(flow.bids.length ? flow.bids.map(b => b.total) : [0])
  );

  return (
    <Panel>
      <PanelHeader title={`Order Flow DOM — ${rawSymbol || '---'}`} badge={<LiveBadge />} />
      <PanelContent noPad>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '4px 8px',
          fontSize: 9, color: 'var(--text-ghost)', borderBottom: '1px solid var(--border)',
          background: 'var(--overlay-subtle)',
        }}>
          <span>PRICE (EXEC)</span>
          <span style={{ textAlign: 'center' }}>VOL</span>
          <span style={{ textAlign: 'right' }}>CUM VOL</span>
        </div>

        {!livePrice ? (
          <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1 }}>
            [ WAITING FOR LIVE EXCHANGE DATA ]
          </div>
        ) : flow.asks.length === 0 && flow.bids.length === 0 ? (
           <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1 }}>
            [ AWAITING ORDER FLOW PRINTS ]
          </div>
        ) : (
          <>
            {/* Asks (Sell Orders - Red) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {flow.asks.map((ask, i) => {
                const barW = (ask.total / maxTotal) * 100;
                return (
                  <div key={`ask-${i}-${ask.price}`} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 8px',
                    fontSize: 10, fontFamily: 'var(--font-mono)', position: 'relative', cursor: 'pointer',
                  }}>
                    <div style={{
                      position: 'absolute', right: 0, top: 0, height: '100%', width: `${barW}%`,
                      background: 'rgba(255,68,68,0.12)', zIndex: 0, transition: 'width 0.3s',
                    }} />
                    <span style={{ color: '#ff4444', position: 'relative', zIndex: 1, fontWeight: 600 }}>{ask.price.toFixed(priceDecimals)}</span>
                    <span style={{ color: 'var(--text-dim)', textAlign: 'center', position: 'relative', zIndex: 1 }}>{ask.size.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                    <span style={{ color: 'var(--text-muted)', textAlign: 'right', position: 'relative', zIndex: 1 }}>{ask.total.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  </div>
                );
              })}
            </div>

            {/* Price Anchor */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '4px 8px', background: 'var(--overlay-light)',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: 10,
            }}>
              <span style={{ color: 'var(--text-muted)' }}>LTP</span>
              <span style={{ color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{flow.spread}</span>
            </div>

            {/* Bids (Buy Orders - Green) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {flow.bids.map((bid, i) => {
                const barW = (bid.total / maxTotal) * 100;
                return (
                  <div key={`bid-${i}-${bid.price}`} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 8px',
                    fontSize: 10, fontFamily: 'var(--font-mono)', position: 'relative', cursor: 'pointer',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%', width: `${barW}%`,
                      background: 'rgba(68,255,136,0.1)', zIndex: 0, transition: 'width 0.3s',
                    }} />
                    <span style={{ color: '#44ff88', position: 'relative', zIndex: 1, fontWeight: 600 }}>{bid.price.toFixed(priceDecimals)}</span>
                    <span style={{ color: 'var(--text-dim)', textAlign: 'center', position: 'relative', zIndex: 1 }}>{bid.size.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                    <span style={{ color: 'var(--text-muted)', textAlign: 'right', position: 'relative', zIndex: 1 }}>{bid.total.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* DATA PROVENANCE WATERMARK */}
        <div style={{
          position: 'absolute', bottom: 6, right: 8,
          fontSize: 8, fontFamily: 'var(--font-mono)',
          color: 'var(--text-ghost)', letterSpacing: 0.5,
          pointerEvents: 'none', zIndex: 10
        }}>
          DATA: FINNHUB WSS DIRECT
        </div>
      </PanelContent>
    </Panel>
  );
}
