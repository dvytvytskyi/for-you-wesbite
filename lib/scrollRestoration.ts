/**
 * Utility functions for saving and restoring scroll position
 * when navigating to/from property detail pages
 */

const STORAGE_KEY = 'properties_list_scroll_state';

export interface ScrollState {
  scrollPosition: number;
  currentPage: number;
  timestamp: number;
}

/**
 * Save scroll position and page number before navigating to property detail
 */
export function saveScrollState(page: number): void {
  if (typeof window === 'undefined') return;
  
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;
  const state: ScrollState = {
    scrollPosition,
    currentPage: page,
    timestamp: Date.now(),
  };
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {}
}

/**
 * Restore scroll position and return saved page number
 */
export function restoreScrollState(): { page: number; scrollPosition: number } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state: ScrollState = JSON.parse(stored);
    
    // Only restore if state is recent (within 5 minutes)
    const isRecent = Date.now() - state.timestamp < 5 * 60 * 1000;
    if (!isRecent) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    // Restore scroll position after a short delay to ensure page is rendered
    setTimeout(() => {
      window.scrollTo({
        top: state.scrollPosition,
        behavior: 'auto', // Use 'auto' for instant scroll, not 'smooth'
      });
    }, 100);
    
    return {
      page: state.currentPage,
      scrollPosition: state.scrollPosition,
    };
  } catch (error) {sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Clear saved scroll state
 */
export function clearScrollState(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {}
}

