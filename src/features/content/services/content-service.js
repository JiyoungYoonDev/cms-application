
import { apiFetch } from '@/lib/api/api-client';

export const getContentItems = (status, page = 0, size = 20) =>
  apiFetch(`/api/cms/dashboard/content/items?status=${status}&page=${page}&size=${size}`);
