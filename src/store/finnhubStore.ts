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
  // Forex & Metals (via OANDA - Finnhub free tier)
  'OANDA:EUR_USD':     'EURUSD',
  'OANDA:GBP_USD':     'GBPUSD',
  'OANDA:USD_JPY':     'USDJPY',
  'OANDA:GBP_JPY':     'GBPJPY',
  'OANDA:USD_CAD':     'USDCAD',
  'OANDA:AUD_USD':     'AUDUSD',
  'OANDA:NZD_USD':     'NZDUSD',
  'OANDA:EUR_GBP':     'EURGBP',
  'OANDA:USD_CHF':     'USDCHF',
  'OANDA:XAU_USD':     'XAUUSD',
  'OANDA:XAG_USD':     'XAGUSD',
  // Commodities
  'OANDA:WTICO_USD':   'USOIL', // WTI Crude / OIL30 equivalent
  'OANDA:BCO_USD':     'BRENT',
  'OANDA:XCU_USD':     'COPPER',
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
  rawStream: string[];
  diagnosticsEnabled: boolean;    // only capture raw stream when modal is open
  setDiagnosticsEnabled: (on: boolean) => void;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  _ws: WebSocket | null;
}

let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let _reconnectDelay = 3000; // start at 3s, grows with backoff
let _pingInterval: ReturnType<typeof setInterval> | null = null;

function scheduleReconnect(connectFn: () => void) {
  if (_reconnectTimer) clearTimeout(_reconnectTimer);
  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    _reconnectDelay = Math.min(_reconnectDelay * 1.5, 30000); // cap at 30s backoff
    connectFn();
  }, _reconnectDelay);
}

export const useFinnhubStore = create<FinnhubState>((set, get) => ({
  ticks: {},
  rawStream: [],
  diagnosticsEnabled: false,
  setDiagnosticsEnabled: (on: boolean) => set({ diagnosticsEnabled: on }),
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
    set({ _ws: ws });

    ws.onopen = () => {
      console.log('[Finnhub] WebSocket connected ✅');
      _reconnectDelay = 3000; // reset backoff on successful connect
      set({ isConnected: true });

      // Subscribe to all symbols
      Object.keys(FINNHUB_SYMBOLS).forEach(symbol => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });

      // Heartbeat: send a ping every 25s to prevent idle disconnection
      if (_pingInterval) clearInterval(_pingInterval);
      _pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const rawString = event.data;
        
        // Only store raw payload when diagnostics modal is open — avoids 30x/sec re-renders
        if (get().diagnosticsEnabled) {
          set(state => ({
            rawStream: [rawString, ...state.rawStream].slice(0, 20)
          }));
        }

        const msg = JSON.parse(rawString);
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
      console.log(`[Finnhub] Disconnected — reconnecting in ${_reconnectDelay / 1000}s...`);
      if (_pingInterval) { clearInterval(_pingInterval); _pingInterval = null; }
      set({ isConnected: false, _ws: null });
      scheduleReconnect(() => get().connect());
    };
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
