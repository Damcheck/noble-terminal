'use client';

import { Panel, PanelHeader } from '@/components/ui/Panel';

export default function EconCalendarPanel() {
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
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe
          src="https://sslecal2.investing.com/?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=2,3&features=datepicker,timezone&countries=25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5&calType=week&timeZone=55&lang=1"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
            filter: 'invert(1) hue-rotate(180deg)', // dark-mode invert
          }}
          title="Economic Calendar"
          loading="lazy"
        />
      </div>
    </Panel>
  );
}
