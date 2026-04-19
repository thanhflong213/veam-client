'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGetAnnouncements, adminDeleteAnnouncement } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { showToast } from '../components/Toast';
import type { Announcement } from '../../lib/types';

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = getToken();
    if (!token) return;
    try {
      const res = await adminGetAnnouncements(token);
      setItems(res.items || []);
    } catch {
      showToast('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await adminDeleteAnnouncement(id, token);
      showToast('Announcement deleted');
      load();
    } catch {
      showToast('Delete failed');
    }
  }

  return (
    <>
      <div className="a-hdr">
        <h2>Announcements</h2>
        <Link href="/admin/announcements/new" className="btn btn-primary">+ New Announcement</Link>
      </div>
      {loading ? (
        <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: 20 }}>Loading…</div>
      ) : (
        <div className="a-tbl-wrap">
          <table className="a-tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No announcements yet.</td></tr>
              ) : items.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{a.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>/{a.slug}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/announcements/${a._id}`} className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }}>Edit</Link>
                      <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => handleDelete(a._id, a.title)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
