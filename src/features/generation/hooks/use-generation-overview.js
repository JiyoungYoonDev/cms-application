import { useQuery } from '@tanstack/react-query';
import { getOverview, getJobs } from '../services/generation-admin-service';

export function useGenerationOverview() {
  return useQuery({
    queryKey: ['generation', 'overview'],
    queryFn: getOverview,
  });
}

export function useGenerationJobs() {
  return useQuery({
    queryKey: ['generation', 'jobs'],
    queryFn: getJobs,
  });
}
