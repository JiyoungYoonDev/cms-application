import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addItemByAi } from '../services/generation-service';

export function useGenerateItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItemByAi,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectures.all });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
