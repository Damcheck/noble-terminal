'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useMarketStore } from '@/store/marketStore';
import { useMacroStore } from '@/store/macroStore';
import { useNewsStore } from '@/store/newsStore';
import { useEconCalStore } from '@/store/econCalStore';
import { useYieldStore } from '@/store/yieldStore';
import { useFinnhubStore } from '@/store/finnhubStore';

import TerminalHeader from '@/components/layout/Header';
import TerminalFooter from '@/components/layout/Footer';
import PanelLoader from '@/components/ui/PanelLoader';

// Heavy modules chunk split with loading states (fixes PageSpeed FCP/TBT)
const HeatMapPanel = dynamic(() => import('@/components/panels/HeatMapPanel'), { loading: () => <PanelLoader /> });
const WatchlistPanel = dynamic(() => import('@/components/panels/WatchlistPanel'), { loading: () => <PanelLoader /> });
const ForexPanel = dynamic(() => import('@/components/panels/ForexPanel'), { loading: () => <PanelLoader /> });
const NewsFeedPanel = dynamic(() => import('@/components/panels/NewsFeedPanel'), { loading: () => <PanelLoader /> });
const EconCalendarPanel = dynamic(() => import('@/components/panels/EconCalendarPanel'), { loading: () => <PanelLoader /> });
const RiskPanel = dynamic(() => import('@/components/panels/RiskPanel'), { loading: () => <PanelLoader /> });
const MacroPanel = dynamic(() => import('@/components/panels/MacroPanel').then(m => m.MacroPanel), { loading: () => <PanelLoader /> });
const OrderBookPanel = dynamic(() => import('@/components/panels/OrderBookPanel'), { loading: () => <PanelLoader /> });
const CryptoPanel = dynamic(() => import('@/components/panels/CryptoPanel'), { loading: () => <PanelLoader /> });
const AfricanMarketsPanel = dynamic(() => import('@/components/panels/AfricanMarketsPanel'), { loading: () => <PanelLoader /> });
const YieldCurvePanel = dynamic(() => import('@/components/panels/YieldCurvePanel'), { loading: () => <PanelLoader /> });
const DarkPoolPanel = dynamic(() => import('@/components/panels/DarkPoolPanel'), { loading: () => <PanelLoader /> });
const InsiderTradingPanel = dynamic(() => import('@/components/panels/InsiderTradingPanel'), { loading: () => <PanelLoader /> });
const CDSPanel = dynamic(() => import('@/components/panels/CDSPanel'), { loading: () => <PanelLoader /> });
const SupplyChainPanel = dynamic(() => import('@/components/panels/SupplyChainPanel'), { loading: () => <PanelLoader /> });

const SectorPanel = dynamic(() => import('@/components/panels/MarketPanels').then(m => m.SectorPanel), { loading: () => <PanelLoader /> });
const CommoditiesPanel = dynamic(() => import('@/components/panels/MarketPanels').then(m => m.CommoditiesPanel), { loading: () => <PanelLoader /> });

// Chart and TVWall must be dynamic browser APIs
const ChartPanel = dynamic(() => import('@/components/panels/ChartPanel'), { ssr: false, loading: () => <PanelLoader /> });
const TVWall = dynamic(() => import('@/components/panels/TVWallPanel'), { ssr: false, loading: () => <PanelLoader /> });

// Default layout — 12-col grid, rowHeight=32
const DEFAULT_LAYOUTS: any = {
  lg: [
    { i: 'chart',       x: 0, y: 0,  w: 5, h: 13, minW: 4, minH: 8 },
    { i: 'tvwall',      x: 5, y: 0,  w: 7, h: 13, minW: 5, minH: 8 },
    { i: 'watchlist',   x: 0, y: 13, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'forex',       x: 3, y: 13, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'crypto',      x: 6, y: 13, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'orderbook',   x: 9, y: 13, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'news',        x: 0, y: 22, w: 6, h: 10, minW: 3, minH: 6 },
    { i: 'econcal',     x: 6, y: 22, w: 3, h: 10, minW: 2, minH: 6 },
    { i: 'risk',        x: 9, y: 22, w: 3, h: 10, minW: 2, minH: 8 },
    { i: 'sector',      x: 0, y: 32, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'macro',       x: 3, y: 32, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'commodities', x: 6, y: 32, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'africa',      x: 9, y: 32, w: 3, h: 9,  minW: 2, minH: 6 },
    { i: 'heatmap',     x: 0, y: 41, w: 6, h: 9,  minW: 4, minH: 6 },
    { i: 'yield',       x: 6, y: 41, w: 6, h: 9,  minW: 3, minH: 7 },
    { i: 'darkpool',    x: 0, y: 50, w: 4, h: 9,  minW: 3, minH: 6 },
    { i: 'capitol',     x: 4, y: 50, w: 4, h: 9,  minW: 3, minH: 6 },
    { i: 'cds',         x: 8, y: 50, w: 4, h: 9,  minW: 3, minH: 6 },
    { i: 'splc',        x: 0, y: 59, w: 6, h: 9,  minW: 4, minH: 8 },
  ],
};

// Auto-generate linear stacking flows for smaller screens (Mobile / Tablet)
DEFAULT_LAYOUTS.md = DEFAULT_LAYOUTS.lg.map((item: any, idx: number) => ({
  i: item.i, x: (idx % 2) * 4, y: Math.floor(idx / 2) * 10, w: 4, h: Math.max(item.h, 10), minW: 2, minH: 8
}));
DEFAULT_LAYOUTS.sm = DEFAULT_LAYOUTS.lg.map((item: any, idx: number) => ({
  i: item.i, x: 0, y: idx * 12, w: 4, h: Math.max(item.h, 10), minW: 1, minH: 6
}));
DEFAULT_LAYOUTS.xs = DEFAULT_LAYOUTS.lg.map((item: any, idx: number) => ({
  i: item.i, x: 0, y: idx * 12, w: 2, h: Math.max(item.h, 10), minW: 1, minH: 6
}));

const PANELS = [
  { id: 'chart',       label: 'Chart',           Component: ChartPanel },
  { id: 'tvwall',      label: 'TV Wall',         Component: TVWall },
  { id: 'watchlist',   label: 'Watchlist',       Component: WatchlistPanel },
  { id: 'forex',       label: 'Forex',           Component: ForexPanel },
  { id: 'crypto',      label: 'Crypto',          Component: CryptoPanel },
  { id: 'orderbook',   label: 'Order Book',      Component: OrderBookPanel },
  { id: 'news',        label: 'News',            Component: NewsFeedPanel },
  { id: 'econcal',     label: 'Econ Cal',        Component: EconCalendarPanel },
  { id: 'risk',        label: 'Risk',            Component: RiskPanel },
  { id: 'sector',      label: 'Sectors',         Component: SectorPanel },
  { id: 'macro',       label: 'Macro',           Component: MacroPanel },
  { id: 'commodities', label: 'Commodities',     Component: CommoditiesPanel },
  { id: 'africa',      label: 'NGX',             Component: AfricanMarketsPanel },
  { id: 'heatmap',     label: 'Heat Map',        Component: HeatMapPanel },
  { id: 'yield',       label: 'Yield Curve',     Component: YieldCurvePanel },
  { id: 'darkpool',    label: 'Dark Pool',       Component: DarkPoolPanel },
  { id: 'capitol',     label: 'Capitol Hill',    Component: InsiderTradingPanel },
  { id: 'cds',         label: 'CDS Spreads',     Component: CDSPanel },
  { id: 'splc',        label: 'Supply Chain',    Component: SupplyChainPanel },
] as const;

export default function TerminalPage() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const initMarket = useMarketStore(s => s.initializeRealtime);
  const initMacro = useMacroStore(s => s.initializeRealtime);
  const initNews = useNewsStore(s => s.initializeRealtime);
  const initEcon = useEconCalStore(s => s.initializeRealtime);
  const initYield = useYieldStore(s => s.initializeRealtime);

  const connectFinnhub = useFinnhubStore(s => s.connect);

  useEffect(() => {
    // 🔴 Yield to main thread for FCP, then boot up heavy data feeds
    const timer = setTimeout(() => {
      initMarket();
      initMacro();
      initNews();
      initEcon();
      initYield();
      connectFinnhub();
    }, 50);

    // Reconnect Finnhub when user switches back to the tab
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const { isConnected, connect } = useFinnhubStore.getState();
        if (!isConnected) {
          console.log('[Finnhub] Tab became visible — reconnecting...');
          connect();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [initMarket, initMacro, initNews, initEcon, initYield, connectFinnhub]);

  const toggle = (id: string) =>
    setHidden(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const visiblePanels = PANELS.filter(p => !hidden.has(p.id));
  const { width, containerRef, mounted } = useContainerWidth();

  const isMobile = width < 768;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: isMobile ? 'auto' : '100vh', 
        minHeight: '100vh',
        background: 'var(--bg)', 
        overflow: isMobile ? 'visible' : 'hidden' 
      }}
    >
      <TerminalHeader />

      {/* Panel Toggle Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '4px 8px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 9, color: 'var(--text-ghost)', marginRight: 4, letterSpacing: 0.5, flexShrink: 0 }}>
          PANELS:
        </span>
        {PANELS.map(p => {
          const isHidden = hidden.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              style={{
                fontSize: 9,
                padding: '2px 7px',
                borderRadius: 2,
                border: `1px solid ${isHidden ? 'var(--border-subtle)' : 'var(--border)'}`,
                background: isHidden ? 'transparent' : 'var(--overlay-subtle)',
                color: isHidden ? 'var(--text-ghost)' : 'var(--text-dim)',
                cursor: 'pointer',
                letterSpacing: 0.3,
                textDecoration: isHidden ? 'line-through' : 'none',
                transition: 'all 0.1s',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Main grid area */}
      <main ref={containerRef} style={{ flex: 1, overflow: isMobile ? 'visible' : 'auto', padding: 4 }}>
        {mounted && (
          <ResponsiveGridLayout
            width={width}
            layouts={{ 
              lg: DEFAULT_LAYOUTS.lg.filter((l: any) => !hidden.has(l.i)),
              md: DEFAULT_LAYOUTS.md.filter((l: any) => !hidden.has(l.i)),
              sm: DEFAULT_LAYOUTS.sm.filter((l: any) => !hidden.has(l.i)),
              xs: DEFAULT_LAYOUTS.xs.filter((l: any) => !hidden.has(l.i)),
            }}
            breakpoints={{ lg: 1280, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 8, sm: 4, xs: 2 }}
            rowHeight={32}
            margin={[4, 4]}
            containerPadding={[0, 0]}
            // @ts-ignore
            isDraggable={width > 768}
            // @ts-ignore
            isResizable={width > 768}
            // @ts-ignore
            draggableHandle=".drag-handle"
            style={{ minHeight: '100%' }}
          >
            {visiblePanels.map(({ id, Component }) => (
              <div key={id} style={{ overflow: 'hidden' }}>
                <GridItem id={id} onClose={() => toggle(id)}>
                  <Component />
                </GridItem>
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </main>

      <TerminalFooter />
    </div>
  );
}

// Thin wrapper: invisible drag handle + close button on top of each panel
function GridItem({
  id,
  onClose,
  children,
}: {
  id: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Drag handle covers header area */}
      <div
        className="drag-handle"
        title="Drag to move"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 26,
          height: 26,
          cursor: 'move',
          zIndex: 10,
        }}
      />
      {/* Close button */}
      <button
        onClick={onClose}
        title="Hide panel"
        style={{
          position: 'absolute',
          top: 5,
          right: 6,
          zIndex: 20,
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-ghost)',
          fontSize: 14,
          lineHeight: 1,
          borderRadius: 2,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ff4444'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-ghost)'; }}
      >
        ×
      </button>
      {/* Panel fills remaining space */}
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}
