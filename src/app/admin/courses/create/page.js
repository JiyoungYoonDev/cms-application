'use client';

import CourseForm from '@/features/courses/components/form/course-form';
import CourseHeader from '@/features/courses/components/header/course-page-header';

export default function CreateBookPage() {
  return (
    <div className='max-w-7xl mx-auto space-y-10 py-8'>
      <CourseHeader type='create' />
      <div>
        <CourseForm mode={'create'} />
      </div>
    </div>
  );
}
