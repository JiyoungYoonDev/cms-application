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
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseCategories.list(),
      });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
