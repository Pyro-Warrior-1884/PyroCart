'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import { getMyProfile } from '@/app/services/user.service';
import '../../shop.css';

type Operation = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

export default function AdminOperationsPage() {
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<Operation>('READ');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleOperationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperation(e.target.value as Operation);
  };

  const renderOperationContent = () => {
    switch (selectedOperation) {
      case 'CREATE':
        return (
          <div className="operation-content">
            <div className="operation-icon create-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h2 className="operation-title">Create Operation</h2>
            <p className="operation-description">
              Create new records, products, categories, or users in the system.
            </p>
            <div className="operation-placeholder">
              <p>Create form will be displayed here</p>
            </div>
          </div>
        );

      case 'READ':
        return (
          <div className="operation-content">
            <div className="operation-icon read-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <h2 className="operation-title">Read Operation</h2>
            <p className="operation-description">
              View and retrieve data from the system including products, users, and orders.
            </p>
            <div className="operation-placeholder">
              <p>Data table will be displayed here</p>
            </div>
          </div>
        );

      case 'UPDATE':
        return (
          <div className="operation-content">
            <div className="operation-icon update-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <h2 className="operation-title">Update Operation</h2>
            <p className="operation-description">
              Modify existing records, update product information, or edit user details.
            </p>
            <div className="operation-placeholder">
              <p>Edit form will be displayed here</p>
            </div>
          </div>
        );

      case 'DELETE':
        return (
          <div className="operation-content">
            <div className="operation-icon delete-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <h2 className="operation-title">Delete Operation</h2>
            <p className="operation-description">
              Remove records, products, or users from the system permanently.
            </p>
            <div className="operation-placeholder warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p>Delete operations are permanent and cannot be undone</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Breadcrumb 
            items={[
            { label: 'Main', href: '/shop' }, 
            { label: 'CRUD', href: `/shop/admin/product` },
        ]} />
        <main className="shop-main">
          <div className="loading-state">Loading...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Breadcrumb 
            items={[
            { label: 'Main', href: '/shop' }, 
            { label: 'CRUD', href: `/shop/admin/product` },
      ]} />

      <main className="shop-main">
        <div className="operations-header">
          <h1 className="operations-page-title">Admin Operations</h1>
          <p className="operations-subtitle">Manage system data and records</p>
        </div>

        <div className="operations-selector-container">
          <label htmlFor="operation-select" className="operation-label">
            Select Operation:
          </label>
          <select
            id="operation-select"
            value={selectedOperation}
            onChange={handleOperationChange}
            className="operation-dropdown"
          >
            <option value="READ">Read - View Data</option>
            <option value="CREATE">Create - Add New Records</option>
            <option value="UPDATE">Update - Edit Existing Records</option>
            <option value="DELETE">Delete - Remove Records</option>
          </select>
        </div>

        {renderOperationContent()}
      </main>
    </>
  );
}