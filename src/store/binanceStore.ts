import { create } from 'zustand';

export interface LiquidationEvent {
  symbol: string;
  side: 'BUY' | 'SELL'; // SELL means long liquidation, BUY means short liquidation
  price: number;
  qty: number;
  time: number;
  notional: number;
}

interface BinanceState {
  isConnected: boolean;
  liquidations: LiquidationEvent[];
  connect: () => void;
  disconnect: () => void;
}

let _ws: WebSocket | null = null;
let _reconnectDelay = 2000;

export const useBinanceStore = create<BinanceState>((set, get) => ({
  isConnected: false,
  liquidations: [],

  connect: () => {
    if (_ws && (_ws.readyState === WebSocket.CONNECTING || _ws.readyState === WebSocket.OPEN)) return;

    try {
      const url = 'wss://fstream.binance.com/ws/!forceOrder@arr';
      const ws = new WebSocket(url);
      _ws = ws;

      ws.onopen = () => {
        console.log('[Binance WS] Connected to Liquidations Feed');
        set({ isConnected: true });
        _reconnectDelay = 2000;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Binance futures force order format
          if (msg.e === 'forceOrder' && msg.o) {
            const data = msg.o;
            
            const eventObj: LiquidationEvent = {
              symbol: data.s,
              side: data.S,
              price: parseFloat(data.p),
              qty: parseFloat(data.q),
              time: data.T,
              notional: parseFloat(data.p) * parseFloat(data.q)
            };

            // Only care about decently sized liquidations (>$5k) to keep the tape clean
            if (eventObj.notional > 5000) {
              set(state => ({
                liquidations: [eventObj, ...state.liquidations].slice(0, 50)
              }));
            }
          }
        } catch (_) {}
      };

      ws.onclose = () => {
        console.log(`[Binance WS] Disconnected. Reconnecting in ${_reconnectDelay/1000}s`);
        set({ isConnected: false });
        _ws = null;
        setTimeout(() => {
          get().connect();
        }, _reconnectDelay);
        _reconnectDelay = Math.min(_reconnectDelay * 1.5, 30000);
      };

      ws.onerror = () => {
        // Will trigger onclose immediately
      };

    } catch (err) {
      console.error('[Binance WS] Error connecting', err);
    }
  },

  disconnect: () => {
    if (_ws) {
      _ws.close();
      _ws = null;
    }
  }
}));
