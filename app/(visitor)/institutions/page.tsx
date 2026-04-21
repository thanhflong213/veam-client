import type { Metadata } from 'next';
import Link from 'next/link';
import { getInstitutions } from '../../lib/api';
import type { Institution } from '../../lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Institutions – VEAM',
  description: 'Organizing and partner institutions of VEAM.',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).toUpperCase();
}

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function InstitutionsPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const searchQuery = q?.trim() ?? '';
  const currentPage = Number(pageParam ?? 1);

  let institutions: Institution[] = [];
  let total = 0;
  const limit = 12;

  try {
    const res = await getInstitutions({ page: currentPage, limit, search: searchQuery || undefined });
    institutions = res.items || [];
    total = res.total || 0;
  } catch { /* ignore */ }

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px' }}>
      <div className="ann-header">
        {searchQuery ? (
          <>
            <h2>Search Results</h2>
            <p>
              {institutions.length > 0
                ? <>{institutions.length} result{institutions.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;</>
                : <>No results found for &ldquo;{searchQuery}&rdquo;</>
              }
            </p>
            <Link href="/institutions" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--gold)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>
              ← All institutions
            </Link>
          </>
        ) : (
          <>
            <h2>Institutions</h2>
            <p>Organizing and partner institutions of VEAM</p>
          </>
        )}
      </div>

      {institutions.length === 0 ? (
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', marginTop: 16 }}>
          {searchQuery ? 'Try a different search term.' : 'No institutions yet.'}
        </p>
      ) : (
        <div className="content-card-list">
          {institutions.map((inst) => (
            <div key={inst._id} className="content-card">
              <Link href={`/institutions/${inst.slug}`} className="content-card-title">
                {inst.title}
              </Link>
              {inst.publishedAt && (
                <div className="content-card-date">⊙ {formatDate(inst.publishedAt)}</div>
              )}
              {inst.excerpt && (
                <p className="content-card-excerpt">{inst.excerpt}</p>
              )}
              <Link href={`/institutions/${inst.slug}`} className="content-card-btn">
                READ MORE →
              </Link>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/institutions?page=${p}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                padding: '6px 14px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                textDecoration: 'none',
                background: p === currentPage ? 'var(--navy)' : 'white',
                color: p === currentPage ? 'white' : 'var(--navy)',
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
