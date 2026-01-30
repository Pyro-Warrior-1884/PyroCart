'use client';

import React, { useState } from 'react';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import './shop.css';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleProfileClick = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div>
      <Topbar onProfileClick={handleProfileClick} />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar}        
      />
      {children}
    </div>
  );
}