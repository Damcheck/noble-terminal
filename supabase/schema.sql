-- Noble Terminal Supabase Base Schema 

-- 1. Market data cache (prices, written by cron jobs)
CREATE TABLE IF NOT EXISTS market_prices (
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_prices_symbol ON market_prices(symbol);

-- 2. Historical candles (for charts, VWAP, correlation)
CREATE TABLE IF NOT EXISTS candles (
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
CREATE INDEX IF NOT EXISTS idx_candles_symbol_time ON candles(symbol, timeframe, time DESC);

-- 3. News articles
CREATE TABLE IF NOT EXISTS news (
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
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category, created_at DESC);

-- 4. Economic calendar events
CREATE TABLE IF NOT EXISTS economic_events (
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

-- 5. Macro indicators (FRED data)
CREATE TABLE IF NOT EXISTS macro_indicators (
  id BIGSERIAL PRIMARY KEY,
  series_id TEXT NOT NULL,           -- FRED series ID
  name TEXT NOT NULL,
  value DECIMAL,
  previous_value DECIMAL,
  change_pct DECIMAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_macro_series ON macro_indicators(series_id);

-- 6. Yield curve data
CREATE TABLE IF NOT EXISTS yield_curve (
  id BIGSERIAL PRIMARY KEY,
  maturity TEXT NOT NULL,            -- '1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', '20Y', '30Y'
  rate DECIMAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_yield_maturity ON yield_curve(maturity);

-- Optional: User watchlists (for logged-in users tracking)
CREATE TABLE IF NOT EXISTS user_watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbols TEXT[] DEFAULT '{}',
  layout JSONB,                      -- react-grid-layout saved state
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: User portfolio (manual entry positions)
CREATE TABLE IF NOT EXISTS user_portfolio (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  avg_price DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETUP REALTIME SUBSCRIPTIONS
-- We need to ensure replication is enabled for the tables we want to listen to in the frontend
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE market_prices, news;
COMMIT;
