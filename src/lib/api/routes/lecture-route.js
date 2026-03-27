const SECTIONS = process.env.NEXT_PUBLIC_API_SECTIONS;
const LECTURES = process.env.NEXT_PUBLIC_API_LECTURES

export const lectureRoutes = {
    list: (sectionId) => `${SECTIONS}/${sectionId}${LECTURES}`,
    paged: (sectionId, page, size) => `${SECTIONS}/${sectionId}${LECTURES}?page=${page}&size=${size}`,
    detail: (sectionId, lectureId) => `${SECTIONS}/${sectionId}${LECTURES}/${lectureId}`,
    create: (sectionId) => `${SECTIONS}/${sectionId}${LECTURES}`,
    update: (sectionId, lectureId) => `${SECTIONS}/${sectionId}${LECTURES}/${lectureId}`,
    delete: (sectionId, lectureId) => `${SECTIONS}/${sectionId}${LECTURES}/${lectureId}`,
}