import Link from 'next/link';
import { getAnnouncements, getPages } from '../../lib/api';

export default async function VisitorSidebar() {
  let quickLinks: { _id: string; slug: string; title: string }[] = [];
  let paperArchives: { _id: string; slug: string; title: string }[] = [];

  try {
    const pages = await getPages();
    quickLinks = pages
      .filter(p => p.status === 'published' && !p.disabled)
      .slice(0, 8)
      .map(p => ({ _id: p._id, slug: p.slug, title: p.title }));
  } catch { /* ignore */ }

  try {
    const res = await getAnnouncements({ limit: 100 });
    paperArchives = (res.items || [])
      .filter(a => a.recommend === true)
      .map(a => ({ _id: a._id, slug: a.slug, title: a.title }));
  } catch { /* ignore */ }

  return (
    <aside>
      {quickLinks.length > 0 && (
        <div className="sidebar-widget">
          <h3>Quick Links</h3>
          <ul>
            {quickLinks.map(p => (
              <li key={p._id}><Link href={`/${p.slug}`}>{p.title}</Link></li>
            ))}
            <li><Link href="/announcements">Announcements</Link></li>
            <li><Link href="/institutions">Institutions</Link></li>
          </ul>
        </div>
      )}
      <div className="sidebar-widget">
        <h3>Paper Archives</h3>
        {paperArchives.length > 0 ? (
          <ul>
            {paperArchives.map(a => (
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
  );
}
