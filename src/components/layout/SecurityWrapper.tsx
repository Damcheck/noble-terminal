'use client';

import { useEffect } from 'react';

export default function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable DevTools Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') e.preventDefault();
      if ((e.ctrlKey && e.shiftKey && ['I','C','J'].includes(e.key)) || 
          (e.metaKey && e.altKey && ['i','c','j'].includes(e.key))) {
        e.preventDefault();
      }
      if ((e.ctrlKey && e.key === 'U') || (e.metaKey && e.key === 'u')) {
        e.preventDefault();
      }
    };

    // 3. Disable Dragging of Images/Assets
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      window.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('dragstart', handleDragStart);
    }

    // Cleanup only removes what was actually attached
    return () => {
      if (isProd) {
        window.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('dragstart', handleDragStart);
      }
    };
  }, []);

  const isProd = process.env.NODE_ENV === 'production';

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        // Only disable text selection in production — dev needs copy-paste
        userSelect: isProd ? 'none' : undefined,
        WebkitUserSelect: isProd ? 'none' : undefined,
      }}
    >
      {children}
    </div>
  );
}
