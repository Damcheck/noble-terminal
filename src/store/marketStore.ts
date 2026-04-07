import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

// Type definition based on Supabase market_prices table
export interface MarketPrice {
  symbol: string;
  asset_type: string;
  price: number;
  open_price: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change_pct: number;
  market_cap: number;
  bid?: number;
  ask?: number;
  extra?: Record<string, unknown>;
  updated_at: string;
}

interface MarketState {
  prices: Record<string, MarketPrice>;
  isRealtimeConnected: boolean;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  initializeRealtime: () => void;
  setInitialPrices: (prices: MarketPrice[]) => void;
  updatePrice: (priceData: MarketPrice) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  isRealtimeConnected: false,
  selectedSymbol: 'XAUUSD', // Default to Gold

  setSelectedSymbol: (symbol: string) => {
    set({ selectedSymbol: symbol });
  },

  setInitialPrices: (markets: MarketPrice[]) => {
    const newPrices = { ...get().prices };
    markets.forEach(m => {
      newPrices[m.symbol] = m;
    });
    set({ prices: newPrices });
  },

  updatePrice: (priceData: MarketPrice) => {
    set(state => ({
      prices: {
        ...state.prices,
        [priceData.symbol]: priceData
      }
    }));
  },

  initializeRealtime: () => {
    if (get().isRealtimeConnected) return;
    set({ isRealtimeConnected: true }); // Sync lock to prevent React StrictMode double-fire

    // Fetch initial baseline data from Postgres natively first
    supabase
      .from('market_prices')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          get().setInitialPrices(data as MarketPrice[]);
        }
      });

    // Subscribe to real-time 'market_prices' postgres updates
    const channel = supabase.channel('market-prices-channel')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'market_prices'
        },
        (payload) => {
          // If a price updates in Supabase from cron jobs, inject to Zustand instantly
          if (payload.new) {
            get().updatePrice(payload.new as MarketPrice);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ isRealtimeConnected: true });
        }
      });
  }
}));
