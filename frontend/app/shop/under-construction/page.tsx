'use client';

import Breadcrumb from '@/app/components/layout/BreadCrumb';
import '../shop.css';

export default function UnderConstructionPage() {
  return (
    <>
      <Breadcrumb items={[
        { label: 'Main', href: '/shop' },
        { label: 'Under Construction', href: `/shop/under-construction`}
      ]} />

      <main className="shop-main">
        <div className="under-construction-container">
          <div className="construction-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>

          <h1 className="construction-title">Page Under Construction</h1>
          
          <p className="construction-message">
            We&apos;re currently building this page to provide you with the best experience.
          </p>

          <p className="construction-submessage">
            Thank you for your patience!
          </p>

          <div className="construction-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p className="progress-text">Coming Soon...</p>
          </div>
        </div>
      </main>
    </>
  );
}