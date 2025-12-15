'use client';

// Global navigation handler to show progress immediately
let navigationProgressCallback: (() => void) | null = null;

export function setNavigationProgressCallback(callback: () => void) {
  navigationProgressCallback = callback;
}

export function triggerNavigationProgress() {
  if (navigationProgressCallback) {
    navigationProgressCallback();
  }
}

// Intercept router.push calls
if (typeof window !== 'undefined') {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    triggerNavigationProgress();
    return originalPushState.apply(history, args);
  };

  history.replaceState = function(...args) {
    triggerNavigationProgress();
    return originalReplaceState.apply(history, args);
  };
}

