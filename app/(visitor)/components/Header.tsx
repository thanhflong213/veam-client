'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { NavItem, Page } from '../../lib/types';
import { useTheme } from './ThemeContext';

interface Props {
  siteName: string;
  pages: Page[];
  navItems: NavItem[];
}

function DesktopNavItem({ item }: { item: NavItem }) {
  if (!item.enabled) return null;
  const children = (item.children ?? []).filter(c => c.enabled !== false);

  if (children.length === 0) {
    return item.href
      ? <Link href={item.href} className="site-nav-link">{item.label}</Link>
      : <span className="site-nav-link site-nav-nolink">{item.label}</span>;
  }

  return (
    <div className="site-nav-dd">
      {item.href
        ? <Link href={item.href} className="site-nav-link site-nav-dd-trigger">{item.label} <span className="nav-caret">▾</span></Link>
        : <span className="site-nav-link site-nav-dd-trigger site-nav-nolink">{item.label} <span className="nav-caret">▾</span></span>
      }
      <ul className="site-nav-ddmenu">
        {children.map((child, i) => {
          const grandChildren = (child.children ?? []).filter(c => c.enabled !== false);
          if (grandChildren.length === 0) {
            return (
              <li key={i}>
                {child.href
                  ? <Link href={child.href} className="site-nav-dditem">{child.label}</Link>
                  : <span className="site-nav-dditem site-nav-ddgroup">{child.label}</span>
                }
              </li>
            );
          }
          return (
            <li key={i} className="site-nav-hassub">
              <div className="site-nav-dditem site-nav-sub-trigger">
                {child.href
                  ? <Link href={child.href} style={{ color: 'inherit', textDecoration: 'none' }}>{child.label}</Link>
                  : child.label
                }
                <span className="nav-sub-caret"> ▸</span>
              </div>
              <ul className="site-nav-submenu">
                {grandChildren.map((gc, j) => (
                  <li key={j}>
                    {gc.href
                      ? <Link href={gc.href} className="site-nav-dditem">{gc.label}</Link>
                      : <span className="site-nav-dditem site-nav-ddgroup">{gc.label}</span>
                    }
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MobileTree({ items, depth, onClose }: { items: NavItem[]; depth: number; onClose: () => void }) {
  return (
    <>
      {items.filter(i => i.enabled !== false).map((item, idx) => (
        <div key={idx} className={`mob-nav-item mob-depth-${depth}`} style={{ paddingLeft: depth * 16 }}>
          {item.href
            ? <Link href={item.href} className="mob-nav-link" onClick={onClose}>{item.label}</Link>
            : <span className="mob-nav-group">{item.label}</span>
          }
          {item.children && item.children.filter(c => c.enabled !== false).length > 0 && (
            <MobileTree items={item.children} depth={depth + 1} onClose={onClose} />
          )}
        </div>
      ))}
    </>
  );
}

export default function Header({ siteName, pages, navItems }: Props) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const useCustomNav = navItems.length > 0;
  const fallbackPages = pages.filter(p => p.status === 'published');

  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 300 }}>
      <div className="inner">
        <Link href="/" className="logo">
          <div className="logo-badge">VEAM</div>
          <div className="logo-text">
            <span className="main">{siteName}</span>
            <span className="sub">Vietnam Economists Annual Meeting</span>
          </div>
        </Link>
        <nav className="site-nav">
          {useCustomNav ? (
            navItems.map((item, i) => <DesktopNavItem key={i} item={item} />)
          ) : (
            <>
              <Link href="/" className="site-nav-link">Home</Link>
              {fallbackPages.map(p => (
                <Link key={p._id} href={`/${p.slug}`} className="site-nav-link">{p.title}</Link>
              ))}
              <Link href="/announcements" className="site-nav-link">Announcements</Link>
            </>
          )}
          <Link href="/admin" className="admin-btn">⚙ Admin</Link>
          <button
            onClick={toggle}
            className="theme-toggle-btn"
            title={theme === 'a' ? 'Switch to classic veam.org style' : 'Switch to modern style'}
          >
            {theme === 'a' ? '🔄 Classic' : '🔄 Modern'}
          </button>
        </nav>
        <button
          className={`ham-btn${open ? ' open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {useCustomNav ? (
          <MobileTree items={navItems} depth={0} onClose={() => setOpen(false)} />
        ) : (
          <>
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            {fallbackPages.map(p => (
              <Link key={p._id} href={`/${p.slug}`} onClick={() => setOpen(false)}>{p.title}</Link>
            ))}
            <Link href="/announcements" onClick={() => setOpen(false)}>Announcements</Link>
          </>
        )}
        <Link href="/admin" className="mob-admin" onClick={() => setOpen(false)}>⚙ Admin</Link>
      </div>
    </header>
  );
}
