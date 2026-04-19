'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AnnouncementEditor from '../../components/AnnouncementEditor';
import { adminGetAnnouncement } from '../../../lib/api';
import { getToken } from '../../../lib/auth';
import type { Announcement } from '../../../lib/types';

export default function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetAnnouncement(id, token)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: 20 }}>Loading…</div>;
  if (!item) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--red)', padding: 20 }}>Announcement not found.</div>;

  return <AnnouncementEditor announcement={item} />;
}
