import { queryKeys } from '@/lib/api/query-keys';
import { useQuery } from '@tanstack/react-query';
import { getSectionById, getSectionsById } from '../services/section-service';

export function useSections(id) {
  return useQuery({
    queryKey: queryKeys.sections.list(id),
    queryFn: () => getSectionsById(id),
  });
}

export function useSectionById(courseId, sectionId) {
  return useQuery({
    queryKey: queryKeys.sections.detail(courseId, sectionId),
    queryFn: () => getSectionById(courseId, sectionId),
    enabled: !!courseId && !!sectionId,
  });
}
