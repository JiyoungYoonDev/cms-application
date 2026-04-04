import { apiFetch } from '@/lib/api/api-client';
import { sectionRoutes } from '@/lib/api/routes';

export const getSectionsById = async (id) => {
    const result = await apiFetch(sectionRoutes.list(id));
    return result;
}

export const getSectionById = async (courseId, sectionId) => {
  return apiFetch(sectionRoutes.detail(courseId, sectionId));
};

export const reorderSections = async (courseId, items) => {
  return apiFetch(sectionRoutes.reorder(courseId), {
    method: 'PATCH',
    body: items,
  });
};

export const deleteSection = async (courseId, sectionId) => {
  return apiFetch(sectionRoutes.remove(courseId, sectionId), {
    method: 'DELETE',
  });
};

export const createSection = async ({ courseId, payload }) => {
  const result = await apiFetch(sectionRoutes.create(courseId), {
    method: 'POST',
    body: payload,
  });

  return result;
};
