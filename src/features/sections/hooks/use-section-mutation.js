import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSection } from '../services/section-service';
import { queryKeys } from '@/lib/api/query-keys';

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(variables.bookId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.sections.list(variables.bookId),
      });
    },
  });
}