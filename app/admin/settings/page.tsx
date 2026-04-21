'use client';

import { useEffect, useState, useRef } from 'react';
import { adminGetSettings, adminUpdateSettings, adminUploadImage, adminGetAnnouncements, adminGetPages } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { showToast } from '../components/Toast';
import type { Announcement, HeroSlide, Page, Settings } from '../../lib/types';
import { NavMenuEditor } from '../components/NavMenuEditor';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const slideImageRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [slideImageModes, setSlideImageModes] = useState<Record<number, 'upload' | 'url'>>({});
  const [slideUrlInputs, setSlideUrlInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      adminGetSettings(token),
      adminGetAnnouncements(token).catch(() => ({ items: [], total: 0 })),
      adminGetPages(token).catch(() => []),
    ])
      .then(([s, ann, pgs]) => {
        setSettings(s);
        setAllAnnouncements(ann.items ?? []);
        setAllPages(Array.isArray(pgs) ? pgs : []);
      })
      .catch(() => showToast('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await adminUpdateSettings(settings, token);
      showToast('Settings saved');
    } catch {
      showToast('Save failed');
    } finally {
      setSaving(false);
    }
  }

  function updateSlide(idx: number, update: Partial<HeroSlide>) {
    if (!settings) return;
    const slides = [...settings.heroSlides];
    slides[idx] = { ...slides[idx], ...update };
    setSettings({ ...settings, heroSlides: slides });
  }

  function addSlide() {
    if (!settings) return;
    setSettings({ ...settings, heroSlides: [...settings.heroSlides, { type: 'text', title: '', subtitle: '' }] });
  }

  function removeSlide(idx: number) {
    if (!settings) return;
    setSettings({ ...settings, heroSlides: settings.heroSlides.filter((_, i) => i !== idx) });
  }

  function moveSlide(idx: number, dir: -1 | 1) {
    if (!settings) return;
    const slides = [...settings.heroSlides];
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    [slides[idx], slides[target]] = [slides[target], slides[idx]];
    setSettings({ ...settings, heroSlides: slides });
  }

  async function handleSlideImageUpload(idx: number, file: File) {
    const token = getToken();
    if (!token) return;
    try {
      const { url } = await adminUploadImage(file, token);
      updateSlide(idx, { imageUrl: url });
    } catch {
      showToast('Image upload failed');
    }
  }

  if (loading) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: 20 }}>Loading…</div>;
  if (!settings) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--red)', padding: 20 }}>Failed to load settings.</div>;

  return (
    <>
      <div className="a-hdr">
        <h2>Settings</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Settings'}
        </button>
      </div>

      <div className="a-card">
        <div className="form-group">
          <label className="form-label">Site Name</label>
          <input
            className="form-input"
            type="text"
            value={settings.siteName}
            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Visitor Layout Theme</label>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            {(['modern', 'classic'] as const).map(t => (
              <label
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '10px 16px',
                  border: `2px solid ${settings.activeTheme === t ? 'var(--navy)' : 'var(--border)'}`,
                  borderRadius: 8,
                  background: settings.activeTheme === t ? 'var(--cream)' : 'white',
                  transition: 'all .15s',
                }}
              >
                <input
                  type="radio"
                  name="activeTheme"
                  value={t}
                  checked={settings.activeTheme === t}
                  onChange={() => setSettings({ ...settings, activeTheme: t })}
                  style={{ accentColor: 'var(--navy)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--navy)', textTransform: 'capitalize' }}>{t}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {t === 'modern' ? 'Navy & gold — like veam.vercel.app' : 'Blue & white — like veam.org'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="a-hdr" style={{ marginTop: 8 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: 'var(--navy)' }}>Hero Slides</h2>
        <button className="btn btn-secondary" onClick={addSlide}>+ Add Slide</button>
      </div>

      {settings.heroSlides.map((slide, idx) => (
        <div key={idx} className="slide-editor-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
              Slide {idx + 1}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => moveSlide(idx, -1)} disabled={idx === 0}>↑</button>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => moveSlide(idx, 1)} disabled={idx === settings.heroSlides.length - 1}>↓</button>
              <button className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => removeSlide(idx)}>Remove</button>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type</label>
              <select
                className="form-input"
                value={slide.type}
                onChange={e => updateSlide(idx, { type: e.target.value })}
              >
                <option value="text">Text (gradient background)</option>
                <option value="image">Image with overlay</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                value={slide.title}
                onChange={e => updateSlide(idx, { title: e.target.value })}
                placeholder="Slide title"
              />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subtitle</label>
              <input
                className="form-input"
                type="text"
                value={slide.subtitle || ''}
                onChange={e => updateSlide(idx, { subtitle: e.target.value })}
                placeholder="Optional subtitle"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Badge text (optional)</label>
              <input
                className="form-input"
                type="text"
                value={slide.badge || ''}
                onChange={e => updateSlide(idx, { badge: e.target.value })}
                placeholder="e.g. Keynote, Location…"
              />
            </div>
          </div>

          {slide.type === 'image' && (
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Background Image</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="button" className={`ed-tb-btn${(slideImageModes[idx] ?? 'upload') === 'upload' ? ' active' : ''}`} style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={() => setSlideImageModes(m => ({ ...m, [idx]: 'upload' }))}>Upload</button>
                  <button type="button" className={`ed-tb-btn${slideImageModes[idx] === 'url' ? ' active' : ''}`} style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={() => setSlideImageModes(m => ({ ...m, [idx]: 'url' }))}>URL</button>
                </div>
              </div>
              {slide.imageUrl && (
                <img src={slide.imageUrl} alt="slide" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
              )}
              {(slideImageModes[idx] ?? 'upload') === 'upload' ? (
                <>
                  <div className="uzone" onClick={() => slideImageRefs.current[idx]?.click()}>
                    {slide.imageUrl ? 'Click to replace image' : 'Click to upload image'}
                  </div>
                  <input
                    ref={el => { slideImageRefs.current[idx] = el; }}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleSlideImageUpload(idx, f); e.target.value = ''; }}
                  />
                </>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={slideUrlInputs[idx] ?? slide.imageUrl ?? ''}
                    onChange={e => setSlideUrlInputs(s => ({ ...s, [idx]: e.target.value }))}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px', whiteSpace: 'nowrap' }}
                    onClick={() => { const u = slideUrlInputs[idx]?.trim(); if (u) updateSlide(idx, { imageUrl: u }); }}>
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {settings.heroSlides.length === 0 && (
        <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: '20px 0' }}>
          No hero slides yet. Click &ldquo;Add Slide&rdquo; to add one.
        </div>
      )}

      {/* ── Navigation Menu ── */}
      <div className="a-hdr" style={{ marginTop: 8 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: 'var(--navy)' }}>Navigation Menu</h2>
      </div>
      <div className="a-card">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Build multi-level nav. Leave <strong>Link</strong> blank to make an item a group header only. Toggle <strong>●/○</strong> to show/hide.
        </p>
        <NavMenuEditor
          items={settings.navItems ?? []}
          onChange={items => setSettings({ ...settings, navItems: items })}
          pages={allPages}
        />
      </div>

      {/* ── Featured Announcements (Paper Archives) ── */}
      <div className="a-hdr" style={{ marginTop: 8 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: 'var(--navy)' }}>Paper Archives Sidebar</h2>
      </div>
      <div className="a-card">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Check announcements to feature them in the &ldquo;Paper Archives&rdquo; widget on the announcements page.
        </p>
        {allAnnouncements.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--text-muted)' }}>No announcements found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allAnnouncements.map(ann => {
              const featured = (settings.featuredAnnouncements ?? []).includes(ann._id);
              return (
                <label key={ann._id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: featured ? 'var(--cream)' : 'transparent', border: `1px solid ${featured ? 'var(--navy)' : 'var(--border)'}`, transition: 'all .15s' }}>
                  <input
                    type="checkbox"
                    checked={featured}
                    style={{ accentColor: 'var(--navy)', width: 15, height: 15 }}
                    onChange={() => {
                      const cur = settings.featuredAnnouncements ?? [];
                      const next = featured ? cur.filter(id => id !== ann._id) : [...cur, ann._id];
                      setSettings({ ...settings, featuredAnnouncements: next });
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.title}</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'var(--text-muted)' }}>{ann.status} · {ann.slug}</div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
