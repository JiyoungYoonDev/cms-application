import { apiFetch } from '@/lib/api/api-client';

export const getDashboardStats = () => apiFetch('/api/cms/dashboard/stats');
