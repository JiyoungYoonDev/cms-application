import { apiFetch } from '@/lib/api/api-client';
import { lectureItemRoutes } from '@/lib/api/routes';

export const getLectureItems = async (lectureId) => {
  return apiFetch(lectureItemRoutes.list(lectureId));
};

export const getLectureItemById = async (itemId) => {
  return apiFetch(lectureItemRoutes.getById(itemId));
};

function toApiPayload({ content, ...rest }) {
  return { ...rest, contentJson: content != null ? JSON.stringify(content) : null };
}

export const createLectureItem = async (lectureId, payload) => {
  return apiFetch(lectureItemRoutes.create(lectureId), {
    method: 'POST',
    body: toApiPayload(payload),
  });
};

export const updateLectureItem = async (itemId, payload) => {
  return apiFetch(lectureItemRoutes.update(itemId), {
    method: 'PUT',
    body: toApiPayload(payload),
  });
};

export const deleteLectureItem = async (itemId) => {
  return apiFetch(lectureItemRoutes.delete(itemId), {
    method: 'DELETE',
  });
};

export const updateLectureItemReviewStatus = async (itemId, reviewStatus) => {
  return apiFetch(lectureItemRoutes.updateReviewStatus(itemId), {
    method: 'PATCH',
    body: { reviewStatus },
  });
};

export const reorderLectureItems = async (lectureId, itemIds) => {
  return apiFetch(lectureItemRoutes.reorder(lectureId), {
    method: 'PATCH',
    body: { itemIds },
  });
};
