import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addLectureByAi } from '../services/generation-service';

export function useGenerateLecture(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLectureByAi,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectures.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
