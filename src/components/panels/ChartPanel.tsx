'use client';

import { useRef, useCallback } from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { useMarketStore } from '@/store/marketStore';

export default function ChartPanel() {
  const { selectedSymbol } = useMarketStore();
  const containerRef = useRef<HTMLDivElement>(null);

  let tvSymbol = selectedSymbol;
  if (tvSymbol.includes('/')) {
    // Legacy support: EUR/USD -> OANDA:EURUSD
    tvSymbol = `OANDA:${tvSymbol.replace('/', '')}`;
  } else if (tvSymbol.includes('-')) {
    // Crypto: BTC-USD -> BINANCE:BTCUSDT
    const base = tvSymbol.split('-')[0];
    tvSymbol = `BINANCE:${base}USDT`;
  } else if (tvSymbol.length === 6 && ['EUR', 'GBP', 'AUD', 'NZD', 'USD', 'JPY', 'CHF', 'CAD', 'XAU', 'XAG', 'XCU'].some(prefix => tvSymbol.startsWith(prefix))) {
    // New exact match FX support: EURUSD -> OANDA:EURUSD
    tvSymbol = `OANDA:${tvSymbol}`;
  } else if (tvSymbol === 'USOIL' || tvSymbol === 'OIL30') {
    tvSymbol = 'TVC:USOIL'; // TradingView standard for crude oil
  }

  const goFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Fullscreen button - positioned bottom-right inside chart */}
      <button
        onClick={goFullscreen}
        title="Fullscreen chart"
        style={{
          position: 'absolute',
          bottom: 14,
          right: 10,
          zIndex: 10,
          background: 'rgba(0,0,0,0.65)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 14,
          cursor: 'pointer',
          padding: '3px 8px',
          lineHeight: 1.3,
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
