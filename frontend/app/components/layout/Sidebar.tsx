'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfile } from "@/app/services/user.service";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose 
}: SidebarProps) {
  
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("john.doe@example.com");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMyProfile();
        setUserName(data.name);
        setUserEmail(data.email);
        setUserRole(data.role);
      } catch (error) {
        console.log("Failed to Load User");
      }
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
      });
    } catch (err) {
      console.log("Logout Error:", err);
    } finally {
      localStorage.clear();
      onClose();           
      router.push("/login");
    }
  };

  const router = useRouter();

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
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

        <div className="sidebar-content">
          <div className="user-info">
            <div className="user-info-item">
              <span className="user-info-label">Name:</span>
              <span className="user-info-value">{userName}</span>
            </div>
            <div className="user-info-item">
              <span className="user-info-label">Email:</span>
              <span className="user-info-value">{userEmail}</span>
            </div>
            {userRole === "ADMIN" && (
              <div className="user-info-item">
                <span className="user-info-label">Role:</span>
                <span className="user-info-value admin-badge">Admin</span>
              </div>
            )}
          </div>

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

            {userRole === "ADMIN" && (
              <Link href="/shop/admin/users" className="sidebar-menu-item admin-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Show All Users
              </Link>
            )}

            {userRole === "ADMIN" && (
              <Link href="/shop/admin/product" className="sidebar-menu-item admin-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                CRUD Product
              </Link>
            )}

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