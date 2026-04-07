import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

export interface YieldPoint {
  maturity: string
  rate: number
  updated_at: string
}

interface YieldState {
  yields: Record<string, YieldPoint>
  isRealtimeConnected: boolean
  initializeRealtime: () => void
  setInitialYields: (yields: YieldPoint[]) => void
  updateYield: (point: YieldPoint) => void
}

export const useYieldStore = create<YieldState>((set, get) => ({
  yields: {},
  isRealtimeConnected: false,

  setInitialYields: (yields) => {
    const map: Record<string, YieldPoint> = {}
    yields.forEach(y => { map[y.maturity] = y })
    set({ yields: map })
  },

  updateYield: (point) => {
    set(state => ({
      yields: { ...state.yields, [point.maturity]: point }
    }))
  },

  initializeRealtime: () => {
    if (get().isRealtimeConnected) return

    supabase
      .from('yield_curve')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) get().setInitialYields(data as YieldPoint[])
      })

    supabase
      .channel('yield-curve-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yield_curve' },
        (payload) => {
          if (payload.new) get().updateYield(payload.new as YieldPoint)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') set({ isRealtimeConnected: true })
      })
  }
}))
