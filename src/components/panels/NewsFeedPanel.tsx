'use client';

import { useEffect, useState } from 'react';
import { Panel, PanelHeader, PanelContent, LiveBadge, CachedBadge, PhaseBadge, TabBar } from '@/components/ui/Panel';
import { useNewsStore, NewsArticle } from '@/store/newsStore';
import { NEWS_FEED } from '@/lib/mockData';

const TABS = ['ALL', 'MARKETS', 'FOREX', 'CRYPTO', 'EARNINGS', 'MACRO', 'AFRICA'];

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NewsFeedPanel() {
  const [activeTab, setActiveTab] = useState('ALL');
  const { articles, isRealtimeConnected, initializeRealtime } = useNewsStore();

  useEffect(() => {
    initializeRealtime();
  }, [initializeRealtime]);

  // Use live Supabase articles if available, otherwise fall back to mock
  const source: NewsArticle[] = articles.length > 0
    ? articles
    : NEWS_FEED.map(n => ({
        source: n.source,
        category: n.category.toLowerCase(),
        headline: n.headline,
        summary: '',
        url: '#',
        phase: n.phase,
        published_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      }));

  const filtered = activeTab === 'ALL'
    ? source
    : source.filter(n => n.category.toUpperCase() === activeTab);

  return (
    <Panel>
      <PanelHeader
        title="Market News"
        count={filtered.length}
        badge={isRealtimeConnected ? <LiveBadge /> : <CachedBadge label="5m" />}
      />
      <TabBar tabs={TABS} active={activeTab} onSelect={setActiveTab} />
      <PanelContent noPad>
        <div>
          {filtered.map((article, i) => (
            <a
              key={article.url + i}
              href={article.url !== '#' ? article.url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid var(--border-subtle)',
                  borderLeft: article.phase === 'ALERT' ? '2px solid #ff4444' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--overlay-subtle)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <PhaseBadge phase={article.phase as 'ALERT' | 'DEVELOPING' | 'SUSTAINED'} />
                  <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 0.5 }}>
                    {article.source.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      padding: '1px 4px',
                      borderRadius: 2,
                      background: 'var(--border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {article.category.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text-ghost)', marginLeft: 'auto' }}>
                    {timeAgo(article.published_at)}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--text)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {article.headline}
                </p>
                {article.summary && (
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.4 }}>
                    {article.summary.slice(0, 120)}{article.summary.length > 120 ? '…' : ''}
                  </p>
                )}
              </div>
            </a>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 11 }}>
              No articles in this category yet.
            </div>
          )}
        </div>
      </PanelContent>
    </Panel>
  );
}
