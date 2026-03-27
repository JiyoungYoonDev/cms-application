import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProblemBook,
  updateProblemBook,
} from '@/services/create-service';
import { queryKeys } from '@/lib/api/query-keys';

export function useCreateProblemBookMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProblemBook,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problemBooks });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useUpdateProblemBookMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, payload }) => updateProblemBook(bookId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problemBooks });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
