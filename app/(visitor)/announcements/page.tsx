import type { Metadata } from 'next';
import Link from 'next/link';
import { getAnnouncements, getPages, getSettings } from '../../lib/api';
import type { Announcement, Page } from '../../lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Announcements – VEAM',
  description: 'Latest news, calls for papers, and conference updates from VEAM.',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return { day: '--', mon: '---', yr: '----' };
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    mon: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    yr: d.getFullYear().toString(),
  };
}

export default async function AnnouncementsPage() {
  let announcements: Announcement[] = [];
  let pages: Page[] = [];
  let featuredIds: string[] = [];

  try {
    const res = await getAnnouncements({ limit: 50 });
    announcements = res.items || [];
  } catch { /* ignore */ }

  try {
    pages = (await getPages()).filter(p => p.status === 'published');
  } catch { /* ignore */ }

  try {
    const settings = await getSettings();
    featuredIds = settings.featuredAnnouncements ?? [];
  } catch { /* ignore */ }

  const featuredItems = featuredIds.length > 0
    ? announcements.filter(a => featuredIds.includes(a._id))
    : [];

  return (
    <div className="page-body">
      <div>
        <div className="ann-header">
          <h2>Announcements</h2>
          <p>Latest news, calls for papers, and conference updates</p>
        </div>
        {announcements.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)' }}>No announcements yet.</p>
        ) : (
          announcements.map(ann => {
            const { day, mon, yr } = formatDate(ann.publishedAt);
            return (
              <Link key={ann._id} href={`/announcements/${ann.slug}`} className="event-card">
                <div className="event-card-inner">
                  <div className="ev-date">
                    <span className="day">{day}</span>
                    <span className="mon">{mon}</span>
                    <span className="yr">{yr}</span>
                  </div>
                  <div className="ev-body">
                    <h3>{ann.title}</h3>
                    {ann.excerpt && <p className="exc">{ann.excerpt}</p>}
                    <div className="tags">
                      <span className="tag">Announcement</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
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
          {featuredItems.length > 0 ? (
            <ul>
              {featuredItems.map(a => (
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
