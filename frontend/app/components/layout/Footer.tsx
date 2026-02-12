'use client';

import Link from 'next/link';

export default function Footer() {

  const footerLinks = {
    place: '/shop/under-construction',
    orders: `/shop/orders`
  };

  return (
    <footer className="footer">
      {/* Back to top bar */}
      <div className="footer-back-to-top">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="back-to-top-text"
        >
          Back to top
        </button>
      </div>

      {/* Main footer content */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-column">
            <h3 className="footer-heading">Get to Know Us</h3>
            <ul className="footer-list">
              <li><Link href={footerLinks.place}>About PyroCart</Link></li>
              <li><Link href={footerLinks.place}>Careers</Link></li>
              <li><Link href={footerLinks.place}>Press Releases</Link></li>
              <li><Link href={footerLinks.place}>PyroCart Science</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Make Money with Us</h3>
            <ul className="footer-list">
              <li><Link href={footerLinks.place}>Sell on PyroCart</Link></li>
              <li><Link href={footerLinks.place}>Become an Affiliate</Link></li>
              <li><Link href={footerLinks.place}>Advertise Your Products</Link></li>
              <li><Link href={footerLinks.place}>Self-Publish with Us</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">PyroCart Payment Products</h3>
            <ul className="footer-list">
              <li><Link href={footerLinks.place}>PyroCart Business Card</Link></li>
              <li><Link href={footerLinks.place}>Shop with Points</Link></li>
              <li><Link href={footerLinks.place}>Reload Your Balance</Link></li>
              <li><Link href={footerLinks.place}>Currency Converter</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Let Us Help You</h3>
            <ul className="footer-list">
              <li><Link href={footerLinks.place}>Your Account</Link></li>
              <li><Link href={footerLinks.orders}>Your Orders</Link></li>
              <li><Link href={footerLinks.place}>Shipping Rates & Policies</Link></li>
              <li><Link href={footerLinks.place}>Returns & Replacements</Link></li>
              <li><Link href={footerLinks.place}>Help</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="footer-logo">
            <img src="/PyroCart.png" alt="PyroCart" className="footer-logo-img" />
            <span className="footer-logo-text">PyroCart</span>
          </div>

          <div className="footer-links">
            <Link href={footerLinks.place}>Conditions of Use</Link>
            <Link href={footerLinks.place}>Privacy Notice</Link>
            <Link href={footerLinks.place}>Your Ads Privacy Choices</Link>
          </div>
        </div>

        <div className="footer-copyright">
          © 2024-{new Date().getFullYear()}, PyroCart.com, Inc. or its affiliates
        </div>
      </div>
    </footer>
  );
}