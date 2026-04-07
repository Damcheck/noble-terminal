// ============================================================
// NOBLE TERMINAL — Mock Data
// ============================================================

export const TICKER_ITEMS = [
  { symbol: 'S&P 500', price: '5,847.32', change: '+1.24%', up: true },
  { symbol: 'NASDAQ', price: '18,934.56', change: '-0.38%', up: false },
  { symbol: 'DOW', price: '42,313.10', change: '+0.67%', up: true },
  { symbol: 'XAU/USD', price: '2,978.45', change: '+1.34%', up: true },
  { symbol: 'BTC/USD', price: '83,412.00', change: '+2.11%', up: true },
  { symbol: 'EUR/USD', price: '1.0843', change: '-0.22%', up: false },
  { symbol: 'GBP/USD', price: '1.2741', change: '+0.15%', up: true },
  { symbol: 'VIX', price: '18.42', change: '-3.21%', up: false },
  { symbol: 'USD/NGN', price: '1,607.50', change: '+0.08%', up: true },
  { symbol: 'WTI OIL', price: '71.34', change: '-0.94%', up: false },
  { symbol: 'NVDA', price: '875.40', change: '+3.42%', up: true },
  { symbol: 'TSLA', price: '247.62', change: '-1.87%', up: false },
  { symbol: 'AAPL', price: '213.18', change: '+0.54%', up: true },
  { symbol: 'ETH/USD', price: '3,241.77', change: '+1.55%', up: true },
];

export const WATCHLIST = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 213.18, change: 0.54, volume: '54.2M', spark: [210, 211, 209, 212, 213, 212, 214, 213] },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 412.32, change: 1.12, volume: '21.7M', spark: [408, 410, 409, 411, 412, 411, 413, 412] },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.40, change: 3.42, volume: '43.1M', spark: [845, 852, 860, 868, 871, 875, 872, 875] },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 168.94, change: -0.23, volume: '22.4M', spark: [170, 169, 169, 168, 169, 168, 169, 168] },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 196.78, change: 0.87, volume: '31.2M', spark: [193, 194, 195, 195, 196, 197, 196, 196] },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 247.62, change: -1.87, volume: '88.9M', spark: [253, 251, 250, 249, 248, 248, 247, 247] },
  { symbol: 'META', name: 'Meta Platforms', price: 521.44, change: 1.54, volume: '18.3M', spark: [512, 514, 516, 518, 520, 521, 522, 521] },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 231.87, change: 0.34, volume: '11.2M', spark: [230, 231, 231, 232, 231, 232, 232, 231] },
  { symbol: 'V', name: 'Visa Inc.', price: 289.34, change: 0.21, volume: '8.4M', spark: [288, 288, 289, 289, 289, 290, 289, 289] },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 453.21, change: -0.12, volume: '4.1M', spark: [454, 454, 453, 453, 454, 453, 453, 453] },
];

export const FOREX_PAIRS = [
  { pair: 'EUR/USD', bid: '1.0841', ask: '1.0843', change: -0.22, spark: [1.0860, 1.0855, 1.0850, 1.0845, 1.0843, 1.0843, 1.0842, 1.0841], highlight: false },
  { pair: 'GBP/USD', bid: '1.2739', ask: '1.2741', change: 0.15, spark: [1.273, 1.273, 1.274, 1.274, 1.274, 1.274, 1.274, 1.274], highlight: false },
  { pair: 'USD/JPY', bid: '151.42', ask: '151.45', change: 0.31, spark: [151.1, 151.2, 151.3, 151.3, 151.4, 151.4, 151.4, 151.4], highlight: false },
  { pair: 'XAU/USD', bid: '2977.82', ask: '2978.45', change: 1.34, spark: [2940, 2950, 2958, 2965, 2970, 2975, 2978, 2978], highlight: true },
  { pair: 'USD/NGN', bid: '1607.00', ask: '1607.50', change: 0.08, spark: [1605, 1605, 1606, 1606, 1607, 1607, 1607, 1607], highlight: false },
  { pair: 'USD/CHF', bid: '0.8923', ask: '0.8925', change: -0.09, spark: [0.893, 0.893, 0.892, 0.892, 0.892, 0.892, 0.892, 0.892], highlight: false },
  { pair: 'AUD/USD', bid: '0.6441', ask: '0.6443', change: 0.28, spark: [0.642, 0.643, 0.643, 0.644, 0.644, 0.644, 0.644, 0.644], highlight: false },
  { pair: 'EUR/GBP', bid: '0.8505', ask: '0.8507', change: -0.11, spark: [0.851, 0.851, 0.851, 0.850, 0.850, 0.850, 0.850, 0.850], highlight: false },
];

export const CRYPTO_LIST = [
  { symbol: 'BTC', name: 'Bitcoin', price: 83412, change24h: 2.11, mcap: '1.64T', spark: [79000, 80000, 81000, 82000, 82500, 83000, 83200, 83412] },
  { symbol: 'ETH', name: 'Ethereum', price: 3241, change24h: 1.55, mcap: '389B', spark: [3180, 3190, 3200, 3220, 3230, 3240, 3238, 3241] },
  { symbol: 'BNB', name: 'BNB', price: 597.4, change24h: 0.88, mcap: '87.2B', spark: [591, 593, 594, 595, 596, 597, 597, 597] },
  { symbol: 'SOL', name: 'Solana', price: 142.3, change24h: 3.21, mcap: '65.8B', spark: [137, 138, 139, 140, 141, 142, 142, 142] },
  { symbol: 'XRP', name: 'XRP', price: 0.5841, change24h: -0.67, mcap: '32.4B', spark: [0.590, 0.588, 0.587, 0.586, 0.585, 0.584, 0.584, 0.584] },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change24h: 1.45, mcap: '18.1B', spark: [0.121, 0.122, 0.122, 0.123, 0.123, 0.123, 0.123, 0.123] },
  { symbol: 'ADA', name: 'Cardano', price: 0.4521, change24h: 2.34, mcap: '15.9B', spark: [0.441, 0.443, 0.445, 0.448, 0.450, 0.452, 0.452, 0.452] },
  { symbol: 'AVAX', name: 'Avalanche', price: 34.21, change24h: -1.22, mcap: '14.0B', spark: [34.7, 34.6, 34.5, 34.4, 34.3, 34.3, 34.2, 34.2] },
];

export const COMMODITIES = [
  { symbol: 'GC=F', name: 'Gold', price: 2978.45, unit: '/oz', change: 1.34, spark: [2940, 2950, 2958, 2965, 2970, 2975, 2978, 2978], highlight: true },
  { symbol: 'SI=F', name: 'Silver', price: 33.84, unit: '/oz', change: 0.72, spark: [33.5, 33.6, 33.7, 33.7, 33.8, 33.8, 33.8, 33.8], highlight: false },
  { symbol: 'CL=F', name: 'Crude Oil', price: 71.34, unit: '/bbl', change: -0.94, spark: [72.0, 71.8, 71.6, 71.5, 71.4, 71.4, 71.3, 71.3], highlight: false },
  { symbol: 'NG=F', name: 'Natural Gas', price: 2.341, unit: '/MMBtu', change: -1.84, spark: [2.38, 2.37, 2.36, 2.35, 2.35, 2.34, 2.34, 2.34], highlight: false },
  { symbol: 'HG=F', name: 'Copper', price: 4.521, unit: '/lb', change: 0.44, spark: [4.50, 4.50, 4.51, 4.51, 4.52, 4.52, 4.52, 4.52], highlight: false },
  { symbol: 'PL=F', name: 'Platinum', price: 987.4, unit: '/oz', change: -0.21, spark: [989, 989, 988, 988, 987, 987, 987, 987], highlight: false },
];

export const NEWS_FEED = [
  {
    id: 1, phase: 'ALERT', source: 'Reuters', category: 'MARKETS',
    headline: 'Fed signals potential rate cut as inflation data cools below 3% target for first time',
    time: '2m ago', sentiment: 'bullish',
  },
  {
    id: 2, phase: 'DEVELOPING', source: 'Bloomberg', category: 'FOREX',
    headline: 'Dollar weakens broadly as markets reprice Fed pivot expectations for Q2 2025',
    time: '8m ago', sentiment: 'bearish',
  },
  {
    id: 3, phase: 'SUSTAINED', source: 'CNBC', category: 'CRYPTO',
    headline: 'Bitcoin surges past $83K as institutional ETF inflows hit record $2.1B weekly pace',
    time: '14m ago', sentiment: 'bullish',
  },
  {
    id: 4, phase: 'ALERT', source: 'FT', category: 'MACRO',
    headline: 'China GDP growth beats forecasts at 5.3% — commodity demand outlook upgraded',
    time: '21m ago', sentiment: 'bullish',
  },
  {
    id: 5, phase: 'DEVELOPING', source: 'Newsday', category: 'AFRICA',
    headline: 'NGX All-Share Index climbs 1.4% as banking stocks lead gains amid CBN policy shift',
    time: '35m ago', sentiment: 'bullish',
  },
  {
    id: 6, phase: 'SUSTAINED', source: 'WSJ', category: 'EARNINGS',
    headline: 'NVIDIA Q1 earnings preview: analysts expect $24.5B revenue, data center at 87% of sales',
    time: '42m ago', sentiment: 'neutral',
  },
  {
    id: 7, phase: 'DEVELOPING', source: 'AP', category: 'MARKETS',
    headline: 'VIX drops to 4-month low as S&P 500 approaches all-time high resistance at 5,900',
    time: '51m ago', sentiment: 'bullish',
  },
  {
    id: 8, phase: 'SUSTAINED', source: 'MarketWatch', category: 'FOREX',
    headline: 'ECB rate decision due Thursday — traders price 80% probability of 25bps cut',
    time: '1h ago', sentiment: 'neutral',
  },
  {
    id: 9, phase: 'ALERT', source: 'Reuters', category: 'MACRO',
    headline: 'Saudi Arabia announces unexpected 500K bpd oil production cut starting May 1st',
    time: '1h 12m ago', sentiment: 'bullish',
  },
  {
    id: 10, phase: 'SUSTAINED', source: 'CoinDesk', category: 'CRYPTO',
    headline: 'Ethereum Pectra upgrade confirmed for June — staking withdrawal improvements included',
    time: '1h 34m ago', sentiment: 'bullish',
  },
];

export const ECONOMIC_CALENDAR = [
  { time: '13:30', event: 'US Core CPI (MoM)', country: 'USD', impact: 'HIGH', previous: '0.4%', forecast: '0.3%', actual: '0.3%', status: 'released' },
  { time: '14:00', event: 'US Fed Chair Powell Speech', country: 'USD', impact: 'HIGH', previous: '—', forecast: '—', actual: '', status: 'upcoming' },
  { time: '14:30', event: 'EIA Crude Oil Inventories', country: 'USD', impact: 'MEDIUM', previous: '-2.1M', forecast: '-1.5M', actual: '', status: 'upcoming' },
  { time: '15:00', event: 'ECB President Lagarde Speech', country: 'EUR', impact: 'MEDIUM', previous: '—', forecast: '—', actual: '', status: 'upcoming' },
  { time: '18:00', event: 'US 10-Year Note Auction', country: 'USD', impact: 'LOW', previous: '4.318%', forecast: '4.30%', actual: '', status: 'upcoming' },
  { time: '21:30', event: 'US Initial Jobless Claims', country: 'USD', impact: 'MEDIUM', previous: '211K', forecast: '215K', actual: '', status: 'upcoming' },
];

export const SECTOR_PERFORMANCE = [
  { name: 'Technology', ticker: 'XLK', change: 2.41 },
  { name: 'Communication', ticker: 'XLC', change: 1.87 },
  { name: 'Consumer Disc.', ticker: 'XLY', change: 0.94 },
  { name: 'Financials', ticker: 'XLF', change: 0.72 },
  { name: 'Industrials', ticker: 'XLI', change: 0.31 },
  { name: 'Healthcare', ticker: 'XLV', change: -0.14 },
  { name: 'Materials', ticker: 'XLB', change: -0.44 },
  { name: 'Real Estate', ticker: 'XLRE', change: -0.87 },
  { name: 'Utilities', ticker: 'XLU', change: -1.12 },
  { name: 'Energy', ticker: 'XLE', change: -1.68 },
];

export const MACRO_INDICATORS = [
  { id: 'VIX', label: 'VIX', value: '18.42', change: -3.21, unit: '' },
  { id: 'DXY', label: 'DXY', value: '103.84', change: -0.34, unit: '' },
  { id: 'DGS10', label: 'US 10Y', value: '4.318', change: 0.02, unit: '%' },
  { id: 'FEDFUNDS', label: 'Fed Funds', value: '5.25–5.50', change: 0, unit: '%' },
  { id: 'CPI', label: 'CPI YoY', value: '3.2', change: -0.1, unit: '%' },
  { id: 'GDP', label: 'GDP QoQ', value: '2.1', change: 0.3, unit: '%' },
];

export const YIELD_CURVE = [
  { maturity: '1M', rate: 5.27 },
  { maturity: '3M', rate: 5.24 },
  { maturity: '6M', rate: 5.15 },
  { maturity: '1Y', rate: 4.98 },
  { maturity: '2Y', rate: 4.71 },
  { maturity: '5Y', rate: 4.41 },
  { maturity: '10Y', rate: 4.31 },
  { maturity: '20Y', rate: 4.54 },
  { maturity: '30Y', rate: 4.48 },
];

export const HEATMAP_DATA = [
  { symbol: 'AAPL', change: 0.54, mcap: 3.3 },
  { symbol: 'MSFT', change: 1.12, mcap: 3.1 },
  { symbol: 'NVDA', change: 3.42, mcap: 2.7 },
  { symbol: 'GOOGL', change: -0.23, mcap: 2.1 },
  { symbol: 'AMZN', change: 0.87, mcap: 2.0 },
  { symbol: 'META', change: 1.54, mcap: 1.4 },
  { symbol: 'TSLA', change: -1.87, mcap: 0.8 },
  { symbol: 'BRK.B', change: -0.12, mcap: 0.9 },
  { symbol: 'LLY', change: 2.10, mcap: 0.7 },
  { symbol: 'JPM', change: 0.34, mcap: 0.7 },
  { symbol: 'V', change: 0.21, mcap: 0.6 },
  { symbol: 'UNH', change: -0.88, mcap: 0.5 },
  { symbol: 'XOM', change: -1.22, mcap: 0.5 },
  { symbol: 'JNJ', change: -0.44, mcap: 0.4 },
  { symbol: 'WMT', change: 0.66, mcap: 0.6 },
  { symbol: 'AVGO', change: 2.87, mcap: 0.7 },
  { symbol: 'MA', change: 0.41, mcap: 0.5 },
  { symbol: 'HD', change: -0.31, mcap: 0.4 },
  { symbol: 'ORCL', change: 1.88, mcap: 0.4 },
  { symbol: 'COST', change: 0.54, mcap: 0.3 },
];

export const AFRICAN_MARKETS = {
  ngxAllShare: { value: 103241.5, change: 1.42 },
  ngxBanking: { value: 942.3, change: 2.11 },
  usdNgn: { value: 1607.50, change: 0.08 },
  topGainers: [
    { symbol: 'GTCO', change: 4.82, price: 52.10 },
    { symbol: 'ZENITHBANK', change: 3.91, price: 41.50 },
    { symbol: 'ACCESSCORP', change: 3.12, price: 22.80 },
  ],
  topLosers: [
    { symbol: 'OANDO', change: -4.21, price: 11.20 },
    { symbol: 'NNPC', change: -2.87, price: 8.50 },
    { symbol: 'DANGSUGAR', change: -1.94, price: 23.30 },
  ],
};

export const RISK_GAUGES = {
  marketRisk: 42,
  volatility: 28,
  sentiment: 61,
  vix: 18.42,
  putCallRatio: 0.87,
  advanceDecline: 1.34,
  breadth: 58,
};

export const ORDER_BOOK = {
  asks: [
    { price: 2982.10, size: 1.24, total: 8.41 },
    { price: 2981.50, size: 2.87, total: 7.17 },
    { price: 2981.00, size: 1.53, total: 4.30 },
    { price: 2980.50, size: 3.21, total: 2.77 },
    { price: 2980.00, size: 0.41, total: 0.41 },
  ],
  spread: '1.55',
  bids: [
    { price: 2978.45, size: 1.87, total: 1.87 },
    { price: 2978.00, size: 3.41, total: 5.28 },
    { price: 2977.50, size: 2.12, total: 7.40 },
    { price: 2977.00, size: 4.55, total: 11.95 },
    { price: 2976.50, size: 1.33, total: 13.28 },
  ],
};

// Generate mock OHLCV candle data
function generateCandles(basePrice: number, count: number) {
  const candles = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.008;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.003;
    const low = Math.min(open, close) - Math.random() * price * 0.003;
    const volume = Math.floor(Math.random() * 5000 + 1000);
    candles.push({
      time: Math.floor((now - i * 60000) / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    price = close;
  }
  return candles;
}

export const CHART_CANDLES = generateCandles(2950, 200);

export const MARKET_STATUS = [
  { name: 'NYSE', status: 'OPEN', color: '#44ff88' },
  { name: 'NASDAQ', status: 'OPEN', color: '#44ff88' },
  { name: 'LSE', status: 'CLOSED', color: '#ff4444' },
  { name: 'NGX', status: 'OPEN', color: '#44ff88' },
  { name: 'HKEx', status: 'CLOSED', color: '#ff4444' },
];

export const DARK_POOL_TRADES = [
  { time: '14:23:01', symbol: 'SPY', size: '2.4M', price: 584.10, notion: '$1.40B', condition: 'Cross' },
  { time: '14:21:44', symbol: 'QQQ', size: '1.1M', price: 472.50, notion: '$519M', condition: 'Form T' },
  { time: '13:58:12', symbol: 'NVDA', size: '850K', price: 875.20, notion: '$743M', condition: 'Pric Var' },
  { time: '13:45:09', symbol: 'TSLA', size: '1.2M', price: 247.62, notion: '$297M', condition: 'Cross' },
  { time: '13:12:33', symbol: 'AAPL', size: '3.5M', price: 213.15, notion: '$746M', condition: 'Form T' },
  { time: '12:54:19', symbol: 'META', size: '420K', price: 521.40, notion: '$218M', condition: 'Deriv' },
];

export const CAPITOL_HILL_TRADES = [
  { date: 'Today', politician: 'N. Pelosi (D-CA)', asset: 'PANW', type: 'BUY', amount: '$1-5M', impact: 4.2 },
  { date: 'Today', politician: 'D. Crenshaw (R-TX)', asset: 'BA', type: 'SELL', amount: '$500K-1M', impact: -1.8 },
  { date: 'Yest.', politician: 'R. Khanna (D-CA)', asset: 'MSFT', type: 'BUY', amount: '$100-250K', impact: 1.1 },
  { date: 'Apr 02', politician: 'J. Gottheimer (D)', asset: 'NVDA', type: 'SELL', amount: '$1-5M', impact: -0.5 },
  { date: 'Apr 01', politician: 'M. Green (R-TN)', asset: 'XOM', type: 'BUY', amount: '$500K-1M', impact: 2.1 },
];

export const CDS_SPREADS = [
  { entity: 'US Treasury 5Y', spread: '42', change: 2, status: 'SAFE' },
  { entity: 'Itau Unibanco 5Y', spread: '142', change: -4, status: 'MOD' },
  { entity: 'Ecopetrol SA 5Y', spread: '315', change: 14, status: 'RISK' },
  { entity: 'Boeing Co 5Y', spread: '188', change: 22, status: 'WATCH' },
  { entity: 'Paramount 5Y', spread: '412', change: 45, status: 'DIST' },
];

export const SPLC_DATA = {
  focal: 'AAPL',
  revenue: '$383.2B',
  suppliers: [
    { name: 'Foxconn', relation: 'Assembler', dependency: 52, impact: -4.2 },
    { name: 'TSMC', relation: 'Silicon', dependency: 26, impact: -1.8 },
    { name: 'Broadcom', relation: 'Chips', dependency: 18, impact: -2.1 },
  ],
  customers: [
    { name: 'Verizon', relation: 'Carrier', dependency: 12, impact: 1.1 },
    { name: 'AT&T', relation: 'Carrier', dependency: 10, impact: 0.8 },
  ]
};
