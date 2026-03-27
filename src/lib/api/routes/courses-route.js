const COURSES_BASE = process.env.NEXT_PUBLIC_API_COURSES;

export const courseRoutes = {
    list: () => COURSES_BASE,
    detail: (id) =>`${COURSES_BASE}/${id}`,
    paged: (page, size) => `${COURSES_BASE}?page=${page}&size=${size}`,
    create: () => COURSES_BASE,
    update: (id) => `${COURSES_BASE}/${id}`,
    delete: (id) => `${COURSES_BASE}/${id}`
}