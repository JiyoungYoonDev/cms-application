import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/dashboard-service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['cms-dashboard-stats'],
    queryFn: getDashboardStats,
  });
}
