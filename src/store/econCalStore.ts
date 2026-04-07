import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

export interface EconomicEvent {
  id?: number
  event_name: string
  country: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  event_time: string | null
  previous: string | null
  forecast: string | null
  actual: string | null
  updated_at: string
}

interface EconCalState {
  events: EconomicEvent[]
  isRealtimeConnected: boolean
  initializeRealtime: () => void
  setInitialEvents: (events: EconomicEvent[]) => void
  updateEvent: (event: EconomicEvent) => void
}

export const useEconCalStore = create<EconCalState>((set, get) => ({
  events: [],
  isRealtimeConnected: false,

  setInitialEvents: (events) => {
    // Sort by event_time ascending (upcoming first)
    const sorted = [...events].sort((a, b) => {
      if (!a.event_time) return 1
      if (!b.event_time) return -1
      return new Date(a.event_time).getTime() - new Date(b.event_time).getTime()
    })
    set({ events: sorted })
  },

  updateEvent: (event) => {
    set(state => {
      const existing = state.events.findIndex(e => e.event_name === event.event_name)
      if (existing >= 0) {
        const updated = [...state.events]
        updated[existing] = event
        return { events: updated }
      }
      return { events: [...state.events, event] }
    })
  },

  initializeRealtime: () => {
    if (get().isRealtimeConnected) return;
    set({ isRealtimeConnected: true }); // Sync lock to prevent React StrictMode double-fire

    supabase
      .from('economic_events')
      .select('*')
      .order('event_time', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) get().setInitialEvents(data as EconomicEvent[])
      })

    supabase
      .channel('econ-calendar-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'economic_events' },
        (payload) => {
          if (payload.new) get().updateEvent(payload.new as EconomicEvent)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') set({ isRealtimeConnected: true })
      })
  }
}))
