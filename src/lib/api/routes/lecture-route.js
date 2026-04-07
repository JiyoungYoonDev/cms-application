const SECTIONS = process.env.NEXT_PUBLIC_API_SECTIONS;
const LECTURES = process.env.NEXT_PUBLIC_API_LECTURES
const LECTURES_BASE = process.env.NEXT_PUBLIC_API_LECTURES_BASE;

export const lectureRoutes = {
    list: (sectionId) => `${SECTIONS}/${sectionId}${LECTURES}`,
    paged: (sectionId, page, size) => `${SECTIONS}/${sectionId}${LECTURES}?page=${page}&size=${size}`,
    detail: (sectionId, lectureId) => `${SECTIONS}/${sectionId}${LECTURES}/${lectureId}`,
    create: (sectionId) => `${SECTIONS}/${sectionId}${LECTURES}`,
    update: (sectionId, lectureId) => `${LECTURES_BASE}/${lectureId}`,
    delete: (sectionId, lectureId) => `${LECTURES_BASE}/${lectureId}`,
    reorder: (sectionId) => `${SECTIONS}/${sectionId}${LECTURES}/reorder`,
}