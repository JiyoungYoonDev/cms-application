import { useQuery } from '@tanstack/react-query';
import { getJobDetail, getJobReviews } from '../services/generation-admin-service';

export function useJobDetail(jobId) {
  return useQuery({
    queryKey: ['generation', 'job', jobId],
    queryFn: () => getJobDetail(jobId),
    enabled: !!jobId,
  });
}

export function useJobReviews(jobId) {
  return useQuery({
    queryKey: ['generation', 'reviews', jobId],
    queryFn: () => getJobReviews(jobId),
    enabled: !!jobId,
  });
}
