import { apiFetch } from '@/lib/api/api-client';
import { courseRoutes } from '@/lib/api/routes';

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
  console.log('ID', id);
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
