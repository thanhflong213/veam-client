'use client';

import { useEffect, useState, useRef } from 'react';
import {
  adminGetSettings, adminUpdateSettings, adminUploadImage,
  adminGetAnnouncements, adminGetPages,
} from '../../lib/api';
import { getToken } from '../../lib/auth';
import { showToast } from '../components/Toast';
import type {
  Announcement, HeroSlide, Page, Settings,
  ImportantDate, Keynote, SpecialSession, Publication, OrganizingInstitution,
} from '../../lib/types';
import { NavMenuEditor } from '../components/NavMenuEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFloppyDisk, faPlus, faChevronUp, faChevronDown, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

/* ── helpers ────────────────────────────────────────────── */

function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="a-hdr" style={{ marginTop: 8 }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: 'var(--navy)' }}>{title}</h2>
      {onAdd && (
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
          <FontAwesomeIcon icon={faPlus} /> {addLabel ?? 'Add'}
        </Button>
      )}
    </div>
  );
}

function ItemControls({
  idx, total, onUp, onDown, onRemove,
}: { idx: number; total: number; onUp: () => void; onDown: () => void; onRemove: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <Button variant="outline" size="sm" onClick={onUp} disabled={idx === 0}><FontAwesomeIcon icon={faChevronUp} /></Button>
      <Button variant="outline" size="sm" onClick={onDown} disabled={idx === total - 1}><FontAwesomeIcon icon={faChevronDown} /></Button>
      <Button variant="destructive" size="sm" onClick={onRemove} className="gap-1"><FontAwesomeIcon icon={faTrash} /> Remove</Button>
    </div>
  );
}

/* ── main component ────────────────────────────────────── */

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

  /* slides */
  function updateSlide(idx: number, update: Partial<HeroSlide>) {
    if (!settings) return;
    const slides = [...settings.heroSlides];
    slides[idx] = { ...slides[idx], ...update };
    setSettings({ ...settings, heroSlides: slides });
  }
  function addSlide() {
    if (!settings) return;
    setSettings({ ...settings, heroSlides: [...settings.heroSlides, { type: 'text', title: '' }] });
  }
  function removeSlide(idx: number) {
    if (!settings) return;
    setSettings({ ...settings, heroSlides: settings.heroSlides.filter((_, i) => i !== idx) });
  }
  function moveSlide(idx: number, dir: -1 | 1) {
    if (!settings) return;
    const slides = [...settings.heroSlides];
    const t = idx + dir;
    if (t < 0 || t >= slides.length) return;
    [slides[idx], slides[t]] = [slides[t], slides[idx]];
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

  /* generic array helpers */
  function updateArr<T>(key: keyof Settings, idx: number, patch: Partial<T>) {
    if (!settings) return;
    const arr = [...((settings[key] as T[]) ?? [])] as T[];
    arr[idx] = { ...arr[idx], ...patch };
    setSettings({ ...settings, [key]: arr });
  }
  function addToArr<T>(key: keyof Settings, blank: T) {
    if (!settings) return;
    setSettings({ ...settings, [key]: [...((settings[key] as T[]) ?? []), blank] });
  }
  function removeFromArr(key: keyof Settings, idx: number) {
    if (!settings) return;
    setSettings({ ...settings, [key]: ((settings[key] as unknown[]) ?? []).filter((_, i) => i !== idx) });
  }
  function moveInArr(key: keyof Settings, idx: number, dir: -1 | 1) {
    if (!settings) return;
    const arr = [...((settings[key] as unknown[]) ?? [])];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    setSettings({ ...settings, [key]: arr });
  }

  if (loading) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: 20 }}>Loading…</div>;
  if (!settings) return <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--red)', padding: 20 }}>Failed to load settings.</div>;

  const dates = settings.importantDates ?? [];
  const keynotes = settings.keynotes ?? [];
  const sessions = settings.specialSessions ?? [];
  const pubs = settings.publications ?? [];
  const orgs = settings.organizingInstitutions ?? [];

  return (
    <>
      <div className="a-hdr">
        <h2>Settings</h2>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
          <FontAwesomeIcon icon={faFloppyDisk} /> {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>

      {/* ── Site & Theme ── */}
      <Card><CardContent className="pt-5">
        <div className="form-group">
          <Label htmlFor="site-name">Site Name</Label>
          <Input
            id="site-name"
            type="text"
            value={settings.siteName}
            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <Label>Visitor Layout Theme</Label>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            {(['modern', 'classic'] as const).map(t => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 14, cursor: 'pointer', padding: '10px 16px', border: `2px solid ${settings.activeTheme === t ? 'var(--navy)' : 'var(--border)'}`, borderRadius: 8, background: settings.activeTheme === t ? 'var(--cream)' : 'white', transition: 'all .15s' }}>
                <input type="radio" name="activeTheme" value={t} checked={settings.activeTheme === t} onChange={() => setSettings({ ...settings, activeTheme: t })} style={{ accentColor: 'var(--navy)' }} />
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
      </CardContent></Card>

      {/* ── Conference Info ── */}
      <SectionHeader title="Conference Info" />
      <Card><CardContent className="pt-5">
        <div className="form-row" style={{ marginBottom: 0 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <Label>Conference Date</Label>
            <Input
              type="text"
              placeholder="e.g. July 13–14, 2026"
              value={settings.conferenceInfo?.date ?? ''}
              onChange={e => setSettings({ ...settings, conferenceInfo: { ...settings.conferenceInfo, date: e.target.value } })}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <Label>Location</Label>
            <Input
              type="text"
              placeholder="e.g. Hue, Vietnam"
              value={settings.conferenceInfo?.location ?? ''}
              onChange={e => setSettings({ ...settings, conferenceInfo: { ...settings.conferenceInfo, location: e.target.value } })}
            />
          </div>
        </div>
      </CardContent></Card>

      {/* ── Contact Info ── */}
      <SectionHeader title="Contact Info" />
      <Card><CardContent className="pt-5">
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <Label>Email</Label>
            <Input type="email" placeholder="veam@depocen.org" value={settings.contactInfo?.email ?? ''} onChange={e => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <Label>Phone</Label>
            <Input type="text" placeholder="+84 24 39351419" value={settings.contactInfo?.phone ?? ''} onChange={e => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })} />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: 0 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <Label>Address</Label>
            <Input type="text" placeholder="Street address" value={settings.contactInfo?.address ?? ''} onChange={e => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <Label>Business Hours</Label>
            <Input type="text" placeholder="8:00 AM – 6:00 PM" value={settings.contactInfo?.businessHours ?? ''} onChange={e => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, businessHours: e.target.value } })} />
          </div>
        </div>
      </CardContent></Card>

      {/* ── Social Links ── */}
      <SectionHeader title="Social Links" />
      <Card><CardContent className="pt-5">
        {(['facebook', 'twitter', 'linkedin', 'youtube'] as const).map((platform, i) => (
          <div key={platform} className="form-group" style={{ marginBottom: i === 3 ? 0 : undefined }}>
            <Label style={{ textTransform: 'capitalize' }}>{platform}</Label>
            <Input type="url" placeholder={`https://${platform}.com/...`} value={settings.socialLinks?.[platform] ?? ''} onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [platform]: e.target.value } })} />
          </div>
        ))}
      </CardContent></Card>

      {/* ── Hero Slides ── */}
      <SectionHeader title="Hero Slides" onAdd={addSlide} addLabel="Add Slide" />
      {settings.heroSlides.map((slide, idx) => (
        <div key={idx} className="slide-editor-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Slide {idx + 1}</span>
            <ItemControls idx={idx} total={settings.heroSlides.length} onUp={() => moveSlide(idx, -1)} onDown={() => moveSlide(idx, 1)} onRemove={() => removeSlide(idx)} />
          </div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Type</Label>
              <select className="form-input" value={slide.type} onChange={e => updateSlide(idx, { type: e.target.value })}>
                <option value="text">Text (gradient background)</option>
                <option value="image">Image with overlay</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Title</Label>
              <Input type="text" value={slide.title} onChange={e => updateSlide(idx, { title: e.target.value })} placeholder="Slide title" />
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Subtitle</Label>
              <Input type="text" value={slide.subtitle || ''} onChange={e => updateSlide(idx, { subtitle: e.target.value })} placeholder="Optional subtitle" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Badge text</Label>
              <Input type="text" value={slide.badge || ''} onChange={e => updateSlide(idx, { badge: e.target.value })} placeholder="e.g. Keynote, Location…" />
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: slide.type === 'image' ? 12 : 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>CTA Label</Label>
              <Input type="text" value={slide.ctaLabel || ''} onChange={e => updateSlide(idx, { ctaLabel: e.target.value })} placeholder="e.g. Register Now" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>CTA URL</Label>
              <Input type="text" value={slide.ctaUrl || ''} onChange={e => updateSlide(idx, { ctaUrl: e.target.value })} placeholder="/registration" />
            </div>
          </div>
          {slide.type === 'image' && (
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Label style={{ marginBottom: 0 }}>Background Image</Label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Button type="button" variant={(slideImageModes[idx] ?? 'upload') === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setSlideImageModes(m => ({ ...m, [idx]: 'upload' }))}>Upload</Button>
                  <Button type="button" variant={slideImageModes[idx] === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setSlideImageModes(m => ({ ...m, [idx]: 'url' }))}>URL</Button>
                </div>
              </div>
              {slide.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.imageUrl} alt="slide" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />
              )}
              {(slideImageModes[idx] ?? 'upload') === 'upload' ? (
                <>
                  <div className="uzone" onClick={() => slideImageRefs.current[idx]?.click()}>
                    {slide.imageUrl ? 'Click to replace image' : 'Click to upload image'}
                  </div>
                  <input ref={el => { slideImageRefs.current[idx] = el; }} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleSlideImageUpload(idx, f); e.target.value = ''; }} />
                </>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input type="url" placeholder="https://example.com/image.jpg" value={slideUrlInputs[idx] ?? slide.imageUrl ?? ''} onChange={e => setSlideUrlInputs(s => ({ ...s, [idx]: e.target.value }))} style={{ flex: 1 }} />
                  <Button variant="outline" size="sm" onClick={() => { const u = slideUrlInputs[idx]?.trim(); if (u) updateSlide(idx, { imageUrl: u }); }}>Apply</Button>
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

      {/* ── Important Dates ── */}
      <SectionHeader title="Important Dates" onAdd={() => addToArr<ImportantDate>('importantDates', { date: '', title: '', description: '' })} addLabel="Add Date" />
      {dates.map((item, idx) => (
        <div key={idx} className="slide-editor-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Date {idx + 1}</span>
            <ItemControls idx={idx} total={dates.length} onUp={() => moveInArr('importantDates', idx, -1)} onDown={() => moveInArr('importantDates', idx, 1)} onRemove={() => removeFromArr('importantDates', idx)} />
          </div>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Date</Label>
              <Input type="text" value={item.date} onChange={e => updateArr<ImportantDate>('importantDates', idx, { date: e.target.value })} placeholder="e.g. May 31, 2026" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Title</Label>
              <Input type="text" value={item.title} onChange={e => updateArr<ImportantDate>('importantDates', idx, { title: e.target.value })} placeholder="e.g. Paper Submission Deadline" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <Label>Description</Label>
            <Input type="text" value={item.description ?? ''} onChange={e => updateArr<ImportantDate>('importantDates', idx, { description: e.target.value })} placeholder="Optional sub-text" />
          </div>
        </div>
      ))}
      {dates.length === 0 && <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: '20px 0' }}>No dates yet.</div>}

      {/* ── Keynote Speakers ── */}
      <SectionHeader title="Keynote Speakers" onAdd={() => addToArr<Keynote>('keynotes', { name: '', institution: '', topic: '' })} addLabel="Add Speaker" />
      {keynotes.map((sp, idx) => (
        <div key={idx} className="slide-editor-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Speaker {idx + 1}</span>
            <ItemControls idx={idx} total={keynotes.length} onUp={() => moveInArr('keynotes', idx, -1)} onDown={() => moveInArr('keynotes', idx, 1)} onRemove={() => removeFromArr('keynotes', idx)} />
          </div>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Name</Label>
              <Input type="text" value={sp.name} onChange={e => updateArr<Keynote>('keynotes', idx, { name: e.target.value })} placeholder="Prof. Name" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Institution</Label>
              <Input type="text" value={sp.institution} onChange={e => updateArr<Keynote>('keynotes', idx, { institution: e.target.value })} placeholder="University / Institute" />
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Topic</Label>
              <Input type="text" value={sp.topic} onChange={e => updateArr<Keynote>('keynotes', idx, { topic: e.target.value })} placeholder="Research area" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Avatar URL</Label>
              <Input type="url" value={sp.avatarUrl ?? ''} onChange={e => updateArr<Keynote>('keynotes', idx, { avatarUrl: e.target.value || null })} placeholder="https://…/photo.jpg (optional)" />
            </div>
          </div>
        </div>
      ))}
      {keynotes.length === 0 && <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: '20px 0' }}>No keynote speakers yet.</div>}

      {/* ── Special Sessions ── */}
      <SectionHeader title="ISVE Special Sessions" onAdd={() => addToArr<SpecialSession>('specialSessions', { title: '', chair: '' })} addLabel="Add Session" />
      {sessions.map((s, idx) => (
        <div key={idx} className="slide-editor-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Session {idx + 1}</span>
            <ItemControls idx={idx} total={sessions.length} onUp={() => moveInArr('specialSessions', idx, -1)} onDown={() => moveInArr('specialSessions', idx, 1)} onRemove={() => removeFromArr('specialSessions', idx)} />
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Title</Label>
              <Input type="text" value={s.title} onChange={e => updateArr<SpecialSession>('specialSessions', idx, { title: e.target.value })} placeholder="Session title" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Chair</Label>
              <Input type="text" value={s.chair} onChange={e => updateArr<SpecialSession>('specialSessions', idx, { chair: e.target.value })} placeholder="Chair: Name, University, Country" />
            </div>
          </div>
        </div>
      ))}
      {sessions.length === 0 && <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: '20px 0' }}>No special sessions yet.</div>}

      {/* ── Publications ── */}
      <SectionHeader title="Publication Opportunities" onAdd={() => addToArr<Publication>('publications', { title: '', description: '' })} addLabel="Add Publication" />
      {pubs.map((p, idx) => (
        <div key={idx} className="slide-editor-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Publication {idx + 1}</span>
            <ItemControls idx={idx} total={pubs.length} onUp={() => moveInArr('publications', idx, -1)} onDown={() => moveInArr('publications', idx, 1)} onRemove={() => removeFromArr('publications', idx)} />
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Journal / Title</Label>
              <Input type="text" value={p.title} onChange={e => updateArr<Publication>('publications', idx, { title: e.target.value })} placeholder="Journal name" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Description</Label>
              <Input type="text" value={p.description ?? ''} onChange={e => updateArr<Publication>('publications', idx, { description: e.target.value })} placeholder="Short description" />
            </div>
          </div>
        </div>
      ))}
      {pubs.length === 0 && <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: '20px 0' }}>No publications yet.</div>}

      {/* ── Organizing Institutions ── */}
      <SectionHeader title="Organizing Institutions" onAdd={() => addToArr<OrganizingInstitution>('organizingInstitutions', { name: '', role: '' })} addLabel="Add Institution" />
      {orgs.map((org, idx) => (
        <div key={idx} className="slide-editor-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Institution {idx + 1}</span>
            <ItemControls idx={idx} total={orgs.length} onUp={() => moveInArr('organizingInstitutions', idx, -1)} onDown={() => moveInArr('organizingInstitutions', idx, 1)} onRemove={() => removeFromArr('organizingInstitutions', idx)} />
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Name</Label>
              <Input type="text" value={org.name} onChange={e => updateArr<OrganizingInstitution>('organizingInstitutions', idx, { name: e.target.value })} placeholder="Institution name" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <Label>Role</Label>
              <Input type="text" value={org.role} onChange={e => updateArr<OrganizingInstitution>('organizingInstitutions', idx, { role: e.target.value })} placeholder="e.g. Host Institution" />
            </div>
          </div>
        </div>
      ))}
      {orgs.length === 0 && <div style={{ fontFamily: "'DM Sans',sans-serif", color: 'var(--text-muted)', padding: '20px 0' }}>No institutions yet.</div>}

      {/* ── Navigation Menu ── */}
      <SectionHeader title="Navigation Menu" />
      <Card><CardContent className="pt-5">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Build multi-level nav. Leave <strong>Link</strong> blank to make an item a group header only. Toggle <strong>●/○</strong> to show/hide.
        </p>
        <NavMenuEditor
          items={settings.navItems ?? []}
          onChange={items => setSettings({ ...settings, navItems: items })}
          pages={allPages}
        />
      </CardContent></Card>

      {/* ── Featured Announcements ── */}
      <SectionHeader title="Paper Archives Sidebar" />
      <Card><CardContent className="pt-5">
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
                  <input type="checkbox" checked={featured} style={{ accentColor: 'var(--navy)', width: 15, height: 15 }} onChange={() => {
                    const cur = settings.featuredAnnouncements ?? [];
                    const next = featured ? cur.filter(id => id !== ann._id) : [...cur, ann._id];
                    setSettings({ ...settings, featuredAnnouncements: next });
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.title}</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: 'var(--text-muted)' }}>{ann.status} · {ann.slug}</div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </CardContent></Card>
    </>
  );
}
