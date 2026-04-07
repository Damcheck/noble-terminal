import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

export interface NewsArticle {
  id?: string;
  source: string;
  category: string;
  headline: string;
  summary: string;
  url: string;
  image_url?: string;
  phase: string;
  sentiment?: number;
  published_at: string;
}

interface NewsState {
  articles: NewsArticle[];
  isRealtimeConnected: boolean;
  initializeRealtime: () => void;
  setInitialArticles: (articles: NewsArticle[]) => void;
  addArticle: (article: NewsArticle) => void;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  isRealtimeConnected: false,

  setInitialArticles: (articles: NewsArticle[]) => {
    set({ articles });
  },

  addArticle: (article: NewsArticle) => {
    set(state => {
      // Check if it already exists
      const exists = state.articles.find(a => a.headline === article.headline);
      if (exists) return state;
      // Add and sort by date descending
      const newArticles = [article, ...state.articles].sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
      return { articles: newArticles };
    });
  },

  initializeRealtime: () => {
    if (get().isRealtimeConnected) return;
    set({ isRealtimeConnected: true }); // Sync lock to prevent React StrictMode double-fire

    // Initial fetch
    supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) {
          get().setInitialArticles(data as NewsArticle[]);
        }
      });

    // Realtime channel
    const channel = supabase.channel('news-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'news' },
        (payload) => {
          if (payload.new) {
            get().addArticle(payload.new as NewsArticle);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ isRealtimeConnected: true });
        }
      });
  }
}));
