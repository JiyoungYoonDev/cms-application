const ENROLLMENTS_BASE = process.env.NEXT_PUBLIC_API_ENROLLMENTS ?? '/api/enrollments';

export const enrollmentRoutes = {
  byCourse: (courseId, page = 0, size = 20) =>
    `${ENROLLMENTS_BASE}/courses/${courseId}?page=${page}&size=${size}`,
};
