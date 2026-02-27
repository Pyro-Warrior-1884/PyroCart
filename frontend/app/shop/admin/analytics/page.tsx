'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import { getMyProfile } from '@/app/services/user.service';
import { getOrderAnalytics } from '@/app/services/order.service';
import '../../shop.css';
import '../../analytics.css';

interface CheckoutAnalytics {
  attempts: number;
  success: number;
  failed: number;
  cancelled: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CheckoutAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const profile = await getMyProfile();
        if (profile.role !== 'ADMIN') {
          router.push('/shop');
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        console.log('Failed to verify admin');
        router.push('/shop');
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
    }
  }, [isAdmin]);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setError(null);
      const data = await getOrderAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

    const calculateSuccessRate = (): number => {
        if (!analytics || analytics.attempts === 0) return 0;
        return (analytics.success / analytics.attempts) * 100;
    };

    const calculateFailureRate = (): number => {
        if (!analytics || analytics.attempts === 0) return 0;
        return (analytics.failed / analytics.attempts) * 100;
    };

    const calculateCancellationRate = (): number => {
        if (!analytics || analytics.attempts === 0) return 0;
        return (analytics.cancelled / analytics.attempts) * 100;
    };


  if (!isAdmin) return null;

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Main', href: '/shop' }, { label: 'Analytics', href: '/shop/admin/analytics' }]} />
        <main className="shop-main">
          <div className="loading-state">Loading...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Main', href: '/shop' }, { label: 'Analytics', href: '/shop/admin/analytics' }]} />
      <main className="shop-main">
        <div className="analytics-header">
          <div className="analytics-header-left">
            <h1 className="analytics-page-title">Checkout Analytics</h1>
            <p className="analytics-subtitle">Monitor checkout performance and conversion metrics</p>
          </div>
          <button onClick={loadAnalytics} disabled={analyticsLoading} className="refresh-analytics-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            {analyticsLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {error && (
          <div className="analytics-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {analyticsLoading && !analytics ? (
          <div className="analytics-loading">
            <div className="loading-spinner"></div>
            <p>Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <div className="analytics-summary-grid">
              <div className="analytics-card total-attempts">
                <div className="analytics-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="analytics-card-content">
                  <p className="analytics-card-label">Total Attempts</p>
                  <h2 className="analytics-card-value">{analytics.attempts.toLocaleString()}</h2>
                  <p className="analytics-card-description">Checkout initiated</p>
                </div>
              </div>

              <div className="analytics-card success-checkouts">
                <div className="analytics-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="analytics-card-content">
                  <p className="analytics-card-label">Successful Checkouts</p>
                  <h2 className="analytics-card-value">{analytics.success.toLocaleString()}</h2>
                  <p className="analytics-card-description">
                    {calculateSuccessRate().toFixed(1)}% success rate
                  </p>
                </div>
              </div>

              <div className="analytics-card failed-checkouts">
                <div className="analytics-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <div className="analytics-card-content">
                  <p className="analytics-card-label">Failed Checkouts</p>
                  <h2 className="analytics-card-value">{analytics.failed.toLocaleString()}</h2>
                  <p className="analytics-card-description">{calculateFailureRate().toFixed(1)}% failure rate</p>
                </div>
              </div>

              <div className="analytics-card cancelled-checkouts">
                <div className="analytics-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                </div>
                <div className="analytics-card-content">
                  <p className="analytics-card-label">Cancelled Checkouts</p>
                  <h2 className="analytics-card-value">{analytics.cancelled.toLocaleString()}</h2>
                  <p className="analytics-card-description">{calculateCancellationRate().toFixed(1)}% cancellation rate</p>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="analytics-breakdown">
              <h2 className="breakdown-title">Checkout Breakdown</h2>
              
              <div className="breakdown-bars">
                <div className="breakdown-bar-container">
                  <div className="breakdown-bar-label">
                    <span className="breakdown-bar-name">Successful</span>
                    <span className="breakdown-bar-value">{analytics.success} ({calculateSuccessRate().toFixed(1)}%)</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-bar-fill success-bar" 
                      style={{ width: `${calculateSuccessRate().toFixed(1)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="breakdown-bar-container">
                  <div className="breakdown-bar-label">
                    <span className="breakdown-bar-name">Failed</span>
                    <span className="breakdown-bar-value">{analytics.failed} ({calculateFailureRate().toFixed(1)}%)</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-bar-fill failed-bar" 
                      style={{ width: `${calculateFailureRate().toFixed(1)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="breakdown-bar-container">
                  <div className="breakdown-bar-label">
                    <span className="breakdown-bar-name">Cancelled</span>
                    <span className="breakdown-bar-value">{analytics.cancelled} ({calculateCancellationRate().toFixed(1)}%)</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-bar-fill cancelled-bar" 
                      style={{ width: `${calculateCancellationRate().toFixed(1)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="analytics-insights">
              <h2 className="insights-title">Key Insights</h2>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                  </div>
                  <h3 className="insight-title">Conversion Rate</h3>
                  <p className="insight-value">{calculateSuccessRate().toFixed(1)}%</p>
                  <p className="insight-description">
                    {calculateSuccessRate() >= 70 
                      ? 'Excellent conversion rate!' 
                      : calculateSuccessRate() >= 50 
                      ? 'Good conversion, room for improvement' 
                      : 'Consider optimizing the checkout flow'}
                  </p>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                  </div>
                  <h3 className="insight-title">Total Volume</h3>
                  <p className="insight-value">{analytics.attempts.toLocaleString()}</p>
                  <p className="insight-description">
                    {analytics.attempts > 100 
                      ? 'High checkout activity' 
                      : analytics.attempts > 50 
                      ? 'Moderate checkout activity' 
                      : 'Low checkout activity'}
                  </p>
                </div>

                <div className="insight-card">
                  <div className="insight-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <h3 className="insight-title">Issues</h3>
                  <p className="insight-value">{(analytics.failed + analytics.cancelled).toLocaleString()}</p>
                  <p className="insight-description">
                    {analytics.failed > analytics.success * 0.5 
                      ? 'High failure rate - investigate issues' 
                      : 'Acceptable failure rate'}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="analytics-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <h3>No Analytics Data</h3>
            <p>Analytics data will appear here once checkouts are processed.</p>
          </div>
        )}
      </main>
    </>
  );
}