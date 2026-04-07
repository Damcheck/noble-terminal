'use client';

import { useState, useRef, useCallback } from 'react';

interface Channel {
  id: string;
  label: string;
  flag: string;
  session: string;
  color: string;
  videoId: string;
  youtubeUrl: string; // fallback link
}

const CHANNELS: Channel[] = [
  {
    id: 'bloomberg',
    label: 'Bloomberg TV',
    flag: '🌍',
    session: 'GLOBAL · MACRO',
    color: '#ff6b00',
    videoId: 'iEpJwprxDdk',
    youtubeUrl: 'https://www.youtube.com/watch?v=iEpJwprxDdk',
  },
  {
    id: 'yahoo',
    label: 'Yahoo Finance',
    flag: '🇺🇸',
    session: 'NEW YORK · USD',
    color: '#7360f2',
    videoId: 'KQp-e_XQnDE',
    youtubeUrl: 'https://www.youtube.com/watch?v=KQp-e_XQnDE',
  },
  {
    id: 'skynews',
    label: 'Sky News',
    flag: '🇬🇧',
    session: 'LONDON · GBP/EUR',
    color: '#00a0e9',
    videoId: 'n6L80JIZ9pg',
    youtubeUrl: 'https://www.youtube.com/watch?v=n6L80JIZ9pg',
  },
  {
    id: 'cna',
    label: 'CNA',
    flag: '🇸🇬',
    session: 'ASIA · JPY/AUD',
    color: '#e63946',
    videoId: 'XWq5kBlakcQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=XWq5kBlakcQ',
  },
  {
    id: 'cnbc',
    label: 'CNBC',
    flag: '💹',
    session: '24/7 MARKETS',
    color: '#f7931a',
    videoId: 'OiFiIZT57tI',
    youtubeUrl: 'https://www.youtube.com/watch?v=OiFiIZT57tI',
  },
];

function TVFrame({
  channel,
  muted,
  onToggleMute,
  big = false,
}: {
  channel: Channel;
  muted: boolean;
  onToggleMute: () => void;
  big?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const goFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const embedSrc = [
    `https://www.youtube-nocookie.com/embed/${channel.videoId}`,
    `?autoplay=1`,
    `&mute=${muted ? 1 : 0}`,
    `&controls=1`,
    `&modestbranding=1`,
    `&rel=0`,
    `&playsinline=1`,
    `&enablejsapi=1`,
  ].join('');

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
        border: `1px solid ${channel.color}30`,
      }}
    >
      <iframe
        src={embedSrc}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title={channel.label}
        loading="lazy"
      />

      {/* Bottom overlay bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '4px 8px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          pointerEvents: 'none', // pass clicks through to iframe except buttons
        }}
      >
        {/* Channel label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: channel.color,
            boxShadow: `0 0 6px ${channel.color}`,
            animation: 'pulse 2s infinite',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: big ? 10 : 8,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 0.5,
          }}>
            {channel.flag} {channel.label}
          </span>
          <span style={{
            fontSize: big ? 9 : 7,
            color: channel.color,
            letterSpacing: 0.3,
            fontWeight: 600,
          }}>
            ◉ {channel.session}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 4, pointerEvents: 'all' }}>
          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            title={muted ? 'Click to unmute' : 'Click to mute'}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${muted ? 'rgba(255,255,255,0.2)' : channel.color}`,
              borderRadius: 3, cursor: 'pointer',
              fontSize: big ? 14 : 10,
              padding: '2px 6px',
              color: muted ? 'rgba(255,255,255,0.4)' : channel.color,
              lineHeight: 1,
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Fullscreen */}
          <button
            onClick={goFullscreen}
            title="Fullscreen"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3, cursor: 'pointer',
              fontSize: big ? 14 : 10,
              padding: '2px 6px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1,
            }}
          >
            ⛶
          </button>

          {/* Open in YouTube (fallback) */}
          <a
            href={channel.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on YouTube"
            style={{
              background: 'rgba(255,0,0,0.5)',
              border: '1px solid rgba(255,0,0,0.4)',
              borderRadius: 3, cursor: 'pointer',
              fontSize: big ? 11 : 8,
              padding: '2px 6px',
              color: 'white',
              textDecoration: 'none',
              lineHeight: 1,
              display: 'flex', alignItems: 'center',
            }}
          >
            ▶ YT
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TVWallPanel() {
  const [muted, setMuted] = useState<Record<string, boolean>>({
    bloomberg: false, // Bloomberg unmuted by default
    yahoo: true,
    skynews: true,
    cna: true,
    cnbc: true,
  });

  const toggleMute = (id: string) => {
    setMuted(prev => {
      if (!prev[id]) {
        // Currently this channel is unmuted (true = muted)
        // We are MUTING it
        return { ...prev, [id]: true };
      }
      // We are UNMUTING this channel — mute all others
      const allMuted: Record<string, boolean> = {};
      CHANNELS.forEach(c => { allMuted[c.id] = true; });
      allMuted[id] = false;
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
      background: '#0a0a0f',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Main Bloomberg TV — 62% width */}
      <div style={{ flex: '0 0 62%', height: '100%' }}>
        <TVFrame
          channel={bloomberg}
          muted={muted[bloomberg.id]}
          onToggleMute={() => toggleMute(bloomberg.id)}
          big
        />
      </div>

      {/* 4 Small Channels — 2×2 grid */}
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
