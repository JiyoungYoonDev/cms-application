import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLecture,
  deleteLecture,
  getLectureById,
  getLectures,
  updateLecture,
  reorderLectures,
} from '../services/lecture-service';

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
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ sectionId, payload }) => createLecture(sectionId, payload),
    onSuccess: async (data, variables, context) => {
      if (variables?.sectionId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.lectures.list(variables.sectionId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.lectures.lists(),
      });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
}

export function useReorderLectures(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ sectionId, items }) => reorderLectures(sectionId, items),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.lectures.list(variables.sectionId),
      });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
}

export function useDeleteLecture(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ sectionId, lectureId }) =>
      deleteLecture(sectionId, lectureId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.lectures.lists(),
      });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
}

export function useUpdateLecture(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ sectionId, lectureId, payload }) =>
      updateLecture(sectionId, lectureId, payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.lectures.lists(),
      });
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
}
