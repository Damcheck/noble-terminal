import { create } from 'zustand';

// ── Symbol map: Finnhub symbol → our internal key ────────────────
export const FINNHUB_SYMBOLS: Record<string, string> = {
  // Stocks
  'AAPL':              'AAPL',
  'MSFT':              'MSFT',
  'NVDA':              'NVDA',
  'TSLA':              'TSLA',
  'META':              'META',
  'GOOGL':             'GOOGL',
  'AMZN':              'AMZN',
  'JPM':               'JPM',
  'V':                 'V',
  // Crypto (via Binance feed — free on Finnhub)
  'BINANCE:BTCUSDT':   'BTC-USD',
  'BINANCE:ETHUSDT':   'ETH-USD',
  'BINANCE:SOLUSDT':   'SOL-USD',
  'BINANCE:BNBUSDT':   'BNB-USD',
  'BINANCE:XRPUSDT':   'XRP-USD',
  // Forex (via OANDA)
  'OANDA:EUR_USD':     'EUR/USD',
  'OANDA:GBP_USD':     'GBP/USD',
  'OANDA:USD_JPY':     'USD/JPY',
  'OANDA:XAU_USD':     'XAU/USD',
};

// Reverse map: our internal key → Finnhub symbol
export const INTERNAL_TO_FINNHUB = Object.fromEntries(
  Object.entries(FINNHUB_SYMBOLS).map(([fh, internal]) => [internal, fh])
);

export interface FinnhubTick {
  symbol: string;    // our internal key e.g. "AAPL"
  price: number;
  volume: number;
  timestamp: number;
  prevPrice?: number; // last price before this tick (for flash direction)
}

interface FinnhubState {
  ticks: Record<string, FinnhubTick>;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  _ws: WebSocket | null;
}

export const useFinnhubStore = create<FinnhubState>((set, get) => ({
  ticks: {},
  isConnected: false,
  _ws: null,

  connect: () => {
    // Only runs in browser, not SSR
    if (typeof window === 'undefined') return;
    if (get().isConnected || get()._ws) return;

    const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
    if (!token) {
      console.warn('[Finnhub] No NEXT_PUBLIC_FINNHUB_TOKEN set — skipping WebSocket');
      return;
    }

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

    ws.onopen = () => {
      console.log('[Finnhub] WebSocket connected ✅');
      set({ isConnected: true });

      // Subscribe to all symbols
      Object.keys(FINNHUB_SYMBOLS).forEach(symbol => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type !== 'trade' || !Array.isArray(msg.data)) return;

        const updates: Record<string, FinnhubTick> = {};
        const currentTicks = get().ticks;

        for (const trade of msg.data) {
          const internalKey = FINNHUB_SYMBOLS[trade.s];
          if (!internalKey) continue;

          updates[internalKey] = {
            symbol: internalKey,
            price: trade.p,
            volume: trade.v,
            timestamp: trade.t,
            prevPrice: currentTicks[internalKey]?.price,
          };
        }

        if (Object.keys(updates).length > 0) {
          set(state => ({ ticks: { ...state.ticks, ...updates } }));
        }
      } catch (_) {}
    };

    ws.onerror = (e) => {
      console.warn('[Finnhub] WebSocket error', e);
    };

    ws.onclose = () => {
      console.log('[Finnhub] WebSocket closed — reconnecting in 5s...');
      set({ isConnected: false, _ws: null });
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (!get().isConnected) get().connect();
      }, 5000);
    };

    set({ _ws: ws });
  },

  disconnect: () => {
    const ws = get()._ws;
    if (ws) {
      Object.keys(FINNHUB_SYMBOLS).forEach(symbol => {
        try { ws.send(JSON.stringify({ type: 'unsubscribe', symbol })); } catch (_) {}
      });
      ws.close();
    }
    set({ isConnected: false, _ws: null });
  },
}));

// ── Helper hook: get the best available price for a symbol ────────
// Priority: Finnhub live tick > Supabase DB price
export function useLivePrice(
  internalSymbol: string,
  fallbackPrice?: number
): { price: number; flash: 'up' | 'down' | null; isLive: boolean } {
  const tick = useFinnhubStore(s => s.ticks[internalSymbol]);

  if (tick) {
    const flash = tick.prevPrice == null
      ? null
      : tick.price > tick.prevPrice
      ? 'up'
      : tick.price < tick.prevPrice
      ? 'down'
      : null;
    return { price: tick.price, flash, isLive: true };
  }

  return { price: fallbackPrice ?? 0, flash: null, isLive: false };
}
