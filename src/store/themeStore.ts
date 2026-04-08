import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  initializeTheme: () => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark', // default
  initializeTheme: () => {
    // 1. Check strict localStorage override
    const stored = typeof window !== 'undefined' ? localStorage.getItem('noble-theme') : null;
    
    // 2. Check OS media preference
    const prefersLight = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: light)').matches : false;
    
    // Default priority: LocalStorage > OS Pref > Dark
    const activeTheme = (stored as Theme) || (prefersLight ? 'light' : 'dark');
    
    set({ theme: activeTheme });

    // Instantly inject or remove the class from HTML to override CSS routing
    if (activeTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  },
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    
    // Save state explicitly
    if (typeof window !== 'undefined') {
      localStorage.setItem('noble-theme', newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
    
    return { theme: newTheme };
  })
}));
