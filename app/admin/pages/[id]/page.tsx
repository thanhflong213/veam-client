'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageEditor from '../../components/PageEditor';
import { adminGetPage, adminGetPages } from '../../../lib/api';
import { getToken } from '../../../lib/auth';
import type { Page } from '../../../lib/types';

export default function EditPagePage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      adminGetPage(id, token),
      adminGetPages(token),
    ])
      .then(([p, pages]) => { setPage(p); setAllPages(pages); })
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: 20 }}>Loading…</div>;
  if (!page) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--red)', padding: 20 }}>Page not found.</div>;

  return <PageEditor page={page} allPages={allPages} />;
}
