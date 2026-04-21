import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getInstitutions } from '../../../lib/api';
import type { Institution } from '../../../lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getInstitution(slug: string): Promise<Institution | null> {
  try {
    const res = await getInstitutions({ limit: 100 });
    return res.items.find(i => i.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) return {};
  return { title: inst.title + ' – VEAM', description: inst.excerpt };
}

export default async function InstitutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) notFound();

  const publishedDate = inst.publishedAt
    ? new Date(inst.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/institutions" className="back-btn">← Back to Institutions</Link>
      {inst.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={inst.coverImage}
          alt={inst.title}
          style={{ width: '100%', borderRadius: 8, marginBottom: 24, maxHeight: 400, objectFit: 'cover' }}
        />
      )}
      <h1 className="ev-det-title">{inst.title}</h1>
      <div className="ev-det-meta">
        {publishedDate && <span>📅 {publishedDate}</span>}
      </div>
      <div className="rc" dangerouslySetInnerHTML={{ __html: inst.contentHtml }} />
    </div>
  );
}
