'use client';

import { useEffect, useState, useRef, startTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { setNavigationProgressCallback } from '@/lib/navigationHandler';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathnameRef = useRef(pathname);

  // Register callback for programmatic navigation
  useEffect(() => {
    setNavigationProgressCallback(() => {
      startTransition(() => {
        if (!loading) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          
          setLoading(true);
          setProgress(0);
          progressRef.current = 0;
          
          intervalRef.current = setInterval(() => {
            if (progressRef.current < 70) {
              progressRef.current += 15;
            } else if (progressRef.current < 90) {
              progressRef.current += 5;
            } else {
              progressRef.current = 90;
            }
            setProgress(progressRef.current);
          }, 50);
        }
      });
    });
  }, [loading]);

  useEffect(() => {
    // Start loading immediately on any link click - use capture phase for earliest detection
    const handleLinkClick = (e: MouseEvent) => {
      // Check if this is a navigation event
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = link.getAttribute('href');
        // Only handle internal links (not external or anchor links)
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          // Use startTransition for immediate UI update
          startTransition(() => {
            // Clear any existing intervals/timeouts
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            setLoading(true);
            setProgress(0);
            progressRef.current = 0;
            
            // Start progress animation immediately - faster initial progress
            intervalRef.current = setInterval(() => {
              if (progressRef.current < 70) {
                progressRef.current += 15; // Faster initial progress
              } else if (progressRef.current < 90) {
                progressRef.current += 5;
              } else {
                progressRef.current = 90; // Hold at 90% until page loads
              }
              setProgress(progressRef.current);
            }, 50); // Optimized interval
          });
        }
      }
    };

    // Also listen for router navigation events by watching for navigation start
    const handleNavigationStart = () => {
      startTransition(() => {
        if (!loading) {
          setLoading(true);
          setProgress(0);
          progressRef.current = 0;
          
          intervalRef.current = setInterval(() => {
            if (progressRef.current < 70) {
              progressRef.current += 15;
            } else if (progressRef.current < 90) {
              progressRef.current += 5;
            } else {
              progressRef.current = 90;
            }
            setProgress(progressRef.current);
          }, 50);
        }
      });
    };

    // Listen for all clicks on the document - use capture phase
    document.addEventListener('click', handleLinkClick, true);
    
    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleNavigationStart);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handleNavigationStart);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading]);

  useEffect(() => {
    // Detect pathname change (navigation completed)
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      
      if (loading) {
        // Clear existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Complete progress immediately
        setProgress(100);
        progressRef.current = 100;
        
        // Hide immediately after completion
        timeoutRef.current = setTimeout(() => {
          setLoading(false);
          setProgress(0);
          progressRef.current = 0;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }, 50);
      }
    }
  }, [pathname, searchParams, loading]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        backgroundColor: 'transparent',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#003077',
          transition: 'width 0.1s ease-out',
          boxShadow: '0 0 10px rgba(0, 48, 119, 0.5)',
        }}
      />
    </div>
  );
}

