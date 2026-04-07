'use client';

import { useState, useMemo } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, TabBar } from '@/components/ui/Panel';
import { HEATMAP_DATA } from '@/lib/mockData';
import { useMarketStore } from '@/store/marketStore';

const TABS = ['S&P 500', 'NASDAQ', 'CRYPTO', 'FOREX'];

// S&P 500 / NASDAQ symbols we track via market_prices cron
const SP500_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK.B', 'LLY', 'JPM', 'V', 'UNH', 'XOM', 'JNJ', 'WMT', 'AVGO', 'MA', 'HD', 'ORCL', 'COST'];
const CRYPTO_SYMBOLS = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'ADA-USD', 'AVAX-USD', 'DOT-USD', 'LINK-USD'];
const FOREX_SYMBOLS = ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X', 'USDCHF=X', 'USDCAD=X', 'EURGBP=X', 'XAUUSD=X'];

function getCellColor(change: number): string {
  const abs = Math.abs(change);
  const intensity = 0.06 + Math.min(abs / 5 * 0.25, 0.35);
  if (change > 0) return `rgba(68,255,136,${intensity})`;
  if (change < 0) return `rgba(255,68,68,${intensity})`;
  return 'rgba(255,255,255,0.04)';
}

function getBorderColor(change: number): string {
  const abs = Math.abs(change);
  const intensity = 0.15 + Math.min(abs / 5 * 0.3, 0.4);
  if (change > 0) return `rgba(68,255,136,${intensity})`;
  if (change < 0) return `rgba(255,68,68,${intensity})`;
  return 'rgba(255,255,255,0.06)';
}

export default function HeatMapPanel() {
  const [activeTab, setActiveTab] = useState('S&P 500');
  const [hovered, setHovered] = useState<string | null>(null);
  const { prices, isRealtimeConnected } = useMarketStore();

  const heatmapData = useMemo(() => {
    let symbols: string[] = [];
    if (activeTab === 'S&P 500' || activeTab === 'NASDAQ') symbols = SP500_SYMBOLS;
    if (activeTab === 'CRYPTO') symbols = CRYPTO_SYMBOLS;
    if (activeTab === 'FOREX') symbols = FOREX_SYMBOLS;

    const liveItems = symbols
      .map(sym => prices[sym])
      .filter(Boolean)
      .map(p => ({
        symbol: p.symbol.replace('-USD', '').replace('=X', ''),
        change: p.change_pct ?? 0,
        mcap: p.market_cap ? p.market_cap / 1e12 : 0.1,
      }));

    // Fall back to mock data for S&P 500 if not enough live data
    if (liveItems.length < 5 && (activeTab === 'S&P 500' || activeTab === 'NASDAQ')) {
      return HEATMAP_DATA;
    }
    return liveItems.length > 0 ? liveItems : HEATMAP_DATA;
  }, [prices, activeTab]);

  const totalMcap = heatmapData.reduce((s, d) => s + d.mcap, 0);

  return (
    <Panel>
      <PanelHeader title="Market Heat Map" badge={isRealtimeConnected ? <LiveBadge /> : undefined} />
      <TabBar tabs={TABS} active={activeTab} onSelect={setActiveTab} />
      <PanelContent noPad>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2,
            padding: 6,
            height: '100%',
          }}
        >
          {heatmapData.map(item => {
            const weight = totalMcap > 0 ? (item.mcap / totalMcap) * 100 : 0;
            const isHovered = hovered === item.symbol;
            return (
              <div
                key={item.symbol}
                onMouseEnter={() => setHovered(item.symbol)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: getCellColor(item.change),
                  border: `1px solid ${getBorderColor(item.change)}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  padding: '8px 4px',
                  position: 'relative',
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  zIndex: isHovered ? 2 : 1,
                  boxShadow: isHovered ? `0 0 12px ${getBorderColor(item.change)}` : 'none',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', letterSpacing: 0.3 }}>
                  {item.symbol}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: item.change >= 0 ? '#44ff88' : '#ff4444',
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </span>
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--surface-hover)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 3,
                      padding: '4px 8px',
                      fontSize: 9,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      marginBottom: 4,
                    }}
                  >
                    {item.mcap > 0 ? `MCap: ${item.mcap.toFixed(1)}T · ` : ''}Weight: {weight.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PanelContent>
    </Panel>
  );
}
