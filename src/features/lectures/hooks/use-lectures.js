import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLecture, deleteLecture, getLectureById, getLectures, updateLecture, reorderLectures } from '../services/lecture-service';

export function useLectureById(sectionId, lectureId) {
  return useQuery({
    queryKey: queryKeys.lectures.detail(sectionId, lectureId),
    queryFn: () => getLectureById(sectionId, lectureId),
    enabled: !!sectionId && !!lectureId,
  });
}

export function useLecture(id) {
  return useQuery({
    queryKey: queryKeys.lectures.list(id),
    queryFn: () => getLectures(id),
    enabled: !!id,
  });
}

export function useCreateLecture(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, payload }) => createLecture(sectionId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lectures.lists(),
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useReorderLectures(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, items }) => reorderLectures(sectionId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectures.list(variables.sectionId) });
      options.onSuccess?.();
    },
    ...options,
  });
}

export function useDeleteLecture(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, lectureId }) => deleteLecture(sectionId, lectureId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lectures.lists(),
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useUpdateLecture(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, lectureId, payload }) =>
      updateLecture(sectionId, lectureId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lectures.lists(),
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
