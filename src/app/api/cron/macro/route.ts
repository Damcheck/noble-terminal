import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cronAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// FRED series IDs for key macro indicators
// FRED is free and doesn't require an API key for current values via the public RSS/data endpoints
const FRED_SERIES: { id: string; name: string; unit: string }[] = [
  { id: 'VIXCLS',   name: 'VIX',             unit: '' },
  { id: 'DGS10',    name: 'US 10Y Yield',     unit: '%' },
  { id: 'DGS2',     name: 'US 2Y Yield',      unit: '%' },
  { id: 'FEDFUNDS', name: 'Fed Funds Rate',   unit: '%' },
  { id: 'CPIAUCSL', name: 'CPI (YoY)',        unit: '%' },
  { id: 'UNRATE',   name: 'Unemployment',     unit: '%' },
  { id: 'DTWEXBGS', name: 'DXY (USD Index)',  unit: '' },
  { id: 'T10YIE',   name: '10Y Breakeven',    unit: '%' },
]

const FRED_API_KEY = process.env.FRED_API_KEY || ''

export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

    try {
    const results: any[] = []

    await Promise.allSettled(
      FRED_SERIES.map(async (series) => {
        try {
          // FRED API — free with key. Without key, use the observation endpoint in read-only mode.
          const url = FRED_API_KEY
            ? `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=2`
            : `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=abcdefghijklmnopqrstuvwxyz123456&file_type=json&sort_order=desc&limit=2`

          const res = await fetch(url, { next: { revalidate: 0 } })
          if (!res.ok) {
            // FRED requires API key — use Yahoo Finance for VIX at minimum
            if (series.id === 'VIXCLS') {
              const YahooFinance = (await import('yahoo-finance2')).default; const yahooFinance = new YahooFinance();
              // // yahooFinance.suppressNotices(['yahooSurvey'])
              const q: any = await yahooFinance.quote('^VIX' as any)
              if (q?.regularMarketPrice != null) {
                results.push({
                  series_id: series.id,
                  name: series.name,
                  value: q.regularMarketPrice,
                  previous_value: q.regularMarketPreviousClose ?? q.regularMarketPrice,
                  change_pct: q.regularMarketChangePercent ?? 0,
                  updated_at: new Date().toISOString(),
                })
              }
            }
            return
          }

          const data = await res.json()
          const obs = data.observations?.filter((o: any) => o.value !== '.') ?? []
          if (obs.length === 0) return

          const latest = parseFloat(obs[0].value)
          const previous = obs.length > 1 ? parseFloat(obs[1].value) : latest
          const changePct = previous !== 0 ? ((latest - previous) / Math.abs(previous)) * 100 : 0

          results.push({
            series_id: series.id,
            name: series.name,
            value: latest,
            previous_value: previous,
            change_pct: changePct,
            updated_at: new Date().toISOString(),
          })
        } catch (_) {}
      })
    )

    // Also fetch real-time yields from Yahoo Finance as a supplement
    try {
      const YahooFinance = (await import('yahoo-finance2')).default; const yahooFinance = new YahooFinance();
      // // yahooFinance.suppressNotices(['yahooSurvey'])
      const yieldSymbols = ['^TNX', '^FVX', '^TYX', '^IRX']
      const yieldNames: Record<string, string> = {
        '^TNX': 'US 10Y Yield', '^FVX': 'US 5Y Yield',
        '^TYX': 'US 30Y Yield', '^IRX': 'US 3M Yield'
      }
      const yieldSeries: Record<string, string> = {
        '^TNX': 'DGS10_RT', '^FVX': 'DGS5_RT',
        '^TYX': 'DGS30_RT', '^IRX': 'DGS3MO_RT'
      }
      const quotes: any = await yahooFinance.quote(yieldSymbols as any)
      const arr = Array.isArray(quotes) ? quotes : [quotes]
      arr.filter((q: any) => q?.regularMarketPrice != null).forEach((q: any) => {
        // Don't duplicate FRED data — these are real-time supplements
        const existing = results.find(r => r.name === yieldNames[q.symbol])
        if (!existing) {
          results.push({
            series_id: yieldSeries[q.symbol] || q.symbol,
            name: yieldNames[q.symbol] || q.symbol,
            value: q.regularMarketPrice ?? 0,
            previous_value: q.regularMarketPreviousClose ?? q.regularMarketPrice ?? 0,
            change_pct: q.regularMarketChangePercent ?? 0,
            updated_at: new Date().toISOString(),
          })
        }
      })
    } catch (_) {}

    if (results.length === 0) {
      return NextResponse.json({ success: true, updated: 0, note: 'No macro data fetched (FRED API key may be needed)' })
    }

    const { error } = await supabase
      .from('macro_indicators')
      .upsert(results, { onConflict: 'series_id' })

    if (error) {
      console.error('macro upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: results.length })
  } catch (err: any) {
    console.error('macro cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
