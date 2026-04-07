import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cronAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || ''

// Hardcoded high-impact events as baseline when API is unavailable
const STATIC_EVENTS = [
  { event_name: 'FOMC Meeting Minutes', country: 'US', impact: 'HIGH' },
  { event_name: 'US CPI (MoM)', country: 'US', impact: 'HIGH' },
  { event_name: 'US Non-Farm Payrolls', country: 'US', impact: 'HIGH' },
  { event_name: 'US GDP (QoQ)', country: 'US', impact: 'HIGH' },
  { event_name: 'ECB Interest Rate Decision', country: 'EU', impact: 'HIGH' },
  { event_name: 'BoE Interest Rate Decision', country: 'GB', impact: 'HIGH' },
  { event_name: 'US Jobless Claims', country: 'US', impact: 'MEDIUM' },
  { event_name: 'US PPI (MoM)', country: 'US', impact: 'MEDIUM' },
  { event_name: 'US Retail Sales (MoM)', country: 'US', impact: 'MEDIUM' },
  { event_name: 'US ISM Manufacturing PMI', country: 'US', impact: 'MEDIUM' },
]

export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

    try {
    let events: any[] = []

    // Try Finnhub economic calendar if API key is set
    if (FINNHUB_KEY) {
      try {
        const today = new Date()
        const from = today.toISOString().split('T')[0]
        const to = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const res = await fetch(
          `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_KEY}`,
          { next: { revalidate: 0 } }
        )

        if (res.ok) {
          const data = await res.json()
          events = (data.economicCalendar || []).slice(0, 30).map((e: any) => ({
            event_name: e.event || 'Unknown Event',
            country: e.country || 'US',
            impact: e.impact === 3 ? 'HIGH' : e.impact === 2 ? 'MEDIUM' : 'LOW',
            event_time: e.time ? new Date(e.time * 1000).toISOString() : null,
            previous: e.prev != null ? String(e.prev) : null,
            forecast: e.estimate != null ? String(e.estimate) : null,
            actual: e.actual != null ? String(e.actual) : null,
            updated_at: new Date().toISOString(),
          }))
        }
      } catch (_) {}
    }

    // Try Trading Economics free data as alternative
    if (events.length === 0) {
      try {
        const res = await fetch(
          'https://api.tradingeconomics.com/calendar?c=guest:guest',
          { next: { revalidate: 0 } }
        )
        if (res.ok) {
          const data = await res.json()
          events = (Array.isArray(data) ? data : []).slice(0, 20).map((e: any) => ({
            event_name: e.Event || e.Category || 'Unknown',
            country: e.Country || 'US',
            impact: e.Importance === 3 ? 'HIGH' : e.Importance === 2 ? 'MEDIUM' : 'LOW',
            event_time: e.Date ? new Date(e.Date).toISOString() : null,
            previous: e.Previous != null ? String(e.Previous) : null,
            forecast: e.Forecast != null ? String(e.Forecast) : null,
            actual: e.Actual != null ? String(e.Actual) : null,
            updated_at: new Date().toISOString(),
          }))
        }
      } catch (_) {}
    }

    // Final fallback: static events with approximate future times
    if (events.length === 0) {
      const now = new Date()
      events = STATIC_EVENTS.map((e, i) => ({
        ...e,
        event_time: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        previous: null,
        forecast: null,
        actual: null,
        updated_at: new Date().toISOString(),
      }))
    }

    const { error } = await supabase
      .from('economic_events')
      .upsert(events, { onConflict: 'event_name' })

    if (error) {
      console.error('calendar upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: events.length })
  } catch (err: any) {
    console.error('calendar cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
