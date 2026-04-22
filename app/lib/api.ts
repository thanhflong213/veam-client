import type { Page, Announcement, Institution, Settings } from './types';

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
  search?: string;
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
  if (params?.search) q.set('search', params.search);
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
  return apiFetch<Page[]>('/pages/manage', { headers: authHeaders(token) });
}

export function adminGetPage(id: string, token: string): Promise<Page> {
  return apiFetch<Page>(`/pages/manage/${id}`, { headers: authHeaders(token) });
}

export function adminCreatePage(data: Partial<Page>, token: string): Promise<Page> {
  return apiFetch<Page>('/pages', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminUpdatePage(id: string, data: Partial<Page>, token: string): Promise<Page> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug: _slug, ...rest } = data as Record<string, unknown>;
  return apiFetch<Page>(`/pages/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(rest),
  });
}

export function adminDeletePage(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/pages/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}

export function adminGetAnnouncements(token: string): Promise<AnnouncementsResponse> {
  return apiFetch<AnnouncementsResponse>('/announcements/manage?limit=100', { headers: authHeaders(token) });
}

export function adminGetAnnouncement(id: string, token: string): Promise<Announcement> {
  return apiFetch<Announcement>(`/announcements/manage/${id}`, { headers: authHeaders(token) });
}

export function adminCreateAnnouncement(data: Partial<Announcement>, token: string): Promise<Announcement> {
  return apiFetch<Announcement>('/announcements', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminUpdateAnnouncement(id: string, data: Partial<Announcement>, token: string): Promise<Announcement> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug: _slug, ...rest } = data as Record<string, unknown>;
  return apiFetch<Announcement>(`/announcements/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(rest),
  });
}

export function adminDeleteAnnouncement(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/announcements/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}

export function adminGetSettings(token: string): Promise<Settings> {
  return apiFetch<Settings>('/settings', { headers: authHeaders(token) });
}

export function adminUpdateSettings(data: Partial<Settings>, token: string): Promise<Settings> {
  const { _id, createdAt, updatedAt, __v, ...payload } = data as Record<string, unknown>;
  void _id; void createdAt; void updatedAt; void __v;
  return apiFetch<Settings>('/settings', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function adminUploadImage(file: File, token: string): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  const json = await res.json();
  return 'data' in json ? json.data : json;
}

export interface InstitutionsResponse {
  items: Institution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InstitutionsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function getInstitutions(params?: InstitutionsParams): Promise<InstitutionsResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search);
  return apiFetch<InstitutionsResponse>(`/institutions${q.toString() ? '?' + q : ''}`);
}

export function getInstitution(slug: string): Promise<Institution> {
  return apiFetch<Institution>(`/institutions/${slug}`);
}

export function adminGetInstitutions(token: string): Promise<InstitutionsResponse> {
  return apiFetch<InstitutionsResponse>('/institutions/manage?limit=100', { headers: authHeaders(token) });
}

export function adminGetInstitution(id: string, token: string): Promise<Institution> {
  return apiFetch<Institution>(`/institutions/manage/${id}`, { headers: authHeaders(token) });
}

export function adminCreateInstitution(data: Partial<Institution>, token: string): Promise<Institution> {
  return apiFetch<Institution>('/institutions', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function adminUpdateInstitution(id: string, data: Partial<Institution>, token: string): Promise<Institution> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug: _slug, ...rest } = data as Record<string, unknown>;
  return apiFetch<Institution>(`/institutions/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(rest),
  });
}

export function adminDeleteInstitution(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/institutions/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}
