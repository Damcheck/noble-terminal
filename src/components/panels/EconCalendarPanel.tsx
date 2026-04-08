'use client';

import { useEffect, useRef } from 'react';
import { Panel, PanelHeader } from '@/components/ui/Panel';

export default function EconCalendarPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previously injected script to prevent duplicates on hot-reload/remounts
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: '100%',
      locale: 'en',
      importanceFilter: '-1,0,1',
      currencyFilter: 'USD,EUR,GBP,JPY,AUD,CAD,CHF,CNY'
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <Panel>
      <PanelHeader
        title="Economic Calendar"
        badge={
          <span style={{
            fontSize: 8, fontWeight: 700, color: '#44ff88',
            background: 'rgba(68,255,136,0.1)',
            border: '1px solid rgba(68,255,136,0.3)',
            padding: '1px 5px', borderRadius: 2, letterSpacing: 0.5,
          }}>◉ LIVE</span>
        }
      />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} ref={containerRef}>
        {/* TradingView script injects here */}
      </div>
    </Panel>
  );
}
