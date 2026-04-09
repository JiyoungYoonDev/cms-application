import { apiFetch } from '@/lib/api/api-client';
import { generationRoutes } from '@/lib/api/routes';

export const generateCourse = async (payload) => {
  return apiFetch(generationRoutes.generate(), {
    method: 'POST',
    body: payload,
    signal: AbortSignal.timeout(600_000),
  });
};

export const regenerateLecture = async (lectureId) => {
  return apiFetch(generationRoutes.regenerateLecture(lectureId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });
};

export const reconvertLecture = async (lectureId) => {
  return apiFetch(generationRoutes.reconvertLecture(lectureId), {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
  });
};

export const regenerateItem = async (itemId) => {
  return apiFetch(generationRoutes.regenerateItem(itemId), {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),
  });
};

export const addSectionByAi = async (payload) => {
  return apiFetch(generationRoutes.addSection(), {
    method: 'POST',
    body: payload,
    signal: AbortSignal.timeout(300_000),
  });
};

export const addLectureByAi = async (payload) => {
  return apiFetch(generationRoutes.addLecture(), {
    method: 'POST',
    body: payload,
    signal: AbortSignal.timeout(300_000),
  });
};

export const addItemByAi = async (payload) => {
  return apiFetch(generationRoutes.addItem(), {
    method: 'POST',
    body: payload,
    signal: AbortSignal.timeout(300_000),
  });
};
