import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cronAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Treasury yield symbols from Yahoo Finance
const YIELD_SYMBOLS = [
  { symbol: '^IRX',  maturity: '3M',  label: '3M'  },
  { symbol: '^FVX',  maturity: '5Y',  label: '5Y'  },
  { symbol: '^TNX',  maturity: '10Y', label: '10Y' },
  { symbol: '^TYX',  maturity: '30Y', label: '30Y' },
]

// FRED for the short-end maturities Yahoo doesn't cover cleanly
const FRED_YIELDS: { maturity: string; seriesId: string }[] = [
  { maturity: '1M',  seriesId: 'DGS1MO' },
  { maturity: '3M',  seriesId: 'DGS3MO' },
  { maturity: '6M',  seriesId: 'DGS6MO' },
  { maturity: '1Y',  seriesId: 'DGS1' },
  { maturity: '2Y',  seriesId: 'DGS2' },
  { maturity: '5Y',  seriesId: 'DGS5' },
  { maturity: '10Y', seriesId: 'DGS10' },
  { maturity: '20Y', seriesId: 'DGS20' },
  { maturity: '30Y', seriesId: 'DGS30' },
]

const FRED_API_KEY = process.env.FRED_API_KEY || ''

export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

    try {
    const yieldData: Record<string, number> = {}

    // 1. Try Yahoo Finance for live real-time yields (4 key points)
    try {
      const YahooFinance = (await import('yahoo-finance2')).default; const yahooFinance = new YahooFinance();
      // // yahooFinance.suppressNotices(['yahooSurvey'])
      const quotes: any = await yahooFinance.quote(YIELD_SYMBOLS.map(y => y.symbol as any))
      const arr = Array.isArray(quotes) ? quotes : [quotes]
      arr.forEach((q: any) => {
        const match = YIELD_SYMBOLS.find(y => y.symbol === q?.symbol)
        if (match && q?.regularMarketPrice != null) {
          yieldData[match.maturity] = q.regularMarketPrice
        }
      })
    } catch (_) {}

    // 2. Try FRED for all maturities (requires API key but falls back gracefully)
    if (FRED_API_KEY) {
      await Promise.allSettled(
        FRED_YIELDS.map(async ({ maturity, seriesId }) => {
          if (yieldData[maturity]) return // Already have Yahoo data
          try {
            const res = await fetch(
              `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`,
              { next: { revalidate: 0 } }
            )
            if (!res.ok) return
            const data = await res.json()
            const obs = data.observations?.filter((o: any) => o.value !== '.') ?? []
            if (obs.length > 0) yieldData[maturity] = parseFloat(obs[0].value)
          } catch (_) {}
        })
      )
    }

    // 3. Build upsert rows — interpolate missing points using available data
    const MATURITIES = ['1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', '20Y', '30Y']
    const available = MATURITIES.filter(m => yieldData[m] !== undefined)

    if (available.length < 2) {
      return NextResponse.json({ success: true, updated: 0, note: 'Not enough yield data available' })
    }

    // Simple linear interpolation for missing points
    const allPoints: Record<string, number> = { ...yieldData }
    const maturityMonths: Record<string, number> = {
      '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24,
      '5Y': 60, '10Y': 120, '20Y': 240, '30Y': 360,
    }

    MATURITIES.forEach(m => {
      if (allPoints[m] !== undefined) return
      const months = maturityMonths[m]
      const below = available.filter(a => maturityMonths[a] < months).slice(-1)[0]
      const above = available.filter(a => maturityMonths[a] > months)[0]
      if (below && above) {
        const t = (months - maturityMonths[below]) / (maturityMonths[above] - maturityMonths[below])
        allPoints[m] = allPoints[below] + t * (allPoints[above] - allPoints[below])
      }
    })

    const upserts = MATURITIES
      .filter(m => allPoints[m] !== undefined)
      .map(m => ({
        maturity: m,
        rate: allPoints[m],
        updated_at: new Date().toISOString(),
      }))

    const { error } = await supabase
      .from('yield_curve')
      .upsert(upserts, { onConflict: 'maturity' })

    if (error) {
      console.error('yields upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also store spread in macro_indicators
    const spread = (allPoints['10Y'] ?? 0) - (allPoints['2Y'] ?? 0)
    await supabase.from('macro_indicators').upsert([{
      series_id: '2S10S_SPREAD',
      name: '2s10s Spread',
      value: spread,
      previous_value: spread,
      change_pct: 0,
      updated_at: new Date().toISOString(),
    }], { onConflict: 'series_id' })

    return NextResponse.json({ success: true, updated: upserts.length, spread })
  } catch (err: any) {
    console.error('yields cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
