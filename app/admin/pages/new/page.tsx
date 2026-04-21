'use client';

import { useEffect, useState } from 'react';
import PageEditor from '../../components/PageEditor';
import { adminGetPages } from '../../../lib/api';
import { getToken } from '../../../lib/auth';
import type { Page } from '../../../lib/types';

export default function NewPagePage() {
  const [allPages, setAllPages] = useState<Page[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetPages(token).then(setAllPages).catch(() => {});
  }, []);

  return <PageEditor allPages={allPages} />;
}
