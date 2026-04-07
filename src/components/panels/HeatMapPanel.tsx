'use client';

import { Panel, PanelHeader } from '@/components/ui/Panel';

// TradingView Market Overview widget replacing the broken custom recharts heatmap
export default function HeatMapPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Market Heatmap"
        badge={
          <span style={{
            fontSize: 8, fontWeight: 700, color: '#44ff88',
            background: 'rgba(68,255,136,0.1)',
            border: '1px solid rgba(68,255,136,0.3)',
            padding: '1px 5px', borderRadius: 2, letterSpacing: 0.5,
          }}>◉ LIVE</span>
        }
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <iframe
          src="https://s.tradingview.com/embed-widget/stock-heatmap/?locale=en#%7B%22exchanges%22%3A%5B%5D%2C%22dataSource%22%3A%22SPX500%22%2C%22grouping%22%3A%22sector%22%2C%22blockSize%22%3A%22market_cap_basic%22%2C%22blockColor%22%3A%22change%22%2C%22colorTheme%22%3A%22dark%22%2C%22hasTopBar%22%3Afalse%2C%22isDataSetEnabled%22%3Afalse%2C%22isZoomEnabled%22%3Atrue%2C%22hasSymbolTooltip%22%3Atrue%2C%22isMonoSize%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%7D"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="S&P 500 Market Heatmap"
          allowFullScreen
        />
      </div>
    </Panel>
  );
}
