const LECTURES_BASE = process.env.NEXT_PUBLIC_API_LECTURES_BASE;
const LECTURE_ITEMS_BASE = process.env.NEXT_PUBLIC_API_LECTURE_ITEMS_BASE;

export const lectureItemRoutes = {
  list: (lectureId) => `${LECTURES_BASE}/${lectureId}/items`,
  getById: (itemId) => `${LECTURE_ITEMS_BASE}/${itemId}`,
  create: (lectureId) => `${LECTURES_BASE}/${lectureId}/items`,
  update: (itemId) => `${LECTURE_ITEMS_BASE}/${itemId}`,
  delete: (itemId) => `${LECTURE_ITEMS_BASE}/${itemId}`,
  reorder: (lectureId) => `${LECTURES_BASE}/${lectureId}/items/reorder`,
};
