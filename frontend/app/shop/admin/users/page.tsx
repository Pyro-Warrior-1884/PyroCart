'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/app/components/layout/BreadCrumb';
import { getAllUsers } from '@/app/services/user.service';
import { getMyProfile } from '@/app/services/user.service';
import '../../shop.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminAndLoadUsers() {
      try {
        const profile = await getMyProfile();
        
        if (profile.role !== 'ADMIN') {
          router.push('/shop');
          return;
        }
        
        setIsAdmin(true);
        setLoading(true);
        const data = await getAllUsers();
        
        const formattedUsers = data.map((user: any) => ({
          id: user.id,
          name: user.name || 'N/A',
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.log('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadUsers();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (role: string) => {
    return role === 'ADMIN' ? 'role-admin' : 'role-user';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Breadcrumb 
        items={[
        { label: 'Main', href: '/shop' }, 
        { label: 'All Users', href: `/shop/admin/users` },
        ]} />

      <main className="shop-main">
        <div className="admin-users-header">
          <h1 className="admin-users-title">All Users</h1>
          <p className="users-count">
            {users.length} {users.length === 1 ? 'User' : 'Users'}
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading Users...</div>
        ) : users.length > 0 ? (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="user-id">#{user.id}</td>
                    <td className="user-name">{user.name}</td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="user-date">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <h2>No Users Found</h2>
            <p>There are no users in the system yet.</p>
          </div>
        )}
      </main>
    </>
  );
}