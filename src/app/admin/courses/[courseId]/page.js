'use client';

import { use, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderAction } from '@/components/common/layout/page-header';
import { StatsOverview } from '@/components/common/data-display/stats/stat-overview';
import { useCourse } from '@/features/courses/hooks/use-course';
import CourseHeader from '@/features/courses/components/header/course-page-header';
import CourseSectionContainer from '@/features/courses/components/table/courses-detail-table-container';
import { Button } from '@/components/ui/button';

export default function CourseDetailPage({ params }) {
  const router = useRouter();
  const { courseId } = use(params);
  const { data: data, isLoading } = useCourse(courseId);
  const course = data?.data ?? {};
   
  const sectionData = useMemo(() => {
    if (Array.isArray(course.sections)) return course.sections;
    if (Array.isArray(course.section)) return course.section;
    return [];
  }, [course.sections, course.section]);

  const totalLectures = sectionData.reduce((acc, section) => {
    if (Array.isArray(section.lectures)) return acc + section.lectures.length;
    if (typeof section.lecture_count === 'number')
      return acc + section.lecture_count;
    if (typeof section.lectureCount === 'number')
      return acc + section.lectureCount;
    return acc;
  }, 0);

  const statItems = [
    {
      label: 'Category',
      value: course?.categoryName?.toUpperCase() || '—',
    },
    {
      label: 'Difficulty',
      value: course?.difficulty || '—',
    },
    {
      label: 'Total Sections',
      value: isLoading ? '...' : sectionData.length,
    },
    {
      label: 'Total Lectures',
      value: isLoading ? '...' : totalLectures,
    },
  ];

  const handleEditBook = useCallback(() => {
    router.push(`/admin/courses/${courseId}/edit`);
  }, [router, courseId]);

  const handlePublishBook = useCallback(() => {
    window.alert('Publish flow placeholder');
  }, []);

  console.log('COURSE ', course);
  const handleAddSection = useCallback(() => {
    router.push(`/admin/courses/${courseId}/sections/new`);
  }, [router, courseId]);

  return (
    <div className='max-w-7xl mx-auto space-y-10 py-8'>
      <CourseHeader
        type='detail'
        course={course}
        actions={
          <>
            <Button
              variant='edit'
              size='sm'
              onClick={handleEditBook}
              className='text-muted-foreground hover:text-foreground font-semibold'
            >
              Edit Course
            </Button>

            <Button
              variant='add'
              size='sm'
              onClick={handleAddSection}
              className='rounded-xl border-border px-5 font-bold'
            >
              Add Section
            </Button>

            <Button
              variant='publish'
              onClick={handlePublishBook}
              size='sm'
              className='rounded-xl bg-foreground text-background hover:opacity-90 px-6 font-black'
            >
              Publish
            </Button>
          </>
        }
      />

      <div className='px-4'>
        <StatsOverview items={statItems} />
      </div>

      <div className='px-4'>
        <CourseSectionContainer
          courseId={courseId}
          sections={sectionData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
