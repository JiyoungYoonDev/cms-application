import { apiFetch } from '@/lib/api/api-client';
import { sectionRoutes } from '@/lib/api/routes';

export const getSectionsById = async (id) => {
    const result = await apiFetch(sectionRoutes.list(id));
    return result;
}

export const getSectionById = async (courseId, sectionId) => {
  return apiFetch(sectionRoutes.detail(courseId, sectionId));
};

export const createSection = async ({ bookId, payload }) => {
  const result = await apiFetch(sectionRoutes.create(bookId), {
    method: 'POST',
    body: payload,
  });

  return result;
};
