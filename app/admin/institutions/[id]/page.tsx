'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InstitutionEditor from '../../components/InstitutionEditor';
import { adminGetInstitution } from '../../../lib/api';
import { getToken } from '../../../lib/auth';
import type { Institution } from '../../../lib/types';

export default function EditInstitutionPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetInstitution(id, token)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: 20 }}>Loading…</div>;
  if (!item) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--red)', padding: 20 }}>Institution not found.</div>;

  return <InstitutionEditor institution={item} />;
}
