'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface Channel {
  id: string;
  label: string;
  flag: string;
  session: string;
  color: string;
  videoId: string;
}

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
    videoId: '9Auq9mYxFEE', // Sky News confirmed stable 24/7
  },
  {
    id: 'aljaz',
    label: 'Al Jazeera',
    flag: '🇸🇬',
    session: 'ASIA · GLOBAL',
    color: '#e63946',
    videoId: 'nGTQmAbmEAQ', // Al Jazeera — most reliable 24/7 embed
  },
  {
    id: 'france24',
    label: 'France 24',
    flag: '🇫🇷',
    session: 'EUROPE · EUR',
    color: '#2dc6a0',
    videoId: 'h3MuIUNCRNk', // France 24 — reliable embed, no EU/ECB missed
  },
];

// Send YouTube iframe API command via postMessage
function sendCmd(iframe: HTMLIFrameElement, func: string, args: unknown[] = []) {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args }),
    '*'
  );
}

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(true);

  // Apply mute/unmute via postMessage (not URL change — avoids reload)
  useEffect(() => {
    if (!iframeRef.current) return;
    sendCmd(iframeRef.current, muted ? 'mute' : 'unMute');
  }, [muted]);

  const togglePlay = useCallback(() => {
    if (!iframeRef.current) return;
    if (playing) {
      sendCmd(iframeRef.current, 'pauseVideo');
    } else {
      sendCmd(iframeRef.current, 'playVideo');
    }
    setPlaying(p => !p);
  }, [playing]);

  const goFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.requestFullscreen?.();
  }, []);

  // Build embed URL — controls=0 hides ALL YouTube UI
  const src = [
    `https://www.youtube-nocookie.com/embed/${channel.videoId}`,
    `?autoplay=1`,
    `&mute=${muted ? 1 : 0}`,
    `&controls=0`,           // ← no YouTube controls at all
    `&modestbranding=1`,
    `&rel=0`,
    `&showinfo=0`,
    `&iv_load_policy=3`,    // no annotations
    `&disablekb=1`,          // disable keyboard shortcuts
    `&playsinline=1`,
    `&enablejsapi=1`,        // required for postMessage commands
    `&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`,
    `&loop=1&playlist=${channel.videoId}`, // loop so it never stops
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
        border: `1px solid ${channel.color}40`,
      }}
    >
      {/* Scale the iframe UP to hide the YouTube watermark at bottom-right */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}>
        <iframe
          ref={iframeRef}
          src={src}
          style={{
            position: 'absolute',
            top: '-5%',
            left: '-5%',
            width: '110%',
            height: '110%',
            border: 'none',
            pointerEvents: 'none', // block all YouTube link clicks (no YT links visible)
          }}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          title={channel.label}
        />
      </div>

      {/* Glass overlay — captures mouse so no YouTube links are clickable */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }} />

      {/* Bottom control bar — sits above the glass overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '4px 8px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          zIndex: 3,
        }}
      >
        {/* Channel label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: channel.color,
            boxShadow: `0 0 5px ${channel.color}`,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: big ? 10 : 8, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            {channel.flag} {channel.label}
          </span>
          <span style={{ fontSize: big ? 8 : 7, color: channel.color, fontWeight: 600 }}>
            ◉ {channel.session}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3, cursor: 'pointer',
              fontSize: big ? 13 : 10, padding: '2px 7px', color: '#fff', lineHeight: 1,
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={onToggleMute}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: `1px solid ${muted ? 'rgba(255,255,255,0.15)' : channel.color}`,
              borderRadius: 3, cursor: 'pointer',
              fontSize: big ? 13 : 10, padding: '2px 7px',
              color: muted ? 'rgba(255,255,255,0.4)' : channel.color, lineHeight: 1,
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Fullscreen */}
          <button
            onClick={goFullscreen}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3, cursor: 'pointer',
              fontSize: big ? 12 : 9, padding: '2px 7px', color: '#fff', lineHeight: 1,
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
  const [muted, setMuted] = useState<Record<string, boolean>>({
    bloomberg: false,
    yahoo: true,
    skynews: true,
    aljaz: true,
    france24: true,
  });

  const toggleMute = (id: string) => {
    setMuted(prev => {
      if (!prev[id]) {
        // Currently unmuted — mute it
        return { ...prev, [id]: true };
      }
      // Unmuting this one — mute all others
      const all: Record<string, boolean> = {};
      CHANNELS.forEach(c => { all[c.id] = true; });
      all[id] = false;
      return all;
    });
  };

  const [bloomberg, ...smallChannels] = CHANNELS;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', gap: 4, padding: 4,
      background: '#060608', boxSizing: 'border-box', overflow: 'hidden',
    }}>
      {/* Bloomberg — big (62%) */}
      <div style={{ flex: '0 0 62%', height: '100%' }}>
        <TVFrame channel={bloomberg} muted={muted.bloomberg} onToggleMute={() => toggleMute('bloomberg')} big />
      </div>

      {/* 4 small channels — 2×2 grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4 }}>
        {smallChannels.map(ch => (
          <TVFrame key={ch.id} channel={ch} muted={muted[ch.id]} onToggleMute={() => toggleMute(ch.id)} />
        ))}
      </div>
    </div>
  );
}
