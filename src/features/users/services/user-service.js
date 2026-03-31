import { apiFetch } from '@/lib/api/api-client';

export const getUsers = ({ search, role, status, page = 0, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  return apiFetch(`/api/cms/users?${params}`);
};

export const updateUserRole = (userId, role) =>
  apiFetch(`/api/cms/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });

export const updateUserStatus = (userId, status) =>
  apiFetch(`/api/cms/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
