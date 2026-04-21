'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGetInstitutions, adminDeleteInstitution } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { showToast } from '../components/Toast';
import type { Institution } from '../../lib/types';

export default function AdminInstitutionsPage() {
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = getToken();
    if (!token) return;
    try {
      const res = await adminGetInstitutions(token);
      setItems(res.items || []);
    } catch {
      showToast('Failed to load institutions');
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
      await adminDeleteInstitution(id, token);
      showToast('Institution deleted');
      load();
    } catch {
      showToast('Delete failed');
    }
  }

  return (
    <>
      <div className="a-hdr">
        <h2>Institutions</h2>
        <Link href="/admin/institutions/new" className="btn btn-primary">+ New Institution</Link>
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
                <tr><td colSpan={5} style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No institutions yet.</td></tr>
              ) : items.map(inst => (
                <tr key={inst._id}>
                  <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{inst.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>/{inst.slug}</td>
                  <td><span className={`badge badge-${inst.status}`}>{inst.status}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {inst.publishedAt ? new Date(inst.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/institutions/${inst._id}`} className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 10px' }}>Edit</Link>
                      <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => handleDelete(inst._id, inst.title)}>Delete</button>
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
