'use client';

import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { useMarketStore } from '@/store/marketStore';

export default function ChartPanel() {
  const { selectedSymbol } = useMarketStore();

  // Convert our internal symbols (e.g. XAU/USD, AAPL, BTC-USD) 
  // into format TradingView expects.
  // Finnhub uses binance/oanda, TradingView prefers OANDA:XAUUSD or BINANCE:BTCUSDT
  let tvSymbol = selectedSymbol;
  
  if (tvSymbol.includes('/')) {
    // Forex: EUR/USD -> OANDA:EURUSD
    tvSymbol = `OANDA:${tvSymbol.replace('/', '')}`;
  } else if (tvSymbol.includes('-')) {
    // Crypto: BTC-USD -> BINANCE:BTCUSDT
    tvSymbol = `BINANCE:${tvSymbol.replace('-', '')}T`;
  } else {
    // Stocks: AAPL -> NASDAQ:AAPL or similar (TV is smart enough to find AAPL)
    tvSymbol = tvSymbol;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        <AdvancedRealTimeChart
          symbol={tvSymbol}
          theme="dark"
          autosize
          allow_symbol_change={true}
          toolbar_bg="transparent"
          enable_publishing={false}
          hide_side_toolbar={false}
          save_image={false}
          container_id="tradingview_chart"
        />
      </div>
    </div>
  );
}
