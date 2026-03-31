import { useQuery } from '@tanstack/react-query';
import { getContentItems } from '../services/content-service';

export function useContentItems(status, page = 0, size = 20) {
  return useQuery({
    queryKey: ['cms-content-items', status, page, size],
    queryFn: () => getContentItems(status, page, size),
    enabled: !!status,
  });
}
