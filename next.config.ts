import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          // Prevent clickjacking — nobody can embed this site in an iframe
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Stop browsers from MIME-sniffing a response away from the declared content-type
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Only send origin on same-site requests, strip referrer for cross-site
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable features that terminal doesn't need — camera, mic, geolocation
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          // Strict Transport Security — force HTTPS for 1 year
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Content Security Policy:
          // - scripts from self + TradingView CDN only
          // - WebSocket to Finnhub, Supabase realtime
          // - Frames from TradingView (chart widget)
          // - Fonts from Google Fonts
          // - Images from anywhere (logos, news thumbnails)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://s3.tradingview.com https://cdn.tradingview.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' wss://ws.finnhub.io https://finnhub.io wss://fstream.binance.com https://*.supabase.co wss://*.supabase.co https://api.alternative.me https://forexlive.com https://cointelegraph.com https://investing.com https://sslecal2.investing.com",
              "frame-src 'self' https://s.tradingview.com https://s3.tradingview.com https://www.tradingview.com https://sslecal2.investing.com https://www.youtube-nocookie.com",
              "media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com blob:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
