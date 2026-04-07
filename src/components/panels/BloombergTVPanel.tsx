'use client';

import { Panel, PanelHeader } from '@/components/ui/Panel';

export default function BloombergTVPanel() {
  return (
    <Panel>
      <PanelHeader
        title="Bloomberg TV"
        badge={
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: 0.8,
            color: '#ff4444', background: 'rgba(255,68,68,0.15)',
            border: '1px solid rgba(255,68,68,0.3)',
            padding: '1px 5px', borderRadius: 2,
          }}>◉ LIVE</span>
        }
      />
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        <iframe
          src="https://www.youtube.com/embed/live_stream?channel=UCBINFWq52ShSgUFEoyfFamg&autoplay=1&mute=1&controls=1&modestbranding=1&rel=0"
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Bloomberg TV Live"
        />
      </div>
    </Panel>
  );
}
