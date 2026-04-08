import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronAuth } from '@/lib/cronAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const COINS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple',
  'dogecoin', 'cardano', 'avalanche-2', 'polkadot', 'chainlink'
]

const SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BTC', ethereum: 'ETH', binancecoin: 'BNB', solana: 'SOL',
  ripple: 'XRP', dogecoin: 'DOGE', cardano: 'ADA', 'avalanche-2': 'AVAX',
  polkadot: 'DOT', chainlink: 'LINK',
}

export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

    try {
    const ids = COINS.join(',')

    // CoinGecko free tier — no API key required for /simple/price
    const [priceRes, globalRes] = await Promise.allSettled([
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`,
        { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }
      ),
      fetch('https://api.coingecko.com/api/v3/global', {
        headers: { 'Accept': 'application/json' }, next: { revalidate: 0 }
      })
    ])

    let upserts: any[] = []

    if (priceRes.status === 'fulfilled' && priceRes.value.ok) {
      const coins: any[] = await priceRes.value.json()

      upserts = coins.map((c: any) => ({
        symbol: `${SYMBOL_MAP[c.id] || c.symbol.toUpperCase()}-USD`,
        asset_type: 'crypto',
        price: c.current_price ?? 0,
        change_pct: c.price_change_percentage_24h ?? 0,
        market_cap: c.market_cap ?? null,
        volume: c.total_volume ?? null,
        high: c.high_24h ?? null,
        low: c.low_24h ?? null,
        extra: {
          name: c.name,
          rank: c.market_cap_rank,
          image: c.image,
          sparkline: c.sparkline_in_7d?.price ?? [],
          ath: c.ath,
          coingecko_id: c.id,
        },
        updated_at: new Date().toISOString(),
      }))
    } else {
      // CoinGecko rate-limited — use Yahoo Finance as fallback
      const YahooFinance = (await import('yahoo-finance2')).default; const yahooFinance = new YahooFinance();
      // // // yahooFinance.suppressNotices(['yahooSurvey']) // type error on vercel building
      const yahooSymbols = Object.values(SYMBOL_MAP).map(s => `${s}-USD`)
      const quotes: any = await yahooFinance.quote(yahooSymbols as any)
      const arr = Array.isArray(quotes) ? quotes : [quotes]
      upserts = arr.filter((q: any) => q?.regularMarketPrice != null).map((q: any) => ({
        symbol: q.symbol,
        asset_type: 'crypto',
        price: q.regularMarketPrice ?? 0,
        change_pct: q.regularMarketChangePercent ?? 0,
        market_cap: q.marketCap ?? null,
        volume: q.regularMarketVolume ?? null,
        high: q.regularMarketDayHigh ?? null,
        low: q.regularMarketDayLow ?? null,
        extra: { name: q.shortName || q.symbol },
        updated_at: new Date().toISOString(),
      }))
    }

    // Store global stats separately under special keys
    if (globalRes.status === 'fulfilled' && globalRes.value.ok) {
      const globalData: any = await globalRes.value.json()
      const d = globalData.data
      upserts.push(
        {
          symbol: '__CRYPTO_GLOBAL__',
          asset_type: 'crypto_meta',
          price: d.total_market_cap?.usd ?? 0,
          change_pct: d.market_cap_change_percentage_24h_usd ?? 0,
          extra: {
            btc_dominance: d.market_cap_percentage?.btc,
            eth_dominance: d.market_cap_percentage?.eth,
            total_volume_usd: d.total_volume?.usd,
            active_cryptos: d.active_cryptocurrencies,
          },
          updated_at: new Date().toISOString(),
        }
      )
    }

    if (upserts.length === 0) {
      return NextResponse.json({ success: true, updated: 0, note: 'No data fetched' })
    }

    const { error } = await supabase
      .from('market_prices')
      .upsert(upserts, { onConflict: 'symbol' })

    if (error) {
      console.error('crypto upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: upserts.length })
  } catch (err: any) {
    console.error('crypto cron error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
