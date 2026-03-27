import { apiFetch } from '@/lib/api/api-client';

const COURSE_CATEGORIES_PATH =
  process.env.NEXT_PUBLIC_API_COURSE_CATEGORIES ?? '/api/course-categories';

export const getProblemBooks = async (
  page = 0,
  size = 20,
  usePaging = false,
) => {
  if (!usePaging) {
    return apiFetch('/api/problem-courses');
  }

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return apiFetch(`/api/problem-courses?${params.toString()}`);
};

export const getProblemBook = async (bookId) => {
  return apiFetch(`/api/problem-courses/${bookId}`);
};

export const getCourseCategories = async () => {
  return apiFetch(COURSE_CATEGORIES_PATH);
};
