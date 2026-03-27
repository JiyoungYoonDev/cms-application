import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCourseCategory } from '@/services/create-service';
import { getCourseCategories } from '@/services/get-service';

import { queryKeys } from '@/lib/api/query-keys';

export function useCourseCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.courseCategories.list(),
    queryFn: getCourseCategories,
    ...options,
  });
}

export function useCreateCourseCategoryMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourseCategory,
    onSuccess: (data, variables, context) => {
      const created = data?.data ?? data;

      if (created) {
        queryClient.setQueryData(queryKeys.courseCategories.list(), (old) => {
          const current = Array.isArray(old) ? old : (old?.data ?? []);
          const exists = current.some(
            (item) => String(item?.id) === String(created?.id),
          );
          const next = exists ? current : [...current, created];

          if (Array.isArray(old)) return next;
          if (old && typeof old === 'object') {
            return { ...old, data: next };
          }

          return next;
        });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.courseCategories.list(),
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
