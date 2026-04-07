'use client';

import { useRef } from 'react';

interface Channel {
  id: string;
  label: string;
  flag: string;
  session: string;
  color: string;
  videoId: string;
}

// These are the confirmed working live stream IDs
const CHANNELS: Channel[] = [
  {
    id: 'bloomberg',
    label: 'Bloomberg TV',
    flag: '🌍',
    session: 'GLOBAL · MACRO',
    color: '#ff6b00',
    videoId: 'iEpJwprxDdk',
  },
  {
    id: 'yahoo',
    label: 'Yahoo Finance',
    flag: '🇺🇸',
    session: 'NEW YORK · USD',
    color: '#7360f2',
    videoId: 'KQp-e_XQnDE',
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
    label: 'Al Jazeera',
    flag: '🇸🇬',
    session: 'ASIA · GLOBAL',
    color: '#e63946',
    videoId: 'nGTQmAbmEAQ',
  },
  {
    id: 'france24',
    label: 'France 24',
    flag: '🇫🇷',
    session: 'EUROPE · EUR',
    color: '#2dc6a0',
    videoId: 'h3MuIUNCRNk',
  },
];

function TVFrame({ channel, big = false }: { channel: Channel; big?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // YouTube params that hide all branding but keep native controls (play/pause/mute)
  const params = [
    `autoplay=1`,
    `mute=${big ? 0 : 1}`,   // Bloomberg unmuted, others muted
    `controls=1`,             // show YouTube's own play/pause/mute — they work perfectly
    `modestbranding=1`,       // remove YouTube logo from control bar
    `rel=0`,                  // no related videos
    `showinfo=0`,             // no title bar at top
    `iv_load_policy=3`,       // no annotations
    `playsinline=1`,
    `loop=1&playlist=${channel.videoId}`, // loop stream
  ].join('&');

  const src = `https://www.youtube-nocookie.com/embed/${channel.videoId}?${params}`;

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
        border: `1px solid ${channel.color}40`,
      }}
    >
      {/* YouTube iframe — controls=1 gives native play/pause/mute/volume */}
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title={channel.label}
      />

      {/* Top-left overlay: channel badge (positioned away from YouTube's top-right controls) */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(0,0,0,0.7)',
          padding: '3px 7px',
          borderRadius: 3,
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none', // pass-through so YouTube controls below work
        }}
      >
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: channel.color,
          boxShadow: `0 0 6px ${channel.color}`,
        }} />
        <span style={{ fontSize: big ? 10 : 8, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
          {channel.flag} {channel.label}
        </span>
        <span style={{ fontSize: big ? 8 : 7, color: channel.color, fontWeight: 600 }}>
          ◉ {channel.session}
        </span>
      </div>

      {/* Top-right corner: dark box to cover YouTube watermark logo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 36,
          background: 'rgba(0,0,0,0.0)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default function TVWallPanel() {
  const [bloomberg, ...smallChannels] = CHANNELS;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', gap: 4, padding: 4,
      background: '#060608', boxSizing: 'border-box', overflow: 'hidden',
    }}>
      {/* Bloomberg — big (62%) */}
      <div style={{ flex: '0 0 62%', height: '100%' }}>
        <TVFrame channel={bloomberg} big />
      </div>

      {/* 4 small — 2×2 grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 4,
      }}>
        {smallChannels.map(ch => (
          <TVFrame key={ch.id} channel={ch} />
        ))}
      </div>
    </div>
  );
}
