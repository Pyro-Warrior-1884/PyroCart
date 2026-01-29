'use client';

import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from "react";
import { getMyProfile } from "@/app/services/user.service";
import Link from "next/link";

interface TopbarProps {
  onProfileClick: () => void;
}

export default function Topbar({ onProfileClick }: TopbarProps) {
  const [userName, setUserName] = useState("User");
  const firstLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMyProfile();
        setUserName(data.name);
      } catch (error) {
        console.log("Failed to load user");
      }
    }

    loadUser();
  }, []);

  return (
    <div className="shop-topbar">
      <div className="topbar-left">
        <Link href="/shop" className="logo-container">
          <Image
            src="/PyroCart.png"
            alt="PyroCart Logo"
            width={45}
            height={45}
            className="logo-image"
          />
          <span className="logo-text">PyroCart</span>
        </Link>
      </div>

      {/* Center - Search */}
      <div className="topbar-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Products by Name"
            className="search-input"
          />
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>

      <div className="topbar-right">
        <div className="profile-circle" onClick={onProfileClick}>
          {firstLetter}
        </div>
      </div>
    </div>
  );
}