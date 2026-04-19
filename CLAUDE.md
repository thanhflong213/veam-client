# VEAM Client — Next.js Frontend

## Project Overview

Custom CMS website for VEAM (Vietnam Economists Annual Meeting).
Two roles: **Visitor** (public) and **Admin** (single account, JWT-protected).

Backend: NestJS at `http://localhost:5000` (dev), env var `NEXT_PUBLIC_API_URL`.

## Theme System

`settings.theme` controls the visitor layout — fetch from `GET /settings` at build/request time.

- **Theme A** ("modern") — elegant academic design. Colors: navy `#1a2744`, gold `#b8973a`, cream `#f8f5ee`. Fonts: Playfair Display (headings), Source Serif 4 (body), DM Sans (UI). Reference: `/index.html` in the repo root.
- **Theme B** ("legacy") — corporate style like old veam.org.

Admin panel **always** uses Theme A regardless of the setting.

## Stack

- Next.js 16 App Router (read `node_modules/next/dist/docs/` for any conventions you are unsure about — this version has breaking changes)
- Tailwind CSS v4 (CSS-first config — no `tailwind.config.js`)
- TipTap rich text editor (install: `@tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-youtube @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header`)
- TypeScript

## File Structure

```
app/
├── (visitor)/
│   ├── layout.tsx          # Header + footer, theme-aware
│   ├── page.tsx            # Home: hero slider, sections from settings/pages
│   ├── [slug]/page.tsx     # Dynamic page renderer (fetches /pages/:slug)
│   └── announcements/
│       ├── page.tsx        # Announcements list
│       └── [slug]/page.tsx # Announcement detail
├── admin/
│   ├── layout.tsx          # Admin shell: sidebar (desktop) + tab bar (mobile)
│   ├── login/page.tsx      # Login form → POST /auth/login
│   ├── pages/
│   │   ├── page.tsx        # Table of pages with edit/delete
│   │   └── [id]/page.tsx   # TipTap editor for page content
│   ├── announcements/
│   │   ├── page.tsx        # Table with create/edit/delete
│   │   └── [id]/page.tsx   # TipTap editor + cover image + meta
│   └── settings/page.tsx   # Site name, theme A/B toggle, hero slides editor
└── lib/
    ├── api.ts              # Typed fetch wrapper (uses NEXT_PUBLIC_API_URL)
    ├── auth.ts             # JWT helpers: save/get/clear token (localStorage)
    └── types.ts            # Shared TypeScript interfaces
```

## Backend API

Base: `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`)

### Auth
```
POST /auth/login          { email, password } → { access_token }
```
All admin routes require: `Authorization: Bearer <token>`

### Pages
```
GET  /pages               → Page[]  (visitors: only published)
GET  /pages/:slug         → Page
POST /pages               { title, slug, content, seoTitle, seoDescription, status }
PATCH /pages/:id          (partial update)
DELETE /pages/:id
```

### Announcements
```
GET  /announcements               → Announcement[]  (query: ?page=1&limit=10&status=published)
GET  /announcements/:slug         → Announcement
POST /announcements               { title, slug, excerpt, content, coverImage, status, publishedAt }
PATCH /announcements/:id
DELETE /announcements/:id
```

### Settings
```
GET  /settings            → { siteName, theme, heroSlides: [{title,subtitle,image,type}] }
PATCH /settings           (admin only, partial)
```

### Uploads
```
POST /uploads/image       multipart/form-data { file } → { url }
```

## Data Types

```ts
interface Page {
  _id: string;
  slug: string;
  title: string;
  content: string; // HTML from TipTap
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  updatedAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
}

interface Settings {
  siteName: string;
  theme: 'A' | 'B';
  heroSlides: HeroSlide[];
}

interface HeroSlide {
  type: 'text' | 'image';
  title: string;
  subtitle?: string;
  image?: string;
}
```

## Auth Flow (Admin)

1. `POST /auth/login` → store `access_token` in `localStorage`
2. Admin layout middleware: if no token → redirect to `/admin/login`
3. All admin API calls add `Authorization: Bearer <token>`
4. Logout: clear localStorage → redirect to `/admin/login`

## Design Reference

The `index.html` in the repo root is the full reference prototype.
Visitor Theme A and admin panel **must match** its look, colors, and component style exactly.
Key design tokens (use as CSS vars in `globals.css`):
- `--navy: #1a2744`, `--navy-light: #243360`
- `--gold: #b8973a`, `--gold-light: #d4af5a`
- `--cream: #f8f5ee`, `--cream-dark: #ede9de`

Fonts (add to layout): Playfair Display, Source Serif 4, DM Sans from Google Fonts.

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Rules

- Use Server Components for public visitor pages (SEO)
- Use Client Components only where interactivity is needed (admin, TipTap)
- No mock data — all data comes from the API
- Admin routes are client-side only (no SSR needed)
- Content from TipTap is stored/rendered as HTML — use `dangerouslySetInnerHTML` for display
