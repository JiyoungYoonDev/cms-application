import { apiFetch } from '@/lib/api/api-client';

export async function loginApi({ email, password }) {
  return apiFetch('/api/cms/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function logoutApi() {
  return apiFetch('/api/cms/auth/logout', { method: 'POST' });
}

export async function getMeApi() {
  return apiFetch('/api/cms/auth/me');
}
