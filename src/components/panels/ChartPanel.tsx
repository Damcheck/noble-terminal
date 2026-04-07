'use client';

import { useEffect, useRef, useState } from 'react';
import { Panel, PanelHeader, LiveBadge } from '@/components/ui/Panel';
import { CHART_CANDLES } from '@/lib/mockData';

const TIMEFRAMES = ['1M', '5M', '15M', '1H', '4H', '1D', '1W'];

export default function ChartPanel() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [tf, setTf] = useState('1H');
  const [symbol, setSymbol] = useState('XAU/USD');
  const [ohlcv, setOhlcv] = useState(CHART_CANDLES[CHART_CANDLES.length - 1]);

  useEffect(() => {
    let chart: any;
    let candleSeries: any;
    let volumeSeries: any;

    const init = async () => {
      if (!chartRef.current) return;
      const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts');

      // Clean up old chart
      chartRef.current.innerHTML = '';

      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#666',
          fontFamily: 'Fira Code, monospace',
          fontSize: 10,
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: '#444', width: 1, style: 3 },
          horzLine: { color: '#444', width: 1, style: 3 },
        },
        rightPriceScale: {
          borderColor: '#2a2a2a',
          textColor: '#666',
        } as any,
        timeScale: {
          borderColor: '#2a2a2a',
          timeVisible: true,
          secondsVisible: false,
        } as any,
      });

      // Candlestick series
      candleSeries = chart.addCandlestickSeries({
        upColor: '#44ff88',
        downColor: '#ff4444',
        borderUpColor: '#44ff88',
        borderDownColor: '#ff4444',
        wickUpColor: '#44ff88',
        wickDownColor: '#ff4444',
      });

      // Volume series
      volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });

      const withColor = CHART_CANDLES.map(c => ({
        ...c,
        color: c.close >= c.open ? 'rgba(68,255,136,0.3)' : 'rgba(255,68,68,0.3)',
      }));

      candleSeries.setData(CHART_CANDLES as any);
      volumeSeries.setData(
        withColor.map(c => ({ time: c.time, value: c.volume, color: c.color })) as any
      );

      // Crosshair update
      chart.subscribeCrosshairMove((param: any) => {
        if (param.time) {
          const bar = CHART_CANDLES.find(c => c.time === param.time);
          if (bar) setOhlcv(bar);
        }
      });

      chart.timeScale().fitContent();
      chartInstance.current = chart;

      // Resize observer
      const ro = new ResizeObserver(() => {
        if (chartRef.current) {
          chart.resize(chartRef.current.clientWidth, chartRef.current.clientHeight);
        }
      });
      if (chartRef.current) ro.observe(chartRef.current);
    };

    init();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
    };
  }, [tf, symbol]);

  const last = CHART_CANDLES[CHART_CANDLES.length - 1];
  const isUp = last.close >= last.open;

  return (
    <Panel>
      <PanelHeader
        title={symbol}
        badge={<LiveBadge />}
        actions={
          <div className="flex items-center gap-1.5">
            {TIMEFRAMES.map(t => (
              <button
                key={t}
                onClick={() => setTf(t)}
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  background: tf === t ? 'var(--overlay-medium)' : 'transparent',
                  color: tf === t ? 'var(--text)' : 'var(--text-muted)',
                  border: `1px solid ${tf === t ? 'var(--border-strong)' : 'transparent'}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      {/* OHLCV Bar */}
      <div
        className="flex items-center gap-4 flex-shrink-0 px-3"
        style={{
          height: 28,
          background: 'var(--overlay-subtle)',
          borderBottom: '1px solid var(--border)',
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span style={{ color: 'var(--text-dim)' }}>O</span>
        <span style={{ color: isUp ? '#44ff88' : '#ff4444' }}>{ohlcv.open.toFixed(2)}</span>
        <span style={{ color: 'var(--text-dim)' }}>H</span>
        <span style={{ color: '#44ff88' }}>{ohlcv.high.toFixed(2)}</span>
        <span style={{ color: 'var(--text-dim)' }}>L</span>
        <span style={{ color: '#ff4444' }}>{ohlcv.low.toFixed(2)}</span>
        <span style={{ color: 'var(--text-dim)' }}>C</span>
        <span style={{ color: isUp ? '#44ff88' : '#ff4444', fontWeight: 700 }}>{ohlcv.close.toFixed(2)}</span>
        <span style={{ color: 'var(--text-dim)' }}>V</span>
        <span style={{ color: 'var(--text-secondary)' }}>{(ohlcv.volume / 1000).toFixed(1)}K</span>
      </div>

      {/* Chart Area */}
      <div ref={chartRef} style={{ flex: 1, minHeight: 0 }} />
    </Panel>
  );
}
