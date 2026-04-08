'use client';

import { useRef, useState, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';

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
    videoId: 'YDvsBbKfLPA',
  },
  {
    id: 'aljazeera',
    label: 'Al Jazeera',
    flag: '🇶🇦',
    session: 'MIDDLE EAST · FX',
    color: '#e63946',
    videoId: 'gCNeDWCI0vo',
  },
  {
    id: 'cna',
    label: 'CNA News',
    flag: '🇸🇬',
    session: 'ASIA PACIFIC · SGD',
    color: '#e63946',
    videoId: 'XWq5kBlakcQ',
  },
];

function buildSrc(videoId: string, muted: boolean): string {
  // Cache-bust with timestamp to force YouTube to reconnect to live edge
  const bust = Date.now();
  const params = [
    `autoplay=1`,
    `mute=${muted ? 1 : 0}`,
    `controls=0`,
    `modestbranding=1`,
    `rel=0`,
    `showinfo=0`,
    `disablekb=1`,
    `iv_load_policy=3`,
    `playsinline=1`,
    `enablejsapi=1`,
    `loop=1&playlist=${videoId}`,
    `start=0`,
    `_=${bust}`,        // forces fresh HTTP request → live edge reconnect
  ].join('&');
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

function TVFrame({
  channel,
  big = false,
  startsMuted = true,
}: {
  channel: Channel;
  big?: boolean;
  startsMuted?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeKey, setIframeKey] = useState(0);   // incrementing key forces full remount
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(startsMuted);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send postMessage to YouTube player
  const postMsg = useCallback((func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
  }, []);

  const handlePause = useCallback(() => {
    postMsg('pauseVideo');
    setIsPlaying(false);
  }, [postMsg]);

  // KEY FIX: When playing after a pause, we do NOT call playVideo via postMessage.
  // Instead we force the entire iframe to remount with a fresh src (cache busted),
  // which makes YouTube reconnect to the live stream's current edge position.
  // This is the only reliable way to jump back to live on YouTube live embeds.
  const handleGoLive = useCallback(() => {
    setIframeKey(k => k + 1); // triggers iframe remount → fresh embed → live edge
    setIsPlaying(true);
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) postMsg('unMute');
    else postMsg('mute');
    setIsMuted(m => !m);
  }, [isMuted, postMsg]);

  const goFullscreen = useCallback(() => {
    containerRef.current?.requestFullscreen?.();
  }, []);

  const src = buildSrc(channel.videoId, isMuted);

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
      className="group"
    >
      <iframe
        key={iframeKey}          // new key = full remount = live edge reconnect
        ref={iframeRef}
        src={src}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          pointerEvents: 'none', // prevent accidental click-pause on the video
        }}
        allow="autoplay; encrypted-media; fullscreen"
        title={channel.label}
      />

      {/* Top-left: Channel Badge */}
      <div
        style={{
          position: 'absolute',
          top: 6, left: 6,
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(0,0,0,0.7)',
          padding: '3px 7px', borderRadius: 3,
          backdropFilter: 'blur(4px)',
          zIndex: 10,
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
      </div>

      {/* Top-right: LIVE badge */}
      <div style={{
        position: 'absolute', top: 6, right: 6,
        background: '#e63946', color: '#fff',
        fontSize: 7, fontWeight: 800, letterSpacing: 1,
        padding: '2px 5px', borderRadius: 2,
        display: 'flex', alignItems: 'center', gap: 3,
        zIndex: 10,
        opacity: isPlaying ? 1 : 0.4,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
        LIVE
      </div>

      {/* Bottom control bar — always visible on mobile, hover on desktop */}
      <div
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 36,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          zIndex: 20,
          gap: 6,
        }}
      >
        {/* Left: Pause / Go Live button */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {isPlaying ? (
            <button
              onClick={handlePause}
              title="Pause"
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, padding: 4 }}
            >
              ⏸
            </button>
          ) : (
            // When paused: show a "GO LIVE" button instead of plain play.
            // Clicking it reloads the iframe so YouTube snaps to the live edge.
            <button
              onClick={handleGoLive}
              title="Go to Live edge"
              style={{
                background: '#e63946',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 8,
                fontWeight: 800,
                padding: '3px 7px',
                borderRadius: 3,
                letterSpacing: 0.5,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              GO LIVE
            </button>
          )}
        </div>

        {/* Right: Mute + Fullscreen */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={toggleMute}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, padding: 4 }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={goFullscreen}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, padding: 4 }}
          >
            ⛶
          </button>
        </div>
      </div>
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
      {/* Bloomberg — big (62%), starts UNMUTED */}
      <div style={{ flex: '0 0 62%', height: '100%' }}>
        <TVFrame channel={bloomberg} big startsMuted={false} />
      </div>

      {/* 4 small — 2×2 grid, all start MUTED */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 4,
      }}>
        {smallChannels.map(ch => (
          <TVFrame key={ch.id} channel={ch} startsMuted={true} />
        ))}
      </div>
    </div>
  );
}
