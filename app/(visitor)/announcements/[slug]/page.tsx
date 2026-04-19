import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAnnouncement } from '../../../lib/api';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const ann = await getAnnouncement(slug);
    return { title: ann.title + ' – VEAM', description: ann.excerpt };
  } catch {
    return {};
  }
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { slug } = await params;
  let ann;
  try {
    ann = await getAnnouncement(slug);
  } catch {
    notFound();
  }

  const publishedDate = ann.publishedAt
    ? new Date(ann.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/announcements" className="back-btn">← Back to Announcements</Link>
      {ann.coverImage && (
        <img
          src={ann.coverImage}
          alt={ann.title}
          style={{ width: '100%', borderRadius: 8, marginBottom: 24, maxHeight: 400, objectFit: 'cover' }}
        />
      )}
      <h1 className="ev-det-title">{ann.title}</h1>
      <div className="ev-det-meta">
        {publishedDate && <span>📅 {publishedDate}</span>}
        <span
          style={{
            background: ann.status === 'published' ? '#e8f8ef' : 'var(--cream)',
            color: ann.status === 'published' ? '#1a7a45' : 'var(--text-muted)',
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 9px',
            borderRadius: 20,
          }}
        >
          {ann.status}
        </span>
      </div>
      <div className="rc" dangerouslySetInnerHTML={{ __html: ann.contentHtml }} />
    </div>
  );
}
