"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Page } from "../../lib/types";

interface Props {
  siteName: string;
  pages: Page[];
}

function DesktopPageItem({ page }: { page: Page }) {
  const children = (page.children ?? []).filter(
    (c) => c.status === "published",
  );

  if (children.length === 0) {
    if (page.disabled) {
      return (
        <span className="site-nav-link site-nav-nolink">{page.title}</span>
      );
    }
    return (
      <Link href={`/${page.slug}`} className="site-nav-link">
        {page.title}
      </Link>
    );
  }

  return (
    <div className="site-nav-dd">
      {page.disabled ? (
        <span className="site-nav-link site-nav-dd-trigger site-nav-nolink">
          {page.title} <span className="nav-caret">▾</span>
        </span>
      ) : (
        <Link
          href={`/${page.slug}`}
          className="site-nav-link site-nav-dd-trigger"
        >
          {page.title} <span className="nav-caret">▾</span>
        </Link>
      )}
      <ul className="site-nav-ddmenu">
        {children.map((child, i) => {
          const grandChildren = (child.children ?? []).filter(
            (c) => c.status === "published",
          );
          if (grandChildren.length === 0) {
            return (
              <li key={i}>
                {child.disabled ? (
                  <span className="site-nav-dditem site-nav-ddgroup">
                    {child.title}
                  </span>
                ) : (
                  <Link href={`/${child.slug}`} className="site-nav-dditem">
                    {child.title}
                  </Link>
                )}
              </li>
            );
          }
          return (
            <li key={i} className="site-nav-hassub">
              <div className="site-nav-dditem site-nav-sub-trigger">
                {child.disabled ? (
                  child.title
                ) : (
                  <Link
                    href={`/${child.slug}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {child.title}
                  </Link>
                )}
                <span className="nav-sub-caret"> ▸</span>
              </div>
              <ul className="site-nav-submenu">
                {grandChildren.map((gc, j) => (
                  <li key={j}>
                    {gc.disabled ? (
                      <span className="site-nav-dditem site-nav-ddgroup">
                        {gc.title}
                      </span>
                    ) : (
                      <Link href={`/${gc.slug}`} className="site-nav-dditem">
                        {gc.title}
                      </Link>
                    )}
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

function MobilePageTree({
  pages,
  depth,
  onClose,
}: {
  pages: Page[];
  depth: number;
  onClose: () => void;
}) {
  return (
    <>
      {pages
        .filter((p) => p.status === "published")
        .map((page, idx) => (
          <div
            key={idx}
            className={`mob-nav-item mob-depth-${depth}`}
            style={{ paddingLeft: depth * 16 }}
          >
            {page.disabled ? (
              <span className="mob-nav-group">{page.title}</span>
            ) : (
              <Link
                href={`/${page.slug}`}
                className="mob-nav-link"
                onClick={onClose}
              >
                {page.title}
              </Link>
            )}
            {(page.children ?? []).filter((c) => c.status === "published")
              .length > 0 && (
              <MobilePageTree
                pages={page.children!}
                depth={depth + 1}
                onClose={onClose}
              />
            )}
          </div>
        ))}
    </>
  );
}

export default function Header({ siteName, pages }: Props) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const rootPages = pages.filter((p) => p.status === "published");
  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 30);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm("");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    router.push(`/announcements?q=${encodeURIComponent(q)}`);
    closeSearch();
  }

  return (
    <header
      className="site-header"
      style={{ position: "sticky", top: 0, zIndex: 300 }}
    >
      <div className="inner">
        <Link href="/" className="logo">
          <Image
            src="/cropped-veam-2018-2.png"
            width={120}
            height={120}
            alt="VEAM logo"
          />
        </Link>

        <nav className="site-nav">
          <Link href="/" className="site-nav-link">Home</Link>
          {rootPages.map((page, i) => (
            <DesktopPageItem key={i} page={page} />
          ))}
          <Link href="/announcements" className="site-nav-link">Announcements</Link>
          <Link href="/institutions" className="site-nav-link">Institutions</Link>

          <form
            onSubmit={handleSearch}
            className={`nav-search-form${searchOpen ? " open" : ""}`}
          >
            <input
              ref={searchInputRef}
              className="nav-search-input"
              type="search"
              placeholder="Search announcements…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
              onBlur={() => {
                if (!searchTerm) closeSearch();
              }}
            />
            <button
              type={searchOpen ? "submit" : "button"}
              className="nav-search-btn"
              aria-label="Search"
              onClick={searchOpen ? undefined : openSearch}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </nav>

        <button
          className={`ham-btn${open ? " open" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-menu${open ? " open" : ""}`}>
        <Link href="/" className="mob-nav-link" onClick={() => setOpen(false)}>Home</Link>
        <MobilePageTree pages={rootPages} depth={0} onClose={() => setOpen(false)} />
        <Link href="/announcements" className="mob-nav-link" onClick={() => setOpen(false)}>Announcements</Link>
        <Link href="/institutions" className="mob-nav-link" onClick={() => setOpen(false)}>Institutions</Link>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchTerm.trim();
            if (q) {
              router.push(`/announcements?q=${encodeURIComponent(q)}`);
              setOpen(false);
              setSearchTerm("");
            }
          }}
          style={{ display: "flex", gap: 6, padding: "10px 0 4px" }}
        >
          <input
            className="form-input"
            type="search"
            placeholder="Search announcements…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, fontSize: 13 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ fontSize: 12, padding: "6px 12px" }}
          >
            Go
          </button>
        </form>
        <Link
          href="/admin"
          className="mob-admin"
          onClick={() => setOpen(false)}
        >
          ⚙ Admin
        </Link>
      </div>
    </header>
  );
}
