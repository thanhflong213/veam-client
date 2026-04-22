'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile, faCalendarDays, faBuilding, faGear,
  faRightFromBracket, faBars, faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { isLoggedIn, clearToken } from '../lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Toast from './components/Toast';

const NAV_ITEMS = [
  {
    section: 'Content',
    items: [
      { href: '/admin/pages', label: 'Pages', icon: faFile },
      { href: '/admin/announcements', label: 'Announcements', icon: faCalendarDays },
      { href: '/admin/institutions', label: 'Institutions', icon: faBuilding },
      { href: '/admin/settings', label: 'Settings', icon: faGear },
    ],
  },
];

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
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 300,
        height: 54,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px',
              color: 'rgba(255,255,255,.7)', borderRadius: 4,
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FontAwesomeIcon icon={faBars} style={{ fontSize: 15 }} />
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 30, height: 30, background: 'rgba(184,151,58,.2)', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display',serif", color: 'var(--gold)', fontSize: 11, fontWeight: 700,
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
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 11 }} /> View Site
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}
            style={{ fontSize: 12, background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.2)', color: 'rgba(255,255,255,.8)' }}>
            <FontAwesomeIcon icon={faRightFromBracket} /> Logout
          </Button>
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
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: 13 }} />{item.label}
            </Link>
          ))}
          <button className="amb-btn amb-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 13 }} />Logout
          </button>
        </div>
      </div>

      <div className={`admin-layout${sidebarOpen ? '' : ' sidebar-closed'}`}>
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div style={{ padding: '0 20px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 6 }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#5a7aaa', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>
              Logged in as
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'white', fontWeight: 500 }}>
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
                  <FontAwesomeIcon icon={item.icon} style={{ width: 14, height: 14 }} />{item.label}
                </Link>
              ))}
            </div>
          ))}
          <Separator style={{ background: 'rgba(255,255,255,.08)', margin: '8px 0' }} />
          <div className="a-sec">Account</div>
          <button className="a-nav" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} style={{ width: 14, height: 14 }} />Logout
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
