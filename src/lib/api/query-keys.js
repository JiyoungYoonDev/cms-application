export const queryKeys = {
  courses: {
    all: ['courses'],
    lists: () => [...queryKeys.courses.all, 'list'],
    list: (params = {}) => [...queryKeys.courses.lists(), params],
    detail: (id) => [...queryKeys.courses.all, 'detail', id],
  },

  courseCategories: {
    all: ['course-categories'],
    lists: () => [...queryKeys.courseCategories.all, 'list'],
    list: () => [...queryKeys.courseCategories.lists()],
    detail: (id) => [...queryKeys.courseCategories.all, 'detail', id],
  },

  sections: {
    all: ['sections'],
    lists: () => [...queryKeys.sections.all, 'list'],
    list: (bookId) => [...queryKeys.sections.lists(), bookId],
    detail: (bookId, sectionId) => [
      ...queryKeys.sections.all,
      'detail',
      bookId,
      sectionId,
    ],
  },

  lectures: {
    all: ['lectures'],
    lists: () => [...queryKeys.lectures.all, 'list'],
    list: (sectionId) => [...queryKeys.lectures.lists(), sectionId],
    detail: (sectionId, lectureId) => [
      ...queryKeys.lectures.all,
      'detail',
      sectionId,
      lectureId,
    ],
  },

  lectureItems: {
    all: ['lecture-items'],
    lists: () => [...queryKeys.lectureItems.all, 'list'],
    list: (lectureId) => [...queryKeys.lectureItems.lists(), lectureId],
    detail: (lectureId, itemId) => [...queryKeys.lectureItems.all, 'detail', lectureId, itemId],
  },
  problemBooks: ['problem-courses'],
  problemBook: (bookId) => ['problem-courses', bookId],
  // courseCategories: ['course-categories'],
  // courseCategory: (categoryId) => ['course-categories', categoryId],
};
