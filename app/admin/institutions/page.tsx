'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { adminGetInstitutions, adminDeleteInstitution } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { showToast } from '../components/Toast';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import AdminTableSection from '../components/AdminTableSection';
import type { Institution } from '../../lib/types';

export default function AdminInstitutionsPage() {
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetInstitutions(token)
      .then(res => setItems(res.items || []))
      .catch(() => showToast('Failed to load institutions'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await adminDeleteInstitution(id, token);
      showToast('Institution deleted');
      const token2 = getToken();
      if (token2) adminGetInstitutions(token2).then(res => setItems(res.items || [])).catch(() => {});
    } catch {
      showToast('Delete failed');
    }
  }

  const totalPages = Math.ceil(items.length / pageSize);
  const slice = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="a-hdr">
        <h2>Institutions</h2>
        <Link href="/admin/institutions/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <FontAwesomeIcon icon={faPlus} /> New Institution
        </Link>
      </div>
      <AdminTableSection loading={loading} page={page} totalPages={totalPages} onPage={setPage} pageSize={pageSize} onPageSize={(n) => { setPageSize(n); setPage(1); }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No institutions yet.</TableCell>
              </TableRow>
            ) : slice.map(inst => (
              <TableRow key={inst._id}>
                <TableCell className="font-semibold" style={{ color: 'var(--navy)' }}>
                  <span className="a-cell-trunc" title={inst.title}>{inst.title}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="a-cell-trunc a-cell-trunc-wide" title={`/${inst.slug}`}>/{inst.slug}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={inst.status === 'published' ? 'default' : 'secondary'}>
                    {inst.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {inst.publishedAt ? new Date(inst.publishedAt).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Link href={`/admin/institutions/${inst._id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}>
                      <FontAwesomeIcon icon={faPencil} /> Edit
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(inst._id, inst.title)}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableSection>
    </>
  );
}
