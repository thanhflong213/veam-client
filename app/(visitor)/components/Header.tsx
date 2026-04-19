'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Page } from '../../lib/types';
import { useTheme } from './ThemeContext';

interface Props {
  siteName: string;
  pages: Page[];
}

export default function Header({ siteName, pages }: Props) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const navPages = pages.filter(p => p.status === 'published');

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
          <Link href="/">Home</Link>
          {navPages.map(p => (
            <Link key={p._id} href={`/${p.slug}`}>{p.title}</Link>
          ))}
          <Link href="/announcements">Announcements</Link>
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
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        {navPages.map(p => (
          <Link key={p._id} href={`/${p.slug}`} onClick={() => setOpen(false)}>{p.title}</Link>
        ))}
        <Link href="/announcements" onClick={() => setOpen(false)}>Announcements</Link>
        <Link href="/admin" className="mob-admin" onClick={() => setOpen(false)}>⚙ Admin</Link>
      </div>
    </header>
  );
}
