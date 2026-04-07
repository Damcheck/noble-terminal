import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cronAuth'
import yahooFinance from 'yahoo-finance2'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const SYMBOLS = [
  // Stocks
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM', 'V', 'BRK-B',
  // Indices
  '^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX',
  // Commodities
  'GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'PL=F',
  // Sector ETFs
  'XLK', 'XLV', 'XLF', 'XLY', 'XLI', 'XLE', 'XLC', 'XLB', 'XLU', 'XLRE',
]

export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

    try {
    // Suppress yahoo-finance2 survey notice in logs
    // // yahooFinance.suppressNotices(['yahooSurvey'])

    const quotes: any = await yahooFinance.quote(SYMBOLS as any)
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes]

    const upserts = quotesArray
      .filter((q: any) => q && q.regularMarketPrice != null)
      .map((q: any) => ({
        symbol: q.symbol,
        asset_type:
          q.quoteType === 'EQUITY'
            ? 'stock'
            : q.quoteType === 'INDEX'
            ? 'index'
            : q.quoteType === 'ETF'
            ? 'etf'
            : 'commodity',
        price: q.regularMarketPrice ?? 0,
        open_price: q.regularMarketOpen ?? null,
        high: q.regularMarketDayHigh ?? null,
        low: q.regularMarketDayLow ?? null,
        close: q.regularMarketPreviousClose ?? null,
        volume: q.regularMarketVolume ?? null,
        change_pct: q.regularMarketChangePercent ?? 0,
        bid: q.bid ?? null,
        ask: q.ask ?? null,
        market_cap: q.marketCap ?? null,
        extra: {
          name: q.shortName || q.longName || q.symbol,
          exchange: q.exchange,
          currency: q.currency,
        },
        updated_at: new Date().toISOString(),
      }))

    const { error } = await supabase
      .from('market_prices')
      .upsert(upserts, { onConflict: 'symbol' })

    if (error) {
      console.error('market_prices upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: upserts.length })
  } catch (err: any) {
    console.error('prices cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
