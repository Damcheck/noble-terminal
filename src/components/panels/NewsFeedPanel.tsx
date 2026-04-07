'use client';

import { useEffect, useState, useCallback } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, TabBar } from '@/components/ui/Panel';

const TABS = ['ALL', 'FOREX', 'CRYPTO', 'MARKETS', 'NEWS'];

const SOURCE_COLORS: Record<string, string> = {
  ForexLive: '#44ff88',
  CoinTelegraph: '#f7931a',
  'Investing.com': '#00a0e9',
};

const CATEGORY_COLORS: Record<string, string> = {
  Forex: '#44ff88',
  Crypto: '#f7931a',
  Markets: '#00a0e9',
  News: '#a0a0b0',
};

interface RSSArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  category: string;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function NewsFeedPanel() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/rss/news', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setArticles(data.articles ?? []);
      setLastFetch(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    // Refresh every 60 seconds — ForexLive pushes headlines instantly
    const id = setInterval(fetchNews, 60_000);
    return () => clearInterval(id);
  }, [fetchNews]);

  const filtered = activeTab === 'ALL'
    ? articles
    : articles.filter(a => a.category.toUpperCase() === activeTab || a.source.toUpperCase().includes(activeTab));

  const secondsAgoFetch = lastFetch ? Math.floor((Date.now() - lastFetch.getTime()) / 1000) : null;

  return (
    <Panel>
      <PanelHeader
        title="Live News · RSS"
        count={filtered.length}
        badge={
          !loading
            ? <LiveBadge />
            : <span style={{ fontSize: 8, color: 'var(--text-ghost)' }}>Loading…</span>
        }
      />
      <TabBar tabs={TABS} active={activeTab} onSelect={setActiveTab} />
      {secondsAgoFetch !== null && (
        <div style={{
          fontSize: 8, color: 'var(--text-ghost)', padding: '2px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', gap: 8,
        }}>
          <span>ForexLive · CoinTelegraph · Investing.com</span>
          <span style={{ marginLeft: 'auto' }}>Updated {secondsAgoFetch}s ago</span>
        </div>
      )}
      <PanelContent>
        {loading && (
          <div style={{ padding: 16, color: 'var(--text-ghost)', fontSize: 10, textAlign: 'center' }}>
            Fetching live feeds…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 16, color: 'var(--text-ghost)', fontSize: 10, textAlign: 'center' }}>
            No articles found
          </div>
        )}
        {filtered.map((article, i) => {
          const color = SOURCE_COLORS[article.source] || '#a0a0b0';
          const catColor = CATEGORY_COLORS[article.category] || '#a0a0b0';
          return (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '6px 8px',
                borderBottom: '1px solid var(--border-subtle)',
                textDecoration: 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--overlay-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
            >
              {/* Source + time row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <span style={{
                  fontSize: 7, fontWeight: 700, color,
                  background: `${color}16`, border: `1px solid ${color}30`,
                  padding: '1px 4px', borderRadius: 2, letterSpacing: 0.3,
                }}>
                  {article.source}
                </span>
                <span style={{
                  fontSize: 7, color: catColor,
                  background: `${catColor}10`, border: `1px solid ${catColor}20`,
                  padding: '1px 4px', borderRadius: 2,
                }}>
                  {article.category}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 7, color: 'var(--text-ghost)' }}>
                  {timeAgo(article.pubDate)}
                </span>
              </div>
              {/* Headline */}
              <div style={{
                fontSize: 10, color: 'var(--text)', lineHeight: 1.4,
                fontWeight: 500,
              }}>
                {article.title}
              </div>
            </a>
          );
        })}
      </PanelContent>
    </Panel>
  );
}
