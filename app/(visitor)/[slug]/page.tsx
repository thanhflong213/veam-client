import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPage, getPages } from '../../lib/api';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await getPage(slug);
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription,
    };
  } catch {
    return {};
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  let page;
  try {
    page = await getPage(slug);
  } catch {
    notFound();
  }

  let allPages: import('../../lib/types').Page[] = [];
  try {
    allPages = (await getPages()).filter((p) => p.status === 'published' && p.slug !== slug);
  } catch { /* ignore */ }

  return (
    <div className="page-body">
      <article>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: 'var(--navy)', marginBottom: 22 }}>
          {page.title}
        </h1>
        <div className="rc" dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
      </article>
      <aside>
        <div className="sidebar-widget">
          <h3>Quick Links</h3>
          <ul>
            {allPages.map((p: import('../../lib/types').Page) => (
              <li key={p._id}><Link href={`/${p.slug}`}>{p.title}</Link></li>
            ))}
            <li><Link href="/announcements">Announcements</Link></li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
