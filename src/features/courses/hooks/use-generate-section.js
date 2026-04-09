import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSectionByAi } from '../services/generation-service';

export function useGenerateSection(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSectionByAi,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
