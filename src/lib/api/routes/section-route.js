const COURSES_BASE = process.env.NEXT_PUBLIC_API_COURSES;
const SECTION_BASE = process.env.NEXT_PUBLIC_API_SECTIONS

export const sectionRoutes = {
  create: (courseId) => `${COURSES_BASE}/${courseId}/sections`,
  list: (courseId) => `${COURSES_BASE}/${courseId}/sections`,
  detail: (courseId, sectionId) => `${COURSES_BASE}/${courseId}/sections/${sectionId}`,
  update: (courseId, sectionId) => `${COURSES_BASE}/${courseId}/sections/${sectionId}`,
  remove: (courseId, sectionId) => `${SECTION_BASE}/${courseId}/sections/${sectionId}`,
  reorder: (courseId) => `${COURSES_BASE}/${courseId}/sections/reorder`,
};