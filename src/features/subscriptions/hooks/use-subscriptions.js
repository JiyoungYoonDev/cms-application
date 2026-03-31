import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelSubscription, getSubscriptions, grantSubscription } from '../services/subscription-service';

export function useSubscriptions({ status, page = 0, size = 20 } = {}) {
  return useQuery({
    queryKey: ['cms-subscriptions', status, page, size],
    queryFn: () => getSubscriptions({ status, page, size }),
  });
}

export function useGrantSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: grantSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['cms-users'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['cms-users'] });
    },
  });
}
