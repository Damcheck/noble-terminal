'use client';

import { useRef, useCallback } from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { useMarketStore } from '@/store/marketStore';

export default function ChartPanel() {
  const { selectedSymbol } = useMarketStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert our internal symbols to TradingView format
  let tvSymbol = selectedSymbol;
  if (tvSymbol.includes('/')) {
    // Forex: EUR/USD -> OANDA:EURUSD, XAU/USD -> OANDA:XAUUSD
    tvSymbol = `OANDA:${tvSymbol.replace('/', '')}`;
  } else if (tvSymbol.includes('-')) {
    // Crypto: BTC-USD -> BINANCE:BTCUSDT
    const base = tvSymbol.split('-')[0];
    tvSymbol = `BINANCE:${base}USDT`;
  }
  // Stocks: AAPL -> just AAPL (TradingView resolves it)

  const goFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Fullscreen button */}
      <button
        onClick={goFullscreen}
        title="Fullscreen chart"
        style={{
          position: 'absolute',
          top: 6, right: 6,
          zIndex: 10,
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 13,
          cursor: 'pointer',
          padding: '2px 7px',
          lineHeight: 1.4,
        }}
      >
        ⛶
      </button>

      <div ref={containerRef} style={{ flex: 1, width: '100%' }}>
        <AdvancedRealTimeChart
          key={tvSymbol} // Force remount when symbol changes for instant reload
          symbol={tvSymbol}
          theme="dark"
          autosize
          interval="60"
          timezone="Etc/UTC"
          style="1"
          locale="en"
          toolbar_bg="#131722"
          enable_publishing={false}
          allow_symbol_change={true}
          hide_side_toolbar={false}
          save_image={false}
          studies={['RSI@tv-basicstudies', 'MACD@tv-basicstudies']}
          container_id={`tv_chart_${tvSymbol.replace(/[^a-z0-9]/gi, '_')}`}
        />
      </div>
    </div>
  );
}
