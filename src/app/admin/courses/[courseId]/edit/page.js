'use client';

import { use } from 'react';
import CourseForm from '@/features/courses/components/form/course-form';
import { useCourse } from '@/features/courses/hooks';

export default function EditBookPage({ params }) {
  const { courseId } = use(params);
  const { data: courseData } = useCourse(courseId);

  return (
    <CourseForm mode='edit' courseId={courseId} initialCourse={courseData?.data} />
  );
}
