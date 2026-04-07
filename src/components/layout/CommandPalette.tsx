'use client';

import { useState, useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/marketStore';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { setSelectedSymbol } = useMarketStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open on '/' or 'Ctrl/Cmd + K'
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        (e.key === 'k' && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = query.trim().toUpperCase();
    
    // Command Parser
    if (cmd.startsWith('/CHART ') || cmd.startsWith('/C ')) {
      const parts = cmd.split(' ');
      if (parts[1]) {
        setSelectedSymbol(parts[1]);
      }
    } else if (cmd.length >= 2 && cmd.length <= 8 && !cmd.includes('/')) {
      // Just typing a symbol directly: "AAPL", "EURUSD"
      setSelectedSymbol(cmd);
    }
    
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 600,
          background: '#060608',
          border: '1px solid #333',
          borderRadius: 8,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #222' }}>
          <span style={{ color: '#44ff88', marginRight: 12, fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>❯</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command (e.g. /chart AAPL) or a symbol..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 16,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />
        </form>
        
        <div style={{ padding: '8px 0', background: '#0a0a0c' }}>
          <div style={{ padding: '4px 16px', fontSize: 10, color: 'var(--text-ghost)', letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>AVAILABLE COMMANDS</div>
          
          <div className="command-hint" style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font-mono)' }}><span style={{ color: '#fff' }}>/chart</span> [SYMBOL]</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Switch main chart and order flow</span>
          </div>
          
          <div className="command-hint" style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font-mono)' }}><span style={{ color: '#fff' }}>[SYMBOL]</span></span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Instant symbol switch (e.g., EURUSD)</span>
          </div>
          
          <div className="command-hint" style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font-mono)' }}><span style={{ color: '#fff' }}>/theme</span> dark|light</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Toggle UI appearance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
