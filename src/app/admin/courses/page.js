'use client';

import CourseHeader from '@/features/courses/components/header/course-page-header';
import CoursesTableContainer from '@/features/courses/components/table/courses-table-container';

export default function Home() {
  return (
    <div className='max-w-7xl mx-auto space-y-10 py-8'>
      <CourseHeader type='main' />
      <CoursesTableContainer />
    </div>
  );
}
