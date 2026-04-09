import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourseMutation,
} from '../services/course-service';

export function useCourse(id) {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });
}

export function useCourses(params = {}) {
  return useQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: () => getCourses(params),
  });
}

export function useUpdateCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateCourseMutation(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.lists(),
      });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.courses.detail(variables.id),
        });
      }

      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useDeleteCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.lists(),
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// Mutation
export function useCreateCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.lists(),
      });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
