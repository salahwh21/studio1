/**
 * Simple performance monitoring utility
 */

export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  /**
   * Start measuring performance
   */
  static start(label: string) {
    this.measurements.set(label, performance.now());
  }

  /**
   * End measuring and log result
   */
  static end(label: string, logToConsole = true) {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`No start time found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);

    if (logToConsole) {
      const emoji = duration < 100 ? '⚡' : duration < 500 ? '✅' : '⚠️';
      console.log(`${emoji} ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure async function execution time
   */
  static async measure<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    this.start(label);
    try {
      const result = await fn();
      const duration = this.end(label);
      return { result, duration };
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Log all Web Vitals
   */
  static logWebVitals() {
    if (typeof window === 'undefined') return;

    // Log navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      console.log('📊 Navigation Timing:');
      console.log(`  DNS: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
      console.log(`  TCP: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
      console.log(`  Request: ${(navigation.responseStart - navigation.requestStart).toFixed(2)}ms`);
      console.log(`  Response: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
      console.log(`  DOM: ${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`);
      console.log(`  Load: ${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`);
      console.log(`  Total: ${navigation.loadEventEnd.toFixed(2)}ms`);
    }
  }
}

// Auto-log web vitals in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => PerformanceMonitor.logWebVitals(), 0);
  });
}
