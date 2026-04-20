'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, clearToken } from '../lib/auth';
import Toast from './components/Toast';

const NAV_ITEMS = [
  {
    section: 'Content',
    items: [
      {
        href: '/admin/pages',
        label: 'Pages',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        href: '/admin/announcements',
        label: 'Announcements',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        href: '/admin/settings',
        label: 'Settings',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

const LOGOUT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (pathname !== '/admin/login' && !isLoggedIn()) {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}<Toast /></>;
  }

  function handleLogout() {
    clearToken();
    router.push('/admin/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0ede6' }}>
      {/* Header */}
      <div style={{
        background: 'var(--navy)',
        padding: '13px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 300,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
              color: 'rgba(255,255,255,.7)', fontSize: 18, lineHeight: 1, borderRadius: 4,
              display: 'flex', flexDirection: 'column', gap: 3,
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span style={{ display: 'block', width: 16, height: 2, background: 'currentColor', borderRadius: 1 }} />
            <span style={{ display: 'block', width: 16, height: 2, background: 'currentColor', borderRadius: 1 }} />
            <span style={{ display: 'block', width: 16, height: 2, background: 'currentColor', borderRadius: 1 }} />
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, background: 'rgba(184,151,58,.2)', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display',serif", color: 'var(--gold)', fontSize: 12, fontWeight: 700,
            }}>VEAM</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: 'white' }}>Admin</span>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,.75)',
              textDecoration: 'none', padding: '5px 12px', border: '1px solid rgba(255,255,255,.2)',
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← View Site
          </Link>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={handleLogout}>
            {LOGOUT_ICON} Logout
          </button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="admin-mob-bar">
        <div className="admin-mob-bar-inner">
          {NAV_ITEMS[0].items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`amb-btn${pathname.startsWith(item.href) ? ' active' : ''}`}
            >
              {item.icon}{item.label}
            </Link>
          ))}
          <button className="amb-btn amb-logout" onClick={handleLogout}>
            {LOGOUT_ICON}Logout
          </button>
        </div>
      </div>

      <div className={`admin-layout${sidebarOpen ? '' : ' sidebar-closed'}`}>
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div style={{ padding: '0 20px 18px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 8 }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#5a7aaa', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Logged in as
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'white', fontWeight: 500 }}>
              Administrator
            </div>
          </div>
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div className="a-sec">{section.section}</div>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`a-nav${pathname.startsWith(item.href) ? ' active' : ''}`}
                >
                  {item.icon}{item.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="a-sec">Account</div>
          <button className="a-nav" onClick={handleLogout}>
            {LOGOUT_ICON}Logout
          </button>
        </div>

        <div className="admin-main">
          {children}
        </div>
      </div>

      <Toast />
    </div>
  );
}
