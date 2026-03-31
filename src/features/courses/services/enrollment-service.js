import { apiFetch } from '@/lib/api/api-client';
import { enrollmentRoutes } from '@/lib/api/routes';

export const getCourseEnrollments = async (courseId, page = 0, size = 20) => {
  return apiFetch(enrollmentRoutes.byCourse(courseId, page, size));
};
