import { queryKeys } from '@/lib/api/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLectureItem,
  deleteLectureItem,
  getLectureItemById,
  getLectureItems,
  reorderLectureItems,
  updateLectureItem,
} from '../services/lecture-item-service';

export function useLectureItemById(itemId) {
  return useQuery({
    queryKey: queryKeys.lectureItems.detail(null, itemId),
    queryFn: () => getLectureItemById(itemId),
    enabled: !!itemId,
    staleTime: 0,
  });
}

export function useLectureItems(lectureId) {
  return useQuery({
    queryKey: queryKeys.lectureItems.list(lectureId),
    queryFn: () => getLectureItems(lectureId),
    enabled: !!lectureId,
    staleTime: 0,
  });
}

export function useCreateLectureItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lectureId, payload }) => createLectureItem(lectureId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lectureItems.list(variables.lectureId),
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useUpdateLectureItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }) => updateLectureItem(itemId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectureItems.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.lectureItems.detail(null, variables.itemId) });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useDeleteLectureItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId }) => deleteLectureItem(itemId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lectureItems.lists() });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useReorderLectureItems(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lectureId, itemIds }) => reorderLectureItems(lectureId, itemIds),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lectureItems.list(variables.lectureId),
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
