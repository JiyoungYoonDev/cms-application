import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLecture, getLectureById, getLectures, updateLecture } from '../services/lecture-service';

export function useLectureById(sectionId, lectureId) {
  return useQuery({
    queryKey: queryKeys.lectures.detail(sectionId, lectureId),
    queryFn: () => getLectureById(sectionId, lectureId),
    enabled: !!sectionId && !!lectureId,
    staleTime: 0,
  });
}

export function useLecture(id) {
  return useQuery({
    queryKey: queryKeys.lectures.list(id),
    queryFn: () => getLectures(id),
    enabled: !!id,
    staleTime: 0,
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
