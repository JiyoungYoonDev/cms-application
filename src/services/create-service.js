import { apiFetch } from '@/lib/api/api-client';

export const createProblemBook = async (payload) => {
  return apiFetch('/api/problem-courses', {
    method: 'POST',
    body: payload,
  });
};

export const updateProblemBook = async (bookId, payload) => {
  return apiFetch(`/api/problem-courses/${bookId}`, {
    method: 'PUT',
    body: payload,
  });
};

export const createProblemsBook = async (data) => {
  return createProblemBook({
    problem_title: data.title,
    problem_description: data.description,
    problem_category: data.category,
    problem_difficulty: Number(data.difficulty),
    problem_keywords: data.keywords.split(',').map((k) => k.trim()),
  });
};

const COURSE_CATEGORIES_PATH =
  process.env.NEXT_PUBLIC_API_COURSE_CATEGORIES ?? '/api/course-categories';

export const createCourseCategory = async (payload) => {
  return apiFetch(COURSE_CATEGORIES_PATH, {
    method: 'POST',
    body: payload,
  });
};
