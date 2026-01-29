'use client';

import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  userName = 'John Doe',
  userEmail = 'john.doe@example.com'
}: SidebarProps) {
  
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">Profile</h2>
          <button 
            className="close-sidebar-btn" 
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {/* User Info */}
          <div className="user-info">
            <div className="user-info-item">
              <span className="user-info-label">Name:</span>
              <span className="user-info-value">{userName}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Email:</span>
              <span className="user-info-value">{userEmail}</span>
            </div>
          </div>

          {/* Menu */}
          <div className="sidebar-menu">
            <Link href="/shop/cart" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              My Cart
            </Link>

            <Link href="/shop/orders" className="sidebar-menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              My Orders
            </Link>

            <button 
              className="sidebar-menu-item logout" 
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}