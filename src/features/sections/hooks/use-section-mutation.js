import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSection, deleteSection, reorderSections } from '../services/section-service';
import { queryKeys } from '@/lib/api/query-keys';

export function useReorderSections(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, items }) => reorderSections(courseId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(variables.courseId) });
      options.onSuccess?.();
    },
    ...options,
  });
}

export function useDeleteSection(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, sectionId }) => deleteSection(courseId, sectionId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(variables.courseId) });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(variables.courseId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.sections.list(variables.courseId),
      });
    },
  });
}