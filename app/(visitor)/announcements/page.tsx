import type { Metadata } from 'next';
import Link from 'next/link';
import { getAnnouncements, getPages } from '../../lib/api';
import type { Announcement, Page } from '../../lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Announcements – VEAM',
  description: 'Latest news, calls for papers, and conference updates from VEAM.',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase();
}

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const searchQuery = q?.trim() ?? '';

  let announcements: Announcement[] = [];
  let pages: Page[] = [];
  let recommendedItems: Announcement[] = [];

  try {
    const res = await getAnnouncements({ limit: 50, search: searchQuery || undefined });
    announcements = res.items || [];
  } catch { /* ignore */ }

  try {
    pages = (await getPages()).filter(p => p.status === 'published');
  } catch { /* ignore */ }

  try {
    const res = await getAnnouncements({ limit: 100 });
    recommendedItems = (res.items || []).filter(a => a.recommend === true);
  } catch { /* ignore */ }

  return (
    <div className="page-body">
      <div>
        <div className="ann-header">
          {searchQuery ? (
            <>
              <h2>Search Results</h2>
              <p>
                {announcements.length > 0
                  ? <>Showing <strong>{announcements.length}</strong> result{announcements.length !== 1 ? 's' : ''} for <strong>&ldquo;{searchQuery}&rdquo;</strong></>
                  : <>No results found for <strong>&ldquo;{searchQuery}&rdquo;</strong></>
                }
              </p>
              <Link href="/announcements" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                ← All announcements
              </Link>
            </>
          ) : (
            <>
              <h2>Announcements</h2>
              <p>Latest news, calls for papers, and conference updates</p>
            </>
          )}
        </div>

        {announcements.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', marginTop: 16 }}>
            {searchQuery ? 'Try a different search term.' : 'No announcements yet.'}
          </p>
        ) : (
          <div className="content-card-list">
            {announcements.map(ann => (
              <div key={ann._id} className="content-card">
                <Link href={`/announcements/${ann.slug}`} className="content-card-title">
                  {ann.title}
                </Link>
                {ann.publishedAt && (
                  <div className="content-card-date">⊙ {formatDate(ann.publishedAt)}</div>
                )}
                {ann.excerpt && (
                  <p className="content-card-excerpt">{ann.excerpt}</p>
                )}
                <Link href={`/announcements/${ann.slug}`} className="content-card-btn">
                  READ MORE →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside>
        <div className="sidebar-widget">
          <h3>Quick Links</h3>
          <ul>
            {pages.map(p => (
              <li key={p._id}><Link href={`/${p.slug}`}>{p.title}</Link></li>
            ))}
          </ul>
        </div>
        <div className="sidebar-widget">
          <h3>Paper Archives</h3>
          {recommendedItems.length > 0 ? (
            <ul>
              {recommendedItems.map(a => (
                <li key={a._id}>
                  <Link href={`/announcements/${a.slug}`}>{a.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--text-muted)' }}>
              No featured papers yet.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
