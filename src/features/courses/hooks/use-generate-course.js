import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateCourse } from '../services/generation-service';

export function useGenerateCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateCourse,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.lists(),
      });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
