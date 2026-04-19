'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichEditor from './RichEditor';
import { showToast } from './Toast';
import { adminCreateAnnouncement, adminUpdateAnnouncement, adminUploadImage } from '../../lib/api';
import { getToken } from '../../lib/auth';
import type { Announcement } from '../../lib/types';

interface Props {
  announcement?: Announcement;
}

export default function AnnouncementEditor({ announcement }: Props) {
  const router = useRouter();
  const isNew = !announcement;
  const coverRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(announcement?.title || '');
  const [slug, setSlug] = useState(announcement?.slug || '');
  const [excerpt, setExcerpt] = useState(announcement?.excerpt || '');
  const [content, setContent] = useState(announcement?.contentHtml || '');
  const [coverImage, setCoverImage] = useState(announcement?.coverImage || '');
  const [publishedAt, setPublishedAt] = useState(
    announcement?.publishedAt ? announcement.publishedAt.slice(0, 10) : ''
  );
  const [saving, setSaving] = useState(false);

  function slugify(val: string) {
    return val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function onTitleChange(val: string) {
    setTitle(val);
    if (isNew) setSlug(slugify(val));
  }

  async function handleCoverUpload(file: File) {
    const token = getToken();
    if (!token) return;
    try {
      const { url } = await adminUploadImage(file, token);
      setCoverImage(url);
    } catch {
      showToast('Cover upload failed');
    }
  }

  async function save(status: 'draft' | 'published') {
    if (!title.trim()) { showToast('Title is required'); return; }
    if (!slug.trim()) { showToast('Slug is required'); return; }
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const data: Partial<Announcement> = {
        title, slug, excerpt, contentHtml: content, coverImage, status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      };
      if (isNew) {
        const created = await adminCreateAnnouncement(data, token);
        showToast('Announcement created');
        router.push(`/admin/announcements/${created._id}`);
      } else {
        await adminUpdateAnnouncement(announcement._id, data, token);
        showToast('Announcement saved');
      }
    } catch {
      showToast('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: '#f0ede6', minHeight: '100vh', margin: -28 }}>
      <div className="ep-header">
        <Link href="/admin/announcements" className="ep-back">← Back</Link>
        <div className="ep-title">{isNew ? 'New Announcement' : title || 'Edit Announcement'}</div>
        <div className="ep-actions">
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => save('draft')} disabled={saving}>
            Save Draft
          </button>
          <button className="btn btn-primary" onClick={() => save('published')} disabled={saving}>
            {saving ? 'Saving…' : '✓ Publish'}
          </button>
        </div>
      </div>

      <div className="ep-body">
        <div className="ep-meta">
          <div className="form-group sp2" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label className="form-label">Title</label>
            <input className="form-input" type="text" placeholder="Announcement title" value={title} onChange={e => onTitleChange(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Slug</label>
            <input className="form-input" type="text" value={slug} onChange={e => setSlug(slugify(e.target.value))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Published Date</label>
            <input className="form-input" type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
          </div>
          <div className="form-group sp2" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label className="form-label">Excerpt</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Short description shown in the list view"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="form-group sp2" style={{ margin: 0, gridColumn: 'span 2' }}>
            <label className="form-label">Cover Image</label>
            {coverImage && (
              <img src={coverImage} alt="cover" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
            )}
            <div
              className="uzone"
              onClick={() => coverRef.current?.click()}
            >
              {coverImage ? 'Click to replace cover image' : 'Click to upload cover image'}
            </div>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ''; }}
            />
          </div>
        </div>

        <RichEditor content={content} onChange={setContent} />
      </div>
    </div>
  );
}
