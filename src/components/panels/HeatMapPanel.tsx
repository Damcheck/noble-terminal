'use client';

import { Panel, PanelHeader } from '@/components/ui/Panel';

export default function HeatMapPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Forex Heatmap"
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
          src="https://s.tradingview.com/embed-widget/forex-heat-map/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22currencies%22%3A%5B%22EUR%22%2C%22USD%22%2C%22JPY%22%2C%22GBP%22%2C%22CHF%22%2C%22AUD%22%2C%22CAD%22%2C%22NZD%22%2C%22CNY%22%5D%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%7D"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Forex Heatmap"
          allowFullScreen
        />
      </div>
    </Panel>
  );
}
