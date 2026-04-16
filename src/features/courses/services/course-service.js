import { apiFetch } from '@/lib/api/api-client';
import { courseRoutes } from '@/lib/api/routes';

const COURSE_CATEGORIES_PATH =
  process.env.NEXT_PUBLIC_API_COURSE_CATEGORIES ?? '/api/course-categories';

export const getCourses = async (page = 0, size = 20, usePaging = false) => {
  const url = usePaging ? courseRoutes.paged(page, size) : courseRoutes.list();

  return apiFetch(url);
};

export const getCourseById = async (id) => {
  const result = await apiFetch(courseRoutes.detail(id));
  return result;
};

export const createCourse = async (payload) => {
  return apiFetch(courseRoutes.create(), {
    method: 'POST',
    body: payload,
  });
};

export const updateCourseMutation = async (id, payload) => {
  return apiFetch(courseRoutes.update(id), {
    method: 'PUT',
    body: payload,
  });
};

export const deleteCourse = async (id) => {
  return apiFetch(courseRoutes.delete(id), {
    method: 'DELETE',
  });
};

// ─── Course categories ───────────────────────────────────────────────────────

export const getCourseCategories = async () => {
  return apiFetch(COURSE_CATEGORIES_PATH);
};

export const createCourseCategory = async (payload) => {
  return apiFetch(COURSE_CATEGORIES_PATH, {
    method: 'POST',
    body: payload,
  });
};
