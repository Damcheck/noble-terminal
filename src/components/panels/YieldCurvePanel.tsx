'use client';

import { Panel, PanelHeader } from '@/components/ui/Panel';

// TradingView Yield Curve — shows US Treasury yields live
export default function YieldCurvePanel() {
  return (
    <Panel>
      <PanelHeader
        title="Yield Curve — US Treasury"
        badge={
          <span style={{
            fontSize: 8, fontWeight: 700, color: '#44ff88',
            background: 'rgba(68,255,136,0.1)',
            border: '1px solid rgba(68,255,136,0.3)',
            padding: '1px 5px', borderRadius: 2,
          }}>◉ LIVE</span>
        }
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Use TradingView mini-chart for key yields: 2Y, 10Y, 30Y */}
        <iframe
          src="https://s.tradingview.com/embed-widget/symbol-overview/?locale=en#%7B%22symbols%22%3A%5B%5B%22TVC%3AUS02Y%22%2C%22US02Y%7C1D%22%5D%2C%5B%22TVC%3AUS10Y%22%2C%22US10Y%7C1D%22%5D%2C%5B%22TVC%3AUS30Y%22%2C%22US30Y%7C1D%22%5D%5D%2C%22chartOnly%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22showVolume%22%3Afalse%2C%22showMA%22%3Afalse%2C%22hideDateRanges%22%3Afalse%2C%22hideMarketStatus%22%3Afalse%2C%22hideSymbolLogo%22%3Atrue%2C%22scalePosition%22%3A%22right%22%2C%22scaleMode%22%3A%22Normal%22%2C%22fontFamily%22%3A%22monospace%22%2C%22fontSize%22%3A%2210%22%2C%22noTimeScale%22%3Afalse%2C%22valuesTracking%22%3A%221%22%2C%22changeMode%22%3A%22price-and-percent%22%2C%22chartType%22%3A%22area%22%2C%22maLineColor%22%3A%22%232962FF%22%2C%22maLineWidth%22%3A1%2C%22maLength%22%3A9%2C%22lineWidth%22%3A2%2C%22lineType%22%3A0%2C%22dateRanges%22%3A%5B%221d%7C1%22%2C%221m%7C30%22%2C%223m%7C60%22%2C%2212m%7C1D%22%2C%2260m%7C1W%22%2C%22all%7C1M%22%5D%7D"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="US Treasury Yield Curve"
          allowFullScreen
        />
      </div>
    </Panel>
  );
}
