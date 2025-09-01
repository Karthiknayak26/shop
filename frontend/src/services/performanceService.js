// Performance Monitoring Service for Kandukuru Supermarket
// Tracks Core Web Vitals and other performance metrics

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

class PerformanceService {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.isInitialized = false;
  }

  // Initialize performance monitoring
  init() {
    if (this.isInitialized) return;

    console.log('Initializing Performance Monitoring Service...');

    // Track Core Web Vitals
    this.trackCoreWebVitals();

    // Track custom performance metrics
    this.trackCustomMetrics();

    // Track resource loading performance
    this.trackResourcePerformance();

    // Track user interactions
    this.trackUserInteractions();

    this.isInitialized = true;
    console.log('Performance Monitoring Service initialized');
  }

  // Track Core Web Vitals
  trackCoreWebVitals() {
    // Cumulative Layout Shift (CLS)
    onCLS((metric) => {
      this.metrics.cls = metric;
      this.reportMetric('CLS', metric);
    });

    // First Input Delay (FID)
    onFID((metric) => {
      this.metrics.fid = metric;
      this.reportMetric('FID', metric);
    });

    // First Contentful Paint (FCP)
    onFCP((metric) => {
      this.metrics.fcp = metric;
      this.reportMetric('FCP', metric);
    });

    // Largest Contentful Paint (LCP)
    onLCP((metric) => {
      this.metrics.lcp = metric;
      this.reportMetric('LCP', metric);
    });

    // Time to First Byte (TTFB)
    onTTFB((metric) => {
      this.metrics.ttfb = metric;
      this.reportMetric('TTFB', metric);
    });
  }

  // Track custom performance metrics
  trackCustomMetrics() {
    // Track page load time
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

        this.metrics.pageLoadTime = pageLoadTime;
        this.reportMetric('Page Load Time', pageLoadTime, 'ms');
      });
    }

    // Track DOM content loaded
    if (window.performance && window.performance.timing) {
      window.addEventListener('DOMContentLoaded', () => {
        const timing = window.performance.timing;
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;

        this.metrics.domContentLoaded = domContentLoaded;
        this.reportMetric('DOM Content Loaded', domContentLoaded, 'ms');
      });
    }

    // Track first paint and first meaningful paint
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        this.metrics[entry.name] = entry.startTime;
        this.reportMetric(entry.name, entry.startTime, 'ms');
      });
    }
  }

  // Track resource loading performance
  trackResourcePerformance() {
    if (window.performance && window.performance.getEntriesByType) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.trackResourceEntry(entry);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  // Track individual resource entries
  trackResourceEntry(entry) {
    const resourceMetrics = {
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize || 0,
      type: entry.initiatorType
    };

    // Track slow resources
    if (entry.duration > 1000) {
      this.reportMetric('Slow Resource', resourceMetrics, 'ms', 'warning');
    }

    // Track large resources
    if (entry.transferSize && entry.transferSize > 100000) {
      this.reportMetric('Large Resource', resourceMetrics, 'bytes', 'warning');
    }
  }

  // Track user interactions
  trackUserInteractions() {
    let interactionCount = 0;
    let lastInteractionTime = Date.now();

    const trackInteraction = () => {
      interactionCount++;
      const timeSinceLastInteraction = Date.now() - lastInteractionTime;
      lastInteractionTime = Date.now();

      this.metrics.interactionCount = interactionCount;
      this.metrics.lastInteractionTime = lastInteractionTime;

      // Report if there's a long gap between interactions
      if (timeSinceLastInteraction > 30000) {
        this.reportMetric('Interaction Gap', timeSinceLastInteraction, 'ms', 'info');
      }
    };

    // Track clicks, scrolls, and key presses
    document.addEventListener('click', trackInteraction);
    document.addEventListener('scroll', trackInteraction);
    document.addEventListener('keypress', trackInteraction);
  }

  // Report performance metrics
  reportMetric(name, value, unit = '', level = 'info') {
    const metric = {
      name,
      value,
      unit,
      level,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Store metric
    this.metrics[name] = metric;

    // Log metric
    console.log(`Performance Metric [${level.toUpperCase()}]:`, metric);

    // Send to analytics if configured
    this.sendToAnalytics(metric);

    // Notify observers
    this.notifyObservers(metric);
  }

  // Send metrics to analytics
  sendToAnalytics(metric) {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_unit: metric.unit,
        metric_level: metric.level
      });
    }

    // Custom analytics endpoint
    if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
      fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric)
      }).catch(error => {
        console.error('Failed to send metric to analytics:', error);
      });
    }
  }

  // Add observer for performance events
  addObserver(callback) {
    this.observers.push(callback);
  }

  // Remove observer
  removeObserver(callback) {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // Notify all observers
  notifyObservers(metric) {
    this.observers.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  // Get all metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Get specific metric
  getMetric(name) {
    return this.metrics[name];
  }

  // Get performance score based on Core Web Vitals
  getPerformanceScore() {
    const scores = {
      cls: this.getCLSScore(),
      fid: this.getFIDScore(),
      fcp: this.getFCPScore(),
      lcp: this.getLCPScore(),
      ttfb: this.getTTFBScore()
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(scores).length;

    return {
      individual: scores,
      average: averageScore,
      grade: this.getGrade(averageScore)
    };
  }

  // Score individual metrics
  getCLSScore() {
    const cls = this.metrics.cls?.value || 0;
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 75;
    if (cls <= 0.5) return 50;
    return 25;
  }

  getFIDScore() {
    const fid = this.metrics.fid?.value || 0;
    if (fid <= 100) return 100;
    if (fid <= 300) return 75;
    if (fid <= 500) return 50;
    return 25;
  }

  getFCPScore() {
    const fcp = this.metrics.fcp?.value || 0;
    if (fcp <= 1800) return 100;
    if (fcp <= 3000) return 75;
    if (fcp <= 4000) return 50;
    return 25;
  }

  getLCPScore() {
    const lcp = this.metrics.lcp?.value || 0;
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 75;
    if (lcp <= 6000) return 50;
    return 25;
  }

  getTTFBScore() {
    const ttfb = this.metrics.ttfb?.value || 0;
    if (ttfb <= 800) return 100;
    if (ttfb <= 1800) return 75;
    if (ttfb <= 3000) return 50;
    return 25;
  }

  // Get grade based on score
  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Generate performance report
  generateReport() {
    const score = this.getPerformanceScore();
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      performanceScore: score,
      metrics: this.getMetrics(),
      recommendations: this.getRecommendations(score)
    };

    return report;
  }

  // Get performance recommendations
  getRecommendations(score) {
    const recommendations = [];

    if (score.average < 90) {
      if (score.individual.cls < 75) {
        recommendations.push('Optimize layout shifts by fixing elements with dynamic heights');
      }
      if (score.individual.fid < 75) {
        recommendations.push('Reduce JavaScript execution time and break up long tasks');
      }
      if (score.individual.fcp < 75) {
        recommendations.push('Optimize critical rendering path and reduce server response time');
      }
      if (score.individual.lcp < 75) {
        recommendations.push('Optimize largest contentful paint by improving image loading and server response');
      }
      if (score.individual.ttfb < 75) {
        recommendations.push('Improve server response time and optimize database queries');
      }
    }

    return recommendations;
  }

  // Export metrics for debugging
  exportMetrics() {
    const dataStr = JSON.stringify(this.getMetrics(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `performance-metrics-${Date.now()}.json`;
    link.click();
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

export default performanceService;
