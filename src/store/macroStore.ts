import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

export interface MacroIndicator {
  series_id: string
  name: string
  value: number
  previous_value: number
  change_pct: number
  updated_at: string
}

interface MacroState {
  indicators: Record<string, MacroIndicator>
  isRealtimeConnected: boolean
  initializeRealtime: () => void
  setInitialIndicators: (indicators: MacroIndicator[]) => void
  updateIndicator: (indicator: MacroIndicator) => void
}

export const useMacroStore = create<MacroState>((set, get) => ({
  indicators: {},
  isRealtimeConnected: false,

  setInitialIndicators: (indicators) => {
    const map: Record<string, MacroIndicator> = {}
    indicators.forEach(i => { map[i.series_id] = i })
    set({ indicators: map })
  },

  updateIndicator: (indicator) => {
    set(state => ({
      indicators: { ...state.indicators, [indicator.series_id]: indicator }
    }))
  },

  initializeRealtime: () => {
    if (get().isRealtimeConnected) return

    supabase
      .from('macro_indicators')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) get().setInitialIndicators(data as MacroIndicator[])
      })

    supabase
      .channel('macro-indicators-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'macro_indicators' },
        (payload) => {
          if (payload.new) get().updateIndicator(payload.new as MacroIndicator)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') set({ isRealtimeConnected: true })
      })
  }
}))
