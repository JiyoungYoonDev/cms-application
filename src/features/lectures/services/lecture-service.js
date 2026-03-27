import { apiFetch } from '@/lib/api/api-client';
import { lectureRoutes } from '@/lib/api/routes';

export const getLectureById = async (sectionId, lectureId) => {
  return apiFetch(lectureRoutes.detail(sectionId, lectureId));
};

export const getLectures = async (
  sectionId,
  page = 0,
  size = 20,
  usePaging = false,
) => {
  const url = usePaging
    ? lectureRoutes.paged(sectionId, page, size)
    : lectureRoutes.list(sectionId);
  return apiFetch(url);
};

export const createLecture = async (sectionId, payload) => {
  return apiFetch(lectureRoutes.create(sectionId), {
    method: 'POST',
    body: payload,
  });
};

export const updateLecture = async (sectionId, lectureId, payload) => {
  return apiFetch(lectureRoutes.update(sectionId, lectureId), {
    method: 'PUT',
    body: payload,
  });
};
