'use client';

import { useState, useRef, useCallback } from 'react';

interface Channel {
  id: string;
  label: string;
  flag: string;
  session: string;
  color: string;
  // YouTube video IDs for their 24/7 live streams
  videoId: string;
}

const CHANNELS: Channel[] = [
  {
    id: 'bloomberg',
    label: 'Bloomberg TV',
    flag: '🌍',
    session: 'GLOBAL',
    color: '#ff6b00',
    videoId: 'dp8PhLsUcFE',
  },
  {
    id: 'yahoo',
    label: 'Yahoo Finance',
    flag: '🇺🇸',
    session: 'NEW YORK · USD',
    color: '#7360f2',
    videoId: 'eynxyoKgpng',
  },
  {
    id: 'skynews',
    label: 'Sky News',
    flag: '🇬🇧',
    session: 'LONDON · GBP/EUR',
    color: '#00a0e9',
    videoId: '9Auq9mYxFEE',
  },
  {
    id: 'cna',
    label: 'CNA',
    flag: '🇸🇬',
    session: 'ASIA · JPY/AUD',
    color: '#e63946',
    videoId: 'lCL4moxIfEI',
  },
  {
    id: 'coindesk',
    label: 'CoinDesk TV',
    flag: '₿',
    session: '24/7 CRYPTO',
    color: '#f7931a',
    videoId: 'cZpJqLCERPA',
  },
];

function TVFrame({ channel, muted, onToggleMute }: {
  channel: Channel;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const goFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#000',
        overflow: 'hidden',
        borderRadius: 4,
        border: '1px solid var(--border)',
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${channel.videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&rel=0&loop=1&playlist=${channel.videoId}`}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        title={channel.label}
      />

      {/* Overlay bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '3px 6px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: channel.color, flexShrink: 0,
            boxShadow: `0 0 4px ${channel.color}`,
          }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: channel.color, letterSpacing: 0.5 }}>
            {channel.flag} {channel.label}
          </span>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.3 }}>
            {channel.session}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            title={muted ? 'Click to unmute' : 'Click to mute'}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3, cursor: 'pointer',
              fontSize: 9, padding: '1px 5px',
              color: muted ? 'rgba(255,255,255,0.4)' : '#44ff88',
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {/* Fullscreen */}
          <button
            onClick={goFullscreen}
            title="Fullscreen"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3, cursor: 'pointer',
              fontSize: 9, padding: '1px 5px', color: 'white',
            }}
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TVWallPanel() {
  // Each channel has independent mute state; Bloomberg unmuted by default
  const [muted, setMuted] = useState<Record<string, boolean>>({
    bloomberg: false,
    yahoo: true,
    skynews: true,
    cna: true,
    coindesk: true,
  });

  const toggleMute = (id: string) => {
    setMuted(prev => {
      // If unmuting a small channel, mute bloomberg and all others
      const allMuted: Record<string, boolean> = {};
      CHANNELS.forEach(c => { allMuted[c.id] = true; });
      allMuted[id] = !prev[id]; // toggle the target
      // If muting the target, switch audio back to bloomberg
      if (!prev[id]) {
        // We are muting: leave all muted (bloomberg stays muted too unless it was on)
        return { ...prev, [id]: true };
      }
      // We are unmuting: mute everything else
      return allMuted;
    });
  };

  const [bloomberg, ...smallChannels] = CHANNELS;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      gap: 4,
      padding: 4,
      background: 'var(--bg)',
      boxSizing: 'border-box',
    }}>
      {/* Main Bloomberg TV — 2/3 width */}
      <div style={{ flex: '0 0 60%', height: '100%' }}>
        <TVFrame
          channel={bloomberg}
          muted={muted[bloomberg.id]}
          onToggleMute={() => toggleMute(bloomberg.id)}
        />
      </div>

      {/* 4 Small Channels — 2x2 grid, 1/3 width */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 4,
      }}>
        {smallChannels.map(ch => (
          <TVFrame
            key={ch.id}
            channel={ch}
            muted={muted[ch.id]}
            onToggleMute={() => toggleMute(ch.id)}
          />
        ))}
      </div>
    </div>
  );
}
