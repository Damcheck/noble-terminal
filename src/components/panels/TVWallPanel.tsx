'use client';

import { useRef, useState } from 'react';
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
    videoId: 'TvYc8RWJSAg', // new 24/7 official ID
  },
  {
    id: 'aljazeera',
    label: 'Al Jazeera',
    flag: '🇶🇦',
    session: 'MIDDLE EAST · FX',
    color: '#e63946',
    videoId: 'gCNeDWCI0vo', // new 24/7 official ID
  },
  {
    id: 'france24',
    label: 'France 24',
    flag: '🇫🇷',
    session: 'EUROPE · EUR',
    color: '#2dc6a0',
    videoId: 'h3MuIUNCRNk', // Standard 24/7 ID
  },
];

function TVFrame({ channel, big = false, startsMuted = true }: { channel: Channel; big?: boolean; startsMuted?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(startsMuted);

  // Send commands to YouTube's player API via postMessage
  const postMsg = (func: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: [] }),
        '*'
      );
    }
  };

  const togglePlay = () => {
    if (isPlaying) postMsg('pauseVideo');
    else postMsg('playVideo');
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (isMuted) postMsg('unMute');
    else postMsg('mute');
    setIsMuted(!isMuted);
  };

  const goFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // We set controls=0 so YouTube's UI doesn't show at all.
  // We use enablejsapi=1 so postMessage works.
  const params = [
    `autoplay=1`,
    `mute=${startsMuted ? 1 : 0}`,
    `controls=0`,          // completely hidden
    `modestbranding=1`,    // no logo
    `rel=0`,
    `showinfo=0`,
    `disablekb=1`,         // disable keyboard shortcuts when focused
    `iv_load_policy=3`,
    `playsinline=1`,
    `enablejsapi=1`,       // REQUIRED for postMessage
    `loop=1&playlist=${channel.videoId}`
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
        // Prevent clicking directly on the iframe (blocks clicking to go to YouTube)
        // But our custom buttons stay clickable because they sit above this container
      }}
      className="group" // allows hover effects on controls
    >
      <iframe
        ref={iframeRef}
        src={src}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none', 
          display: 'block',
          pointerEvents: 'none' // completely prevents clicking the video and pausing/navigating
        }}
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        title={channel.label}
      />

      {/* Top-left: Channel Badge */}
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

      {/* Custom Control Bar overlay - appears on hover */}
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          zIndex: 20,
        }}
      >
        {/* Play/Pause */}
        <button 
          onClick={togglePlay}
          style={{ 
            background: 'none', border: 'none', color: '#fff', 
            cursor: 'pointer', fontSize: 14, padding: 4 
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* Mute/Unmute */}
          <button 
            onClick={toggleMute}
            style={{ 
              background: 'none', border: 'none', color: '#fff', 
              cursor: 'pointer', fontSize: 13, padding: 4 
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          {/* Fullscreen */}
          <button 
            onClick={goFullscreen}
            style={{ 
              background: 'none', border: 'none', color: '#fff', 
              cursor: 'pointer', fontSize: 13, padding: 4 
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
