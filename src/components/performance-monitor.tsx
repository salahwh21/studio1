'use client';

import { useEffect } from 'react';

/**
 * Performance monitoring component
 * Tracks and logs performance metrics in development
 */
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    // Monitor page load performance
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎨 LCP:', lastEntry.startTime.toFixed(2), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log('⚡ FID:', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        console.log('📐 CLS:', clsScore.toFixed(4));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Navigation Timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            console.log('📊 Performance Metrics:');
            console.log('  - DNS:', (perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(2), 'ms');
            console.log('  - TCP:', (perfData.connectEnd - perfData.connectStart).toFixed(2), 'ms');
            console.log('  - Request:', (perfData.responseStart - perfData.requestStart).toFixed(2), 'ms');
            console.log('  - Response:', (perfData.responseEnd - perfData.responseStart).toFixed(2), 'ms');
            console.log('  - DOM Interactive:', (perfData.domInteractive - perfData.domContentLoadedEventStart).toFixed(2), 'ms');
            console.log('  - DOM Complete:', (perfData.domComplete - perfData.domInteractive).toFixed(2), 'ms');
            console.log('  - Load Complete:', (perfData.loadEventEnd - perfData.fetchStart).toFixed(2), 'ms');
          }
        }, 0);
      });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return null; // This component doesn't render anything
}
