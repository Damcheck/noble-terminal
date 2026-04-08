'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { TICKER_ITEMS, MARKET_STATUS } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';
import { useNewsStore } from '@/store/newsStore';
import { useFinnhubStore } from '@/store/finnhubStore';
import { useThemeStore } from '@/store/themeStore';

// Maps ticker tape labels to Supabase store keys and Finnhub tick keys
const TICKER_SYMBOL_MAP: Record<string, { storeKey: string; finnhubKey: string }> = {
  'S&P 500':  { storeKey: 'SPY',       finnhubKey: 'SPY' },
  'NASDAQ':   { storeKey: 'QQQ',       finnhubKey: 'QQQ' },
  'DOW':      { storeKey: 'DIA',       finnhubKey: 'DIA' },
  'XAU/USD':  { storeKey: 'GC=F',      finnhubKey: 'GC=F' },
  'BTC/USD':  { storeKey: 'BTC-USD',   finnhubKey: 'BTC-USD' },
  'EUR/USD':  { storeKey: 'EURUSD=X',  finnhubKey: 'EUR/USD' },
  'GBP/USD':  { storeKey: 'GBPUSD=X',  finnhubKey: 'GBP/USD' },
  'VIX':      { storeKey: '^VIX',      finnhubKey: '^VIX' },
  'USD/NGN':  { storeKey: 'USDNGN=X',  finnhubKey: 'USD/NGN' },
  'WTI OIL':  { storeKey: 'CL=F',      finnhubKey: 'CL=F' },
  'NVDA':     { storeKey: 'NVDA',      finnhubKey: 'NVDA' },
  'TSLA':     { storeKey: 'TSLA',      finnhubKey: 'TSLA' },
  'AAPL':     { storeKey: 'AAPL',      finnhubKey: 'AAPL' },
  'ETH/USD':  { storeKey: 'ETH-USD',   finnhubKey: 'ETH-USD' },
};

export default function TerminalHeader() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [squawkOn, setSquawkOn] = useState(false);
  const lastSpokenRef = useRef<string>('');
  const { prices, isRealtimeConnected } = useMarketStore();
  const { ticks, isConnected: isFinnhubConnected } = useFinnhubStore(); // real-time ticks — higher priority
  const { articles } = useNewsStore();
  const { theme, toggleTheme } = useThemeStore();

  const lastSpokenTimeRef = useRef<number>(0);

  // Squawk: speak new headlines as they arrive, with rate-limit + cancel-previous
  useEffect(() => {
    if (!squawkOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const latest = articles[0];
    if (!latest || latest.headline === lastSpokenRef.current) return;
    // Enforce 10s minimum between announcements
    if (Date.now() - lastSpokenTimeRef.current < 10_000) return;
    lastSpokenRef.current = latest.headline;
    lastSpokenTimeRef.current = Date.now();
    // Cancel any in-flight utterance before starting a new one
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(latest.headline);
    utter.rate = 1.1;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    window.speechSynthesis.speak(utter);
  }, [articles, squawkOn]);

  // One-time theme init on client mount (NOT inside the clock interval!)
  useEffect(() => {
    useThemeStore.getState().initializeTheme();
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 19)); // HH:MM:SS
      setDate(now.toUTCString().substring(0, 11).toUpperCase()); // WED, 05 APR
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Merge live prices: Finnhub tick (real-time) > Supabase price (5min) > mock
  const tapeItems = useMemo(() => {
    return TICKER_ITEMS.map(item => {
      const map = TICKER_SYMBOL_MAP[item.symbol];
      if (!map) return item;
      // 1. Finnhub real-time tick (sub-second)
      const tick = ticks[map.finnhubKey];
      if (tick?.price) {
        const prevPrice = tick.prevPrice ?? tick.price;
        const pctChange = prevPrice > 0 ? ((tick.price - prevPrice) / prevPrice) * 100 : 0;
        const up = pctChange >= 0;
        const priceStr = tick.price >= 1000
          ? tick.price.toLocaleString('en-US', { maximumFractionDigits: 2 })
          : tick.price >= 1
          ? tick.price.toFixed(2)
          : tick.price.toFixed(4);
        return { symbol: item.symbol, price: priceStr, change: `${up ? '+' : ''}${pctChange.toFixed(2)}%`, up };
      }
      // 2. Supabase price (refreshed every 5min)
      const live = prices[map.storeKey];
      if (live?.price) {
        const up = live.change_pct >= 0;
        const priceStr = live.price >= 1000
          ? live.price.toLocaleString('en-US', { maximumFractionDigits: 2 })
          : live.price >= 1
          ? live.price.toFixed(2)
          : live.price.toFixed(4);
        return { symbol: item.symbol, price: priceStr, change: `${up ? '+' : ''}${live.change_pct.toFixed(2)}%`, up };
      }
      // 3. Force "---" if absolutely no real data exists to avoid fake prices
      return { 
        symbol: item.symbol, 
        price: '---', 
        change: '---', 
        up: true 
      };
    });
  }, [prices, ticks]);

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
        {/* Logo & System Health */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
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

          {/* System Health Indicator */}
          <div
            className="flex items-center gap-1.5"
            style={{
              background: 'var(--overlay-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 6px',
              borderRadius: 3,
            }}
          >
            <div
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isFinnhubConnected && isRealtimeConnected ? '#44ff88' : isFinnhubConnected || isRealtimeConnected ? '#ffaa00' : '#ff4444',
                boxShadow: `0 0 6px ${isFinnhubConnected && isRealtimeConnected ? '#44ff88' : isFinnhubConnected || isRealtimeConnected ? '#ffaa00' : '#ff4444'}`,
                animation: (isFinnhubConnected || isRealtimeConnected) ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
              }}
            />
            <span style={{ fontSize: 8, color: 'var(--text-ghost)', fontWeight: 600, letterSpacing: 0.5 }}>
              SYS{(isFinnhubConnected && isRealtimeConnected) ? ' OK' : (isFinnhubConnected || isRealtimeConnected) ? ' WARN' : ' ERR'}
            </span>
          </div>
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

        {/* Clock + Squawk */}
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
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: 3, cursor: 'pointer',
              border: '1px solid var(--border)',
              background: 'var(--overlay-subtle)',
              color: 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Squawk Box Toggle */}
          <button
            onClick={() => {
              if (squawkOn) window.speechSynthesis?.cancel();
              setSquawkOn(v => !v);
            }}
            title={squawkOn ? 'Squawk ON — click to mute' : 'Squawk OFF — click to enable audio headlines'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 3, cursor: 'pointer',
              fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
              border: squawkOn ? '1px solid rgba(68,255,136,0.5)' : '1px solid var(--border)',
              background: squawkOn ? 'rgba(68,255,136,0.1)' : 'var(--overlay-subtle)',
              color: squawkOn ? '#44ff88' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 12 }}>{squawkOn ? '🔊' : '🔇'}</span>
            SQUAWK
          </button>
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
