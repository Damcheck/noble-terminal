import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cronAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Yahoo Finance forex symbols
const FOREX_YAHOO = [
  { symbol: 'EURUSD=X', pair: 'EURUSD' },
  { symbol: 'GBPUSD=X', pair: 'GBPUSD' },
  { symbol: 'USDJPY=X', pair: 'USDJPY' },
  { symbol: 'USDCHF=X', pair: 'USDCHF' },
  { symbol: 'AUDUSD=X', pair: 'AUDUSD' },
  { symbol: 'GBPJPY=X', pair: 'GBPJPY' },
  { symbol: 'USDCAD=X', pair: 'USDCAD' },
  { symbol: 'USDNGN=X', pair: 'USDNGN' },
  { symbol: 'GC=F',     pair: 'XAUUSD' }, // Gold
  { symbol: 'SI=F',     pair: 'XAGUSD' }, // Silver
]

export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

    try {
    const yahooFinance = (await import('yahoo-finance2')).default
    // // yahooFinance.suppressNotices(['yahooSurvey'])

    const symbols = FOREX_YAHOO.map(f => f.symbol)
    const quotes: any = await yahooFinance.quote(symbols as any)
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes]

    const symbolToPair = Object.fromEntries(FOREX_YAHOO.map(f => [f.symbol, f.pair]))

    const upserts = quotesArray
      .filter((q: any) => q?.regularMarketPrice != null)
      .map((q: any) => ({
        symbol: symbolToPair[q.symbol] || q.symbol,
        asset_type: q.symbol === 'GC=F' ? 'commodity' : 'forex',
        price: q.regularMarketPrice ?? 0,
        bid: q.bid ?? q.regularMarketPrice ?? null,
        ask: q.ask ?? (q.regularMarketPrice ? q.regularMarketPrice * 1.0002 : null),
        change_pct: q.regularMarketChangePercent ?? 0,
        high: q.regularMarketDayHigh ?? null,
        low: q.regularMarketDayLow ?? null,
        close: q.regularMarketPreviousClose ?? null,
        extra: {
          name: symbolToPair[q.symbol] || q.symbol,
          currency: q.currency,
        },
        updated_at: new Date().toISOString(),
      }))

    const { error } = await supabase
      .from('market_prices')
      .upsert(upserts, { onConflict: 'symbol' })

    if (error) {
      console.error('forex upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: upserts.length })
  } catch (err: any) {
    console.error('forex cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
