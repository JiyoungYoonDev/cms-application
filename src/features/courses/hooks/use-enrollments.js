import { useQuery } from '@tanstack/react-query';
import { getCourseEnrollments } from '../services/enrollment-service';

export function useCourseEnrollments(courseId, page = 0, size = 20) {
  return useQuery({
    queryKey: ['course-enrollments', courseId, page, size],
    queryFn: () => getCourseEnrollments(courseId, page, size),
    enabled: !!courseId,
  });
}
