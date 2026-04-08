import { NextResponse } from 'next/server';

// force-dynamic: never cache the route handler itself at the Edge layer.
// Individual feed fetch() calls use `next: { revalidate: 60 }` for ISR caching.
export const dynamic = 'force-dynamic';

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  category: string;
}

const FEEDS = [
  {
    url: 'https://www.forexlive.com/feed/forex',
    source: 'ForexLive',
    category: 'Forex',
  },
  {
    url: 'https://cointelegraph.com/rss',
    source: 'CoinTelegraph',
    category: 'Crypto',
  },
  {
    url: 'https://www.investing.com/rss/news_285.rss',
    source: 'Investing.com',
    category: 'Markets',
  },
  {
    url: 'https://www.forexlive.com/feed/news',
    source: 'ForexLive',
    category: 'News',
  },
];

function extractText(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i').exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
  if (plainMatch) return plainMatch[1].replace(/<[^>]+>/g, '').trim();
  return '';
}

function parseItems(xml: string, source: string, category: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  for (const match of itemMatches.slice(0, 15)) {
    const block = match[1];
    const title = extractText(block, 'title');
    const link = extractText(block, 'link');
    const pubDate = extractText(block, 'pubDate');
    const description = extractText(block, 'description');
    if (title) {
      items.push({ title, link, pubDate, description: description.slice(0, 200), source, category });
    }
  }
  return items;
}

export async function GET() {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ url, source, category }) => {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Noble-Terminal/1.0 RSS Reader' },
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 60 },
      });
      if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`);
      const xml = await res.text();
      return parseItems(xml, source, category);
    })
  );

  const allItems: RSSItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value);
  }

  // Sort by date (newest first)
  allItems.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  return NextResponse.json({ articles: allItems.slice(0, 50), ts: Date.now() });
}
