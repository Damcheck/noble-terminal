'use client';

import { useState, useEffect, useMemo } from 'react';
import { TICKER_ITEMS, MARKET_STATUS } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

// Symbols in the ticker tape mapped to their store keys
const TICKER_SYMBOL_MAP: Record<string, string> = {
  'S&P 500':  'SPY',
  'NASDAQ':   'QQQ',
  'DOW':      'DIA',
  'XAU/USD':  'GC=F',
  'BTC/USD':  'BTC-USD',
  'EUR/USD':  'EURUSD=X',
  'GBP/USD':  'GBPUSD=X',
  'VIX':      '^VIX',
  'USD/NGN':  'USDNGN=X',
  'WTI OIL':  'CL=F',
  'NVDA':     'NVDA',
  'TSLA':     'TSLA',
  'AAPL':     'AAPL',
  'ETH/USD':  'ETH-USD',
};

export default function TerminalHeader() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const { prices } = useMarketStore();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toUTCString().split(' ')[4] + ' UTC');
      setDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Merge live prices into ticker items where available
  const tapeItems = useMemo(() => {
    return TICKER_ITEMS.map(item => {
      const storeKey = TICKER_SYMBOL_MAP[item.symbol];
      const live = storeKey ? prices[storeKey] : null;
      if (live && live.price) {
        const up = live.change_pct >= 0;
        const priceStr = live.price >= 1000
          ? live.price.toLocaleString('en-US', { maximumFractionDigits: 2 })
          : live.price >= 1
          ? live.price.toFixed(2)
          : live.price.toFixed(4);
        return {
          symbol: item.symbol,
          price: priceStr,
          change: `${up ? '+' : ''}${live.change_pct.toFixed(2)}%`,
          up,
        };
      }
      return item;
    });
  }, [prices]);

  // Duplicate for seamless scroll
  const scrollItems = [...tapeItems, ...tapeItems];

  return (
    <header
      className="flex-none flex flex-col"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Top Row — Logo / Market Status / Clock */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: 36, borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.18em',
              color: '#44ff88',
            }}
          >
            NOBLE
          </span>
          <span
            style={{
              fontSize: 9, fontWeight: 600, color: 'var(--text-dim)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '2px 6px', borderRadius: 2, letterSpacing: 1,
            }}
          >
            TERMINAL v1.0
          </span>
        </div>

        {/* Market Status Badges */}
        <div className="flex items-center gap-2">
          {MARKET_STATUS.map(m => (
            <div key={m.name} className="flex items-center gap-1">
              <div
                style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: m.color, flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 0.5 }}>{m.name}</span>
              <span style={{ fontSize: 9, color: m.color, fontWeight: 700 }}>{m.status}</span>
            </div>
          ))}
        </div>

        {/* Clock */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5 }}>{date}</span>
          <span
            style={{
              fontSize: 12, fontFamily: 'var(--font-mono)',
              color: 'var(--text)', letterSpacing: 1,
              minWidth: 90, textAlign: 'right',
            }}
          >
            {time}
          </span>
        </div>
      </div>

      {/* Ticker Tape Row */}
      <div
        className="overflow-hidden flex items-center flex-shrink-0"
        style={{ height: 28, background: 'var(--bg)' }}
      >
        <div
          className="flex items-center gap-0 whitespace-nowrap"
          style={{
            animation: 'tickerScroll 45s linear infinite',
            willChange: 'transform',
          }}
        >
          {scrollItems.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-4"
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                borderRight: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ color: 'var(--text-dim)', letterSpacing: 0.2 }}>{item.symbol}</span>
              <span style={{ color: 'var(--text)' }}>{item.price}</span>
              <span style={{ color: item.up ? '#44ff88' : '#ff4444', fontWeight: 600 }}>
                {item.change}
              </span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
