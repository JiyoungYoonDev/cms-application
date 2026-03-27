export const COURSE_HEADER_DATA = {
  main: {
    title: 'Courses',
    description: 'Build, review, and manage course content',
  },
  detail: (course) => ({
    title: course?.title || course?.courseTitle || 'Course',
    description: course?.description || course?.shortDescription || '',
  }),
  sections: {
    title: 'Course Sections',
    description: 'Manage sections for this course.',
  },
  create: {
    title: 'Create New Course',
    description: 'Create a new course and configure its content.',
  },

  edit: (course) => ({
    title: `Edit ${course?.title || 'Course'}`,
    description: 'Update course information and content settings.',
  }),

  sections: {
    title: 'Course Sections',
    description: 'Manage sections for this course.',
  },
};
