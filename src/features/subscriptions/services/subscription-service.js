import { apiFetch } from '@/lib/api/api-client';

export const getSubscriptions = ({ status, page = 0, size = 20 } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (status) params.set('status', status);
  return apiFetch(`/api/cms/subscriptions?${params}`);
};

export const grantSubscription = ({ userId, plan, expiresAt }) =>
  apiFetch('/api/cms/subscriptions/grant', {
    method: 'POST',
    body: JSON.stringify({ userId, plan, expiresAt }),
  });

export const cancelSubscription = (subscriptionId) =>
  apiFetch(`/api/cms/subscriptions/${subscriptionId}/cancel`, {
    method: 'PATCH',
  });
