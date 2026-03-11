import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProblemBook } from '@/services/create-service';
import { getProblemBooks, getProblemBook } from '@/services/get-service';
import { queryKeys } from '@/lib/query-keys';

export function useProblemBooksQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.problemBooks,
    queryFn: getProblemBooks,
    ...options,
  });
}

export function useProblemBookQuery(bookId, options = {}) {
  return useQuery({
    queryKey: queryKeys.problemBook(bookId),
    queryFn: () => getProblemBook(bookId),
    enabled: Boolean(bookId),
    ...options,
  });
}

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
