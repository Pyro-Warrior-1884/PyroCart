'use client';

import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="breadcrumb">
      <div className="breadcrumb-text">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.href ? (
              <Link href={item.href} className="breadcrumb-item">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="breadcrumb-separator">&gt;</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}