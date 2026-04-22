'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { adminGetAnnouncements, adminDeleteAnnouncement } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { showToast } from '../components/Toast';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import AdminTableSection from '../components/AdminTableSection';
import type { Announcement } from '../../lib/types';

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetAnnouncements(token)
      .then(res => setItems(res.items || []))
      .catch(() => showToast('Failed to load announcements'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await adminDeleteAnnouncement(id, token);
      showToast('Announcement deleted');
      const token2 = getToken();
      if (token2) adminGetAnnouncements(token2).then(res => setItems(res.items || [])).catch(() => {});
    } catch {
      showToast('Delete failed');
    }
  }

  const totalPages = Math.ceil(items.length / pageSize);
  const slice = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="a-hdr">
        <h2>Announcements</h2>
        <Link href="/admin/announcements/new" className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}>
          <FontAwesomeIcon icon={faPlus} /> New Announcement
        </Link>
      </div>
      <AdminTableSection loading={loading} page={page} totalPages={totalPages} onPage={setPage} pageSize={pageSize} onPageSize={(n) => { setPageSize(n); setPage(1); }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No announcements yet.</TableCell>
              </TableRow>
            ) : slice.map(a => (
              <TableRow key={a._id}>
                <TableCell className="font-semibold" style={{ color: 'var(--navy)' }}>
                  <span className="a-cell-trunc" title={a.title}>{a.title}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="a-cell-trunc a-cell-trunc-wide" title={`/${a.slug}`}>/{a.slug}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={a.status === 'published' ? 'default' : 'secondary'}>
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {a.recommend
                    ? <Badge variant="default">Yes</Badge>
                    : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Link href={`/admin/announcements/${a._id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}>
                      <FontAwesomeIcon icon={faPencil} /> Edit
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(a._id, a.title)}>
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
