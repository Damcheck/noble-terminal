# NOBLE TERMINAL — Complete Build Specification
## For Antigravity AI Implementation

---

## PROJECT OVERVIEW

Noble Terminal is a **public, free, real-time market intelligence dashboard** — essentially "WorldMonitor.app but for financial markets." It aggregates market data, news, analytics, and insights from dozens of free APIs into a single dense, dark, information-rich terminal interface. Think Bloomberg Terminal meets WorldMonitor.

**This is NOT a trading platform.** There is no order execution, no MT5 integration, no brokerage connection. Users come here to SEE data and analysis that regular TradingView doesn't show — cross-asset correlations, sector heatmaps, macro risk gauges, AI market regime analysis, VWAP calculations, order flow analysis, economic calendars with context, and African market coverage (NGX).

**Target users:** Traders in Nigeria and Africa who want institutional-grade market intelligence for free.

---

## TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Next.js 14+ (App Router)** | Vercel free tier hosting |
| Styling | **Tailwind CSS** | Custom config with WorldMonitor design tokens |
| State | **Zustand** | High-frequency updates without re-render issues |
| Grid Layout | **react-grid-layout** | Draggable, resizable panels like WorldMonitor |
| Charts | **TradingView Lightweight Charts** (npm: `lightweight-charts`) | Free, open-source candlestick/line charts |
| Embeds | **TradingView Widgets** | Free embeddable advanced charts where needed |
| Backend | **Supabase (free tier)** | PostgreSQL + Realtime + Auth + Edge Functions |
| Data Fetching | **Vercel Cron Jobs** + **Next.js API Routes** | Scheduled data pipeline |
| Virtualization | **@tanstack/react-virtual** | For scrolling large lists (news, trades) |
| Icons | **Lucide React** | Lightweight icon set |

### Free Data Sources (APIs)

| Source | What It Provides | Free Limits | API Docs |
|--------|-----------------|-------------|----------|
| **Yahoo Finance** (via `yahoo-finance2` npm) | Stocks, forex, indices, commodities, historical data | Unlimited (unofficial) | npm package |
| **CoinGecko** | Crypto prices, market caps, 24h volume, trending | 30 calls/min | coingecko.com/en/api |
| **Finnhub** | Real-time US stocks, forex, news, economic calendar, earnings, sentiment | 60 calls/min | finnhub.io/docs/api |
| **Alpha Vantage** | Forex, crypto, technical indicators, sector performance | 25 req/day (free key) | alphavantage.co/documentation |
| **Exchange Rate API** | Live FX rates for 160+ currencies including NGN | 1500 req/mo | exchangerate-api.com |
| **Fear & Greed Index** | CNN Fear & Greed, Crypto Fear & Greed | Unlimited (scrape) | alternative.me/crypto/fear-and-greed-index/api |
| **FRED (Federal Reserve)** | US Treasury yields, Fed Funds rate, CPI, GDP, unemployment | 120 req/min | fred.stlouisfed.org/docs/api |
| **NewsAPI** | News headlines from 80K+ sources | 100 req/day (dev) | newsapi.org |
| **GNews** | News aggregation | 100 req/day | gnews.io |
| **TradingView Widgets** | Embeddable charts, tickers, heatmaps, screeners | Unlimited (embed) | tradingview.com/widget |

---

## DESIGN SYSTEM — WorldMonitor Exact Tokens

The entire UI uses WorldMonitor.app's exact design system. This was extracted directly from their production CSS.

### CSS Variables (Dark Theme — Primary)

```css
:root {
  /* Backgrounds */
  --bg: #0a0a0a;
  --bg-secondary: #111;
  --surface: #141414;
  --surface-hover: #1e1e1e;
  --surface-active: #1a1a2e;

  /* Borders */
  --border: #2a2a2a;
  --border-strong: #444;
  --border-subtle: #1a1a1a;

  /* Text hierarchy (6 levels) */
  --text: #e8e8e8;
  --text-secondary: #ccc;
  --text-dim: #888;
  --text-muted: #666;
  --text-faint: #555;
  --text-ghost: #444;

  /* Accent */
  --accent: #fff;

  /* Overlays */
  --overlay-subtle: rgba(255,255,255,0.03);
  --overlay-light: rgba(255,255,255,0.05);
  --overlay-medium: rgba(255,255,255,0.1);
  --overlay-heavy: rgba(255,255,255,0.2);

  /* Panels */
  --panel-bg: #141414;
  --panel-border: #2a2a2a;

  /* Semantic colors */
  --semantic-critical: #ff4444;
  --semantic-high: #ff8800;
  --semantic-elevated: #ffaa00;
  --semantic-normal: #44aa44;
  --semantic-low: #3388ff;
  --semantic-info: #3b82f6;
  --semantic-positive: #44ff88;

  /* Named colors */
  --red: #ff4444;
  --green: #44ff88;
  --yellow: #ffaa00;

  /* Status */
  --status-live: #44ff88;
  --status-cached: #ffaa00;

  /* Typography */
  --font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', 'Fira Code', 'DejaVu Sans Mono', monospace;
}
```

### Tailwind Config Extension

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0a0a0a', secondary: '#111' },
        surface: { DEFAULT: '#141414', hover: '#1e1e1e', active: '#1a1a2e' },
        border: { DEFAULT: '#2a2a2a', strong: '#444', subtle: '#1a1a1a' },
        txt: { DEFAULT: '#e8e8e8', secondary: '#ccc', dim: '#888', muted: '#666', faint: '#555', ghost: '#444' },
        semantic: { critical: '#ff4444', high: '#ff8800', elevated: '#ffaa00', normal: '#44aa44', low: '#3388ff', info: '#3b82f6', positive: '#44ff88' },
        status: { live: '#44ff88', cached: '#ffaa00' },
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Fira Code', 'monospace'],
      },
    },
  },
}
```

### Component Patterns (from WorldMonitor CSS)

**Panel Grid:**
```css
.panels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-flow: row dense;
  grid-auto-rows: minmax(200px, 380px);
  gap: 4px;
  padding: 4px;
  align-content: start;
  align-items: stretch;
}
```

**Panel:**
```css
.panel {
  background: var(--surface);          /* #141414 */
  border: 1px solid var(--border);     /* #2a2a2a */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-height: 200px;
}
/* Span classes */
.panel.span-2 { grid-row: span 2; min-height: 400px; }
.panel.col-span-2 { grid-column: span 2; }
.panel.wide { grid-column: span 2; grid-row: span 2; }
```

**Panel Header:**
```css
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  background: var(--overlay-subtle);     /* rgba(255,255,255,0.03) */
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.panel-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text);
}
.panel-count {
  font-size: 10px;
  color: var(--text-dim);
  background: var(--border);
  padding: 2px 6px;
  border-radius: 2px;
}
```

**Live Badge:**
```css
.panel-data-badge.live {
  color: #44ff88;
  border-color: rgba(86,217,130,0.45);
  background: rgba(86,217,130,0.12);
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
}
```

**Panel Content:**
```css
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  min-width: 0;
}
.panel-content::-webkit-scrollbar { width: 4px; }
.panel-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
```

**News Item:**
```css
.item { padding: 8px 0; border-bottom: 1px solid var(--border); }
.item.alert { border-left: 2px solid var(--red); padding-left: 8px; margin-left: -8px; }
.item-source { font-size: 9px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }
.item-title { font-size: 12px; color: var(--text); line-height: 1.5; }
```

**Phase Badges (Breaking/Developing/Sustained):**
```css
.phase-badge.breaking { background: #f97316; color: var(--bg); animation: pulse-alert 1.5s infinite; }
.phase-badge.developing { background: #ffaa00; color: var(--bg); }
.phase-badge.sustained { background: #64748b; color: var(--bg); }
```

---

## PAGE STRUCTURE

```
app/
├── (marketing)/
│   ├── page.tsx                    # Landing page (SSR)
│   └── about/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── terminal/
│   └── page.tsx                    # "use client" — THE TERMINAL
├── layout.tsx
└── globals.css
```

The terminal page (`/terminal`) is the main product. It's a single client component that loads the full panel grid. The landing page at `/` explains what Noble Terminal is and links to `/terminal`.

---

## TERMINAL LAYOUT

### Header Bar (40px height, sticky top)
- **Left:** Logo ("NOBLE TERMINAL" in green #44ff88, uppercase, monospace), version badge
- **Center:** Scrolling ticker tape with major indices (auto-scroll animation)
- **Right:** Clock (live, updating every second), market status badges (NYSE OPEN / LSE CLOSED / etc.)

### Panel Grid (main content area)
- Uses `react-grid-layout` for user-customizable arrangement
- Default layout loads with all panels in a sensible arrangement
- Users can drag, resize, collapse, and close panels
- Layout saves to localStorage (or Supabase if logged in)

### Footer Bar (sticky bottom)
- Connection status with green dot
- Data freshness timestamp
- Links: API docs, GitHub, Discord

---

## PANELS — COMPLETE SPECIFICATION

### 1. MARKET HEAT MAP
- **Grid:** `col-span-2`
- **Data source:** Yahoo Finance (top 50 S&P 500 stocks by market cap)
- **Visualization:** Treemap-style rectangles where:
  - Size = market cap weight
  - Color = daily % change (green gradient for positive, red gradient for negative)
  - Intensity = magnitude of change (darker = bigger move)
- **Interaction:** Click a cell to see details, hover shows exact % and price
- **Update frequency:** Every 5 minutes via cron
- **Implementation:** Custom SVG/canvas treemap, NOT a library. Each cell:
  ```
  Background: rgba(68,255,136, 0.06 + abs(change)/5 * 0.25)  for positive
              rgba(255,68,68, 0.06 + abs(change)/5 * 0.25)    for negative
  Border: same color family at slightly higher opacity
  ```
- **Tabs:** S&P 500 | NASDAQ | Crypto | Forex (switch the dataset)

### 2. MAIN CHART
- **Grid:** `col-span-2`
- **Library:** TradingView Lightweight Charts (`lightweight-charts` npm package)
- **Features:**
  - Candlestick chart with volume bars below
  - Timeframe selector: 1M, 5M, 15M, 1H, 4H, 1D, 1W
  - Overlay indicators: MA20, MA50, MA200, Bollinger Bands
  - OHLCV display below chart
  - Symbol search to change instrument
- **Data source:** Yahoo Finance historical data
- **Update:** Real-time during market hours (poll every 60s), daily for historical

### 3. REAL VWAP ENGINE
- **Grid:** `span-1`
- **What it does:** Volume-Weighted Average Price calculation — the price level where most volume has traded
- **Calculation (runs client-side in JavaScript):**
  ```javascript
  // VWAP = Cumulative(Typical Price × Volume) / Cumulative(Volume)
  // Typical Price = (High + Low + Close) / 3

  function calculateVWAP(candles) {
    let cumTPV = 0;  // cumulative (typical price × volume)
    let cumVol = 0;  // cumulative volume
    
    return candles.map(candle => {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      cumTPV += typicalPrice * candle.volume;
      cumVol += candle.volume;
      
      const vwap = cumTPV / cumVol;
      
      // Standard deviation for bands
      // Variance = Cum((TP - VWAP)² × Volume) / CumVolume
      // Then bands at ±1σ, ±2σ
      
      return {
        time: candle.time,
        vwap: vwap,
        upperBand1: vwap + stdDev * 1,
        lowerBand1: vwap - stdDev * 1,
        upperBand2: vwap + stdDev * 2,
        lowerBand2: vwap - stdDev * 2,
      };
    });
  }
  ```
- **Display:** VWAP line overlaid on main chart + standalone VWAP panel showing:
  - Current VWAP price
  - Distance from current price to VWAP (% above/below)
  - Band levels (±1σ, ±2σ)
  - Session anchored vs multi-day toggle
- **Data source:** Intraday candle data from Yahoo Finance

### 4. ORDER BOOK / DEPTH OF MARKET
- **Grid:** `span-1`
- **What it shows:** Simulated order book depth based on real volume data
- **Data source:** Yahoo Finance quote data (bid/ask when available) + calculated levels from historical support/resistance and volume profile
- **Implementation:**
  ```javascript
  // Volume Profile approach:
  // Take last N candles, bin prices into levels
  // Volume at each level = how much traded there
  // Display as horizontal bars (bids left, asks right)
  
  function buildVolumeProfile(candles, bins = 20) {
    const prices = candles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const step = (max - min) / bins;
    
    const levels = Array.from({ length: bins }, (_, i) => ({
      price: min + i * step,
      volume: 0,
    }));
    
    candles.forEach(c => {
      const idx = Math.floor((c.close - min) / step);
      if (levels[idx]) levels[idx].volume += c.volume;
    });
    
    return levels;
  }
  ```
- **Visual:** 
  - Two columns: bids (green bars extending left) and asks (red bars extending right)
  - Bar width proportional to volume at that price level
  - Spread displayed in center
  - Cumulative depth shown as background gradient

### 5. REAL-TIME WATCHLIST
- **Grid:** `span-1`
- **Columns:** Symbol | Price | Change% | Volume | Sparkline
- **Data source:** Yahoo Finance real-time quotes
- **Features:**
  - Default watchlist: AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, JPM, V, BRK.B
  - User can add/remove symbols
  - Sparkline: last 20 data points as SVG polyline
  - Row highlight on value change (brief green/red flash)
  - Click row to load in main chart
- **Update:** Every 60 seconds during market hours

### 6. FOREX PANEL
- **Grid:** `span-1`
- **Columns:** Pair | Bid | Ask | Change% | Sparkline
- **Pairs:** EUR/USD, GBP/USD, USD/JPY, XAU/USD, USD/NGN, USD/CHF, AUD/USD, EUR/GBP
- **Data source:** Exchange Rate API + Yahoo Finance for XAU/USD
- **Special:** XAU/USD row highlighted in yellow (--yellow: #ffaa00) since gold is the primary instrument for African traders
- **Update:** Every 2 minutes

### 7. CRYPTO PANEL
- **Grid:** `span-1`
- **Data source:** CoinGecko `/simple/price` and `/coins/markets`
- **Rows:** BTC, ETH, BNB, SOL, XRP, DOGE, ADA, AVAX
- **Columns:** Symbol | Price | 24h Change | Market Cap | Sparkline (7d)
- **Features:** 
  - Fear & Greed Index gauge at top (from alternative.me API)
  - BTC dominance percentage
  - Total crypto market cap
- **Update:** Every 3 minutes

### 8. COMMODITIES PANEL
- **Grid:** `span-1`
- **Data source:** Yahoo Finance (GC=F, SI=F, CL=F, NG=F, HG=F, PL=F)
- **Rows:** Gold, Silver, Crude Oil, Natural Gas, Copper, Platinum
- **Columns:** Name | Price/Unit | Change% | Sparkline
- **Gold row highlighted in yellow**

### 9. MARKET NEWS FEED
- **Grid:** `col-span-2`
- **Data sources:** Finnhub news API + GNews API + NewsAPI
- **Features:**
  - Tabbed categories: ALL | MARKETS | FOREX | CRYPTO | EARNINGS | MACRO | AFRICA
  - Each item shows: timestamp, phase badge (ALERT/DEVELOPING/SUSTAINED), source, headline
  - ALERT items get red left border (`.item.alert` pattern)
  - Auto-categorize by keyword matching in headlines
  - Virtualized scroll for performance (react-virtual)
- **Phase logic:**
  ```javascript
  function classifyPhase(article) {
    const text = article.headline.toLowerCase();
    if (text.includes('breaking') || text.includes('just in') || text.includes('alert'))
      return 'ALERT';
    if (text.includes('developing') || text.includes('update') || text.includes('reports'))  
      return 'DEVELOPING';
    return 'SUSTAINED';
  }
  ```
- **Update:** Every 5 minutes, Supabase Realtime pushes new articles to all clients

### 10. ECONOMIC CALENDAR
- **Grid:** `span-1`
- **Data source:** Finnhub economic calendar API
- **Columns:** Time | Event | Impact (3-bar indicator) | Previous | Forecast | Actual
- **Features:**
  - Impact bars: 3 red bars = HIGH, 2 yellow = MEDIUM, 1 grey = LOW
  - Countdown timer for upcoming events
  - Today's events first, then this week
  - Highlight row when actual data differs significantly from forecast
- **Update:** Every 30 minutes

### 11. SECTOR PERFORMANCE
- **Grid:** `span-1`
- **Data source:** Alpha Vantage sector performance endpoint OR Yahoo Finance sector ETFs (XLK, XLV, XLF, XLY, XLI, XLE, XLC, XLB, XLU, XLRE)
- **Display:** Horizontal bar chart per sector
  - Bar extends right (green) for positive, left (red) for negative
  - Width proportional to magnitude
  - Sort by performance (best at top)
- **Update:** Every 15 minutes

### 12. RISK OVERVIEW / GAUGES
- **Grid:** `span-1`
- **Three SVG arc gauges:**
  - **Market Risk:** Based on VIX level (0-100 scale: VIX < 15 = low risk, 15-25 = moderate, > 25 = high)
  - **Volatility:** ATR-based calculation from S&P 500 data
  - **Sentiment:** Derived from Fear & Greed Index
- **Below gauges, a stat grid:**
  - VIX value + change
  - Put/Call ratio (if available from Finnhub)
  - Advance/Decline ratio
  - Market breadth
- **Gauge implementation:**
  ```jsx
  // SVG semicircle gauge
  <svg viewBox="0 0 120 70">
    {/* Background arc */}
    <path d="M 10 60 A 50 50 0 0 1 110 60" 
          fill="none" stroke="var(--border)" strokeWidth={7} strokeLinecap="round" />
    {/* Value arc */}
    <path d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={`${(value/100) * 157} 157`} />
    {/* Value text */}
    <text x="60" y="54" textAnchor="middle" fill={color} fontSize="17" fontWeight="700">{value}</text>
  </svg>
  ```

### 13. PORTFOLIO / WATCHLIST TRACKER
- **Grid:** `col-span-2`
- **Purpose:** Users can input their own holdings (saved to localStorage or Supabase)
- **Features:**
  - Table: Asset | Qty | Avg Price | Current Price | P&L % | P&L $
  - Allocation pie chart (recharts PieChart)
  - Total portfolio value
  - Day's total P&L
- **No real brokerage connection** — user manually enters positions

### 14. MACRO INDICATORS
- **Grid:** `span-1`
- **Data source:** FRED API (free, 120 req/min)
- **Stat boxes in 3×2 grid:**
  - VIX (VIXCLS)
  - DXY / Dollar Index (DTWEXBGS)
  - US 10Y Yield (DGS10)
  - Fed Funds Rate (FEDFUNDS)
  - CPI YoY (CPIAUCSL)
  - GDP QoQ (GDP)
- **Each box:** Label, value, change indicator
- **Update:** Daily (FRED data updates daily)

### 15. YIELD CURVE
- **Grid:** `span-1`
- **Data source:** FRED API (DGS1MO, DGS3MO, DGS6MO, DGS1, DGS2, DGS5, DGS10, DGS20, DGS30)
- **Chart:** Area chart with dots at each maturity point
- **Below chart:** 
  - 2s10s spread (DGS10 - DGS2) with inversion warning
  - Curve status label: NORMAL / FLAT / INVERTED
- **Library:** Recharts AreaChart
- **Update:** Daily

### 16. CORRELATION MATRIX
- **Grid:** `span-1`
- **Assets:** SPX, NASDAQ, BTC, GOLD, OIL, DXY (6×6 matrix)
- **Calculation (client-side):**
  ```javascript
  function pearsonCorrelation(x, y) {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;
    
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    return num / Math.sqrt(denX * denY);
  }
  ```
- **Data:** Last 30 days of daily returns for each asset (from Yahoo Finance historical)
- **Display:** Color-coded cells — green for positive correlation, red for negative, intensity = magnitude
- **Update:** Daily

### 17. AI MARKET INSIGHTS
- **Grid:** `span-1`
- **Implementation:** Claude API call via Next.js API route
- **Prompt sends:** Current prices, daily changes, VIX, sector performance, top news headlines
- **Claude returns:** 2-3 bullet insights (BULLISH/BEARISH/NEUTRAL with confidence %) + market regime label
- **Display:**
  - Each insight in a card with colored left border (green/red/yellow)
  - Market regime box at bottom: "Risk-On / Risk-Off" with VIX context
- **Update:** Every 30 minutes (to stay within API limits)
- **Fallback:** If no Claude API key, show static market regime based on VIX + Fear & Greed

### 18. SESSION STATS
- **Grid:** `span-1`
- **Purpose:** Show today's market session statistics
- **Stat boxes (2×4 grid):**
  - Market Open/Close countdown
  - S&P 500 day range (high-low spread)
  - NYSE advance/decline ratio
  - New 52-week highs vs lows
  - Most active by volume
  - Biggest gainer today
  - Biggest loser today
  - VIX day change

### 19. AFRICAN MARKETS (NGX)
- **Grid:** `span-1`
- **Data source:** Scrape/API from NGX (Nigerian Stock Exchange) or use available feeds
- **Display:**
  - NGX All-Share Index value + change
  - Top gainers / losers
  - Banking sector index
  - USD/NGN rate prominently displayed
- **This panel differentiates Noble Terminal from every other free terminal**

### 20. TRADINGVIEW EMBEDDED WIDGETS
- **Several panels can use free TradingView widgets:**
  - Mini chart widget for any symbol
  - Ticker tape widget for the header
  - Market overview widget
  - Technical analysis widget (shows buy/sell/neutral signals)
  - Screener widget
- **Implementation:** Load via TradingView's embed script
- **Docs:** https://www.tradingview.com/widget/

---

## SUPABASE SCHEMA

```sql
-- Market data cache (prices, written by cron jobs)
CREATE TABLE market_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,          -- 'stock', 'forex', 'crypto', 'commodity', 'index'
  price DECIMAL,
  open_price DECIMAL,
  high DECIMAL,
  low DECIMAL,
  close DECIMAL,
  volume BIGINT,
  change_pct DECIMAL,
  bid DECIMAL,
  ask DECIMAL,
  market_cap DECIMAL,
  extra JSONB,                       -- any additional fields
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_market_prices_symbol ON market_prices(symbol);

-- Historical candles (for charts, VWAP, correlation)
CREATE TABLE candles (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,           -- '1m', '5m', '1h', '1d'
  time TIMESTAMPTZ NOT NULL,
  open DECIMAL,
  high DECIMAL,
  low DECIMAL,
  close DECIMAL,
  volume BIGINT
);
CREATE INDEX idx_candles_symbol_time ON candles(symbol, timeframe, time DESC);

-- News articles
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  source TEXT,
  category TEXT,                     -- 'markets', 'forex', 'crypto', 'earnings', 'macro', 'africa'
  headline TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  image_url TEXT,
  phase TEXT DEFAULT 'SUSTAINED',    -- 'ALERT', 'DEVELOPING', 'SUSTAINED'
  sentiment DECIMAL,                 -- -1 to 1
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_news_category ON news(category, created_at DESC);

-- Economic calendar events
CREATE TABLE economic_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  country TEXT,
  impact TEXT,                       -- 'HIGH', 'MEDIUM', 'LOW'
  event_time TIMESTAMPTZ,
  previous TEXT,
  forecast TEXT,
  actual TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Macro indicators (FRED data)
CREATE TABLE macro_indicators (
  id BIGSERIAL PRIMARY KEY,
  series_id TEXT NOT NULL,           -- FRED series ID
  name TEXT NOT NULL,
  value DECIMAL,
  previous_value DECIMAL,
  change_pct DECIMAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_macro_series ON macro_indicators(series_id);

-- Yield curve data
CREATE TABLE yield_curve (
  id BIGSERIAL PRIMARY KEY,
  maturity TEXT NOT NULL,            -- '1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', '20Y', '30Y'
  rate DECIMAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_yield_maturity ON yield_curve(maturity);

-- User watchlists (optional, for logged-in users)
CREATE TABLE user_watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbols TEXT[] DEFAULT '{}',
  layout JSONB,                      -- react-grid-layout saved state
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User portfolio (manual entry)
CREATE TABLE user_portfolio (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  avg_price DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Supabase Realtime Subscriptions

```typescript
// In the terminal client, subscribe to real-time updates:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Subscribe to price updates
supabase
  .channel('market-prices')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'market_prices',
  }, (payload) => {
    // Update Zustand store with new price
    usePriceStore.getState().updatePrice(payload.new)
  })
  .subscribe()

// Subscribe to new news articles
supabase
  .channel('news-feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'news',
  }, (payload) => {
    useNewsStore.getState().addArticle(payload.new)
  })
  .subscribe()
```

---

## CRON JOB DATA PIPELINE

### Vercel Cron Configuration (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/prices",    "schedule": "*/5 * * * *"  },
    { "path": "/api/cron/crypto",    "schedule": "*/3 * * * *"  },
    { "path": "/api/cron/forex",     "schedule": "*/2 * * * *"  },
    { "path": "/api/cron/news",      "schedule": "*/5 * * * *"  },
    { "path": "/api/cron/calendar",  "schedule": "0 */1 * * *"  },
    { "path": "/api/cron/macro",     "schedule": "0 */6 * * *"  },
    { "path": "/api/cron/yields",    "schedule": "0 */6 * * *"  },
    { "path": "/api/cron/sectors",   "schedule": "*/15 * * * *" }
  ]
}
```

### Example Cron Route (`app/api/cron/prices/route.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'
import yahooFinance from 'yahoo-finance2'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!  // service key for server-side writes
)

const WATCHLIST = ['AAPL','MSFT','GOOGL','AMZN','NVDA','TSLA','META','JPM','V','BRK-B',
                   '^GSPC','^IXIC','^DJI','GC=F','SI=F','CL=F']

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const quotes = await yahooFinance.quote(WATCHLIST)
  
  const upserts = quotes.map(q => ({
    symbol: q.symbol,
    asset_type: q.quoteType === 'EQUITY' ? 'stock' : q.quoteType === 'INDEX' ? 'index' : 'commodity',
    price: q.regularMarketPrice,
    open_price: q.regularMarketOpen,
    high: q.regularMarketDayHigh,
    low: q.regularMarketDayLow,
    close: q.regularMarketPreviousClose,
    volume: q.regularMarketVolume,
    change_pct: q.regularMarketChangePercent,
    market_cap: q.marketCap,
    updated_at: new Date().toISOString(),
  }))

  await supabase
    .from('market_prices')
    .upsert(upserts, { onConflict: 'symbol' })

  return Response.json({ updated: upserts.length })
}
```

---

## ZUSTAND STORES

```typescript
// stores/priceStore.ts
interface PriceStore {
  prices: Record<string, MarketPrice>
  updatePrice: (price: MarketPrice) => void
  setAllPrices: (prices: MarketPrice[]) => void
}

export const usePriceStore = create<PriceStore>((set) => ({
  prices: {},
  updatePrice: (price) => set((state) => ({
    prices: { ...state.prices, [price.symbol]: price }
  })),
  setAllPrices: (prices) => set({
    prices: Object.fromEntries(prices.map(p => [p.symbol, p]))
  }),
}))

// stores/newsStore.ts
interface NewsStore {
  articles: NewsArticle[]
  filter: string
  setFilter: (f: string) => void
  addArticle: (a: NewsArticle) => void
  setArticles: (a: NewsArticle[]) => void
}

// stores/settingsStore.ts — panel layout, theme, user preferences
// stores/watchlistStore.ts — user's custom watchlist
```

---

## REACT-GRID-LAYOUT DEFAULT LAYOUT

```typescript
const defaultLayout = [
  { i: 'heatmap',     x: 0, y: 0,  w: 2, h: 2 },
  { i: 'chart',       x: 2, y: 0,  w: 2, h: 2 },
  { i: 'orderbook',   x: 0, y: 2,  w: 1, h: 2 },
  { i: 'news',        x: 1, y: 2,  w: 2, h: 2 },
  { i: 'watchlist',   x: 3, y: 2,  w: 1, h: 2 },
  { i: 'forex',       x: 0, y: 4,  w: 1, h: 2 },
  { i: 'crypto',      x: 1, y: 4,  w: 1, h: 2 },
  { i: 'commodities', x: 2, y: 4,  w: 1, h: 1 },
  { i: 'calendar',    x: 3, y: 4,  w: 1, h: 2 },
  { i: 'sectors',     x: 0, y: 6,  w: 1, h: 1 },
  { i: 'risk',        x: 1, y: 6,  w: 1, h: 2 },
  { i: 'portfolio',   x: 2, y: 6,  w: 2, h: 1 },
  { i: 'macro',       x: 0, y: 8,  w: 1, h: 1 },
  { i: 'yield',       x: 1, y: 8,  w: 1, h: 1 },
  { i: 'correlation', x: 2, y: 8,  w: 1, h: 1 },
  { i: 'ai',          x: 3, y: 8,  w: 1, h: 1 },
  { i: 'session',     x: 0, y: 10, w: 1, h: 1 },
  { i: 'africa',      x: 1, y: 10, w: 1, h: 1 },
]
```

---

## ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...            # Server-side only

# API Keys (all free tier)
FINNHUB_API_KEY=
ALPHA_VANTAGE_API_KEY=
NEWSAPI_KEY=
GNEWS_API_KEY=
FRED_API_KEY=
EXCHANGE_RATE_API_KEY=

# Optional
ANTHROPIC_API_KEY=                     # For AI insights panel
CRON_SECRET=                           # Verify cron requests

# Public
NEXT_PUBLIC_APP_URL=https://nobleterminal.com
```

---

## NPM DEPENDENCIES

```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "react-dom": "^18.3",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.4",
    "zustand": "^4.5",
    "lightweight-charts": "^4.1",
    "react-grid-layout": "^1.4",
    "@tanstack/react-virtual": "^3",
    "recharts": "^2.12",
    "yahoo-finance2": "^2.11",
    "lucide-react": "^0.383",
    "date-fns": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^3.4",
    "@types/react": "^18",
    "@types/react-grid-layout": "^1"
  }
}
```

---

## KEY IMPLEMENTATION NOTES FOR ANTIGRAVITY

1. **Every panel is a self-contained component** that receives data from a Zustand store. Panels don't fetch their own data — they subscribe to stores.

2. **The data pipeline is: Cron → Supabase → Realtime → Zustand → Panel.** Cron jobs write to Supabase. Supabase Realtime pushes changes to connected clients. The Zustand store updates. React re-renders the relevant panel.

3. **Initial load:** When the terminal page mounts, it does one bulk fetch from Supabase to hydrate all stores, then subscribes to Realtime for incremental updates.

4. **WorldMonitor's font is monospace everywhere.** The entire terminal uses the monospace font stack. No sans-serif.

5. **All numbers use `font-variant-numeric: tabular-nums`** for proper alignment in tables.

6. **Positive values are #44ff88, negative are #ff4444.** Every price change, every percentage, every P&L follows this rule.

7. **The terminal page must be `"use client"`** — it's fully client-rendered. No SSR for the terminal itself.

8. **Performance:** Use `React.memo` on panel components, `useMemo` for calculations, and `@tanstack/react-virtual` for any scrollable list with > 50 items.

9. **Mobile responsive:** The grid collapses to single column on mobile via react-grid-layout breakpoints.

10. **Panels can be collapsed, hidden, and rearranged.** This is the core UX difference from static dashboards. Users customize their workspace.
