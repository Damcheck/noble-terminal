import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cronAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Sector ETF symbols (all on Yahoo Finance, no API key needed)
const SECTOR_ETFS = [
  { symbol: 'XLK',  name: 'Technology',         sector: 'technology' },
  { symbol: 'XLV',  name: 'Healthcare',          sector: 'healthcare' },
  { symbol: 'XLF',  name: 'Financials',          sector: 'financials' },
  { symbol: 'XLY',  name: 'Consumer Discret.',   sector: 'consumer_discretionary' },
  { symbol: 'XLI',  name: 'Industrials',         sector: 'industrials' },
  { symbol: 'XLE',  name: 'Energy',              sector: 'energy' },
  { symbol: 'XLC',  name: 'Comm. Services',      sector: 'communication' },
  { symbol: 'XLB',  name: 'Materials',           sector: 'materials' },
  { symbol: 'XLU',  name: 'Utilities',           sector: 'utilities' },
  { symbol: 'XLRE', name: 'Real Estate',         sector: 'real_estate' },
  { symbol: 'XLP',  name: 'Consumer Staples',    sector: 'consumer_staples' },
]

export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

    try {
    const YahooFinance = (await import('yahoo-finance2')).default; const yahooFinance = new YahooFinance();
    // // yahooFinance.suppressNotices(['yahooSurvey'])

    const symbols = SECTOR_ETFS.map(e => e.symbol)
    const quotes: any = await yahooFinance.quote(symbols as any)
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes]

    const symbolMap = Object.fromEntries(SECTOR_ETFS.map(e => [e.symbol, e]))

    const upserts = quotesArray
      .filter((q: any) => q?.regularMarketPrice != null)
      .map((q: any) => {
        const meta = symbolMap[q.symbol]
        return {
          symbol: q.symbol,
          asset_type: 'etf',
          price: q.regularMarketPrice ?? 0,
          open_price: q.regularMarketOpen ?? null,
          high: q.regularMarketDayHigh ?? null,
          low: q.regularMarketDayLow ?? null,
          close: q.regularMarketPreviousClose ?? null,
          volume: q.regularMarketVolume ?? null,
          change_pct: q.regularMarketChangePercent ?? 0,
          market_cap: q.marketCap ?? null,
          extra: {
            name: meta?.name || q.shortName || q.symbol,
            sector: meta?.sector || 'unknown',
          },
          updated_at: new Date().toISOString(),
        }
      })

    const { error } = await supabase
      .from('market_prices')
      .upsert(upserts, { onConflict: 'symbol' })

    if (error) {
      console.error('sectors upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: upserts.length })
  } catch (err: any) {
    console.error('sectors cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
