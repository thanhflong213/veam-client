import type { Page, Announcement, Settings } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// All responses are wrapped: { data: T, meta: { timestamp } }
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  const json = await res.json();
  // Unwrap global ResponseInterceptor envelope
  return ('data' in json ? json.data : json) as T;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

// ── Visitor ──────────────────────────────────────────────────────────────────

export function getPages(): Promise<Page[]> {
  return apiFetch<Page[]>('/pages');
}

export function getPage(slug: string): Promise<Page> {
  return apiFetch<Page>(`/pages/${slug}`);
}

export interface AnnouncementsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AnnouncementsResponse {
  items: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getAnnouncements(params?: AnnouncementsParams): Promise<AnnouncementsResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.status) q.set('status', params.status);
  return apiFetch<AnnouncementsResponse>(`/announcements${q.toString() ? '?' + q : ''}`);
}

export function getAnnouncement(slug: string): Promise<Announcement> {
  return apiFetch<Announcement>(`/announcements/${slug}`);
}

export function getSettings(): Promise<Settings> {
  return apiFetch<Settings>('/settings');
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function adminLogin(email: string, password: string): Promise<{ accessToken: string }> {
  return apiFetch<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function adminGetPages(token: string): Promise<Page[]> {
  return apiFetch<Page[]>('/pages', { headers: authHeaders(token) });
}

export function adminGetPage(id: string, token: string): Promise<Page> {
  return apiFetch<Page>(`/pages/${id}`, { headers: authHeaders(token) });
}

export function adminCreatePage(data: Partial<Page>, token: string): Promise<Page> {
  return apiFetch<Page>('/pages', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminUpdatePage(id: string, data: Partial<Page>, token: string): Promise<Page> {
  return apiFetch<Page>(`/pages/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminDeletePage(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/pages/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}

export function adminGetAnnouncements(token: string): Promise<AnnouncementsResponse> {
  return apiFetch<AnnouncementsResponse>('/announcements', { headers: authHeaders(token) });
}

export function adminGetAnnouncement(id: string, token: string): Promise<Announcement> {
  return apiFetch<Announcement>(`/announcements/${id}`, { headers: authHeaders(token) });
}

export function adminCreateAnnouncement(data: Partial<Announcement>, token: string): Promise<Announcement> {
  return apiFetch<Announcement>('/announcements', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminUpdateAnnouncement(id: string, data: Partial<Announcement>, token: string): Promise<Announcement> {
  return apiFetch<Announcement>(`/announcements/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminDeleteAnnouncement(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/announcements/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}

export function adminGetSettings(token: string): Promise<Settings> {
  return apiFetch<Settings>('/settings', { headers: authHeaders(token) });
}

export function adminUpdateSettings(data: Partial<Settings>, token: string): Promise<Settings> {
  return apiFetch<Settings>('/settings', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function adminUploadImage(file: File, token: string): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/uploads/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  const json = await res.json();
  return 'data' in json ? json.data : json;
}
