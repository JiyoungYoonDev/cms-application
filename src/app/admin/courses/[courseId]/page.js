'use client';

import { use, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, HeaderAction } from '@/components/common/layout/page-header';
import { StatsOverview } from '@/components/common/data-display/stats/stat-overview';
import { useCourse } from '@/features/courses/hooks/use-course';
import { useCourseEnrollments } from '@/features/courses/hooks/use-enrollments';
import CourseHeader from '@/features/courses/components/header/course-page-header';
import CourseSectionContainer from '@/features/courses/components/table/courses-detail-table-container';
import { Button } from '@/components/ui/button';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CourseDetailPage({ params }) {
  const router = useRouter();
  const { courseId } = use(params);
  const { data: data, isLoading } = useCourse(courseId);
  const [enrollPage, setEnrollPage] = useState(0);
  const { data: enrollData } = useCourseEnrollments(courseId, enrollPage);
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

  const enrollments = enrollData?.data?.content ?? [];
  const enrollTotalPages = enrollData?.data?.totalPages ?? 0;
  const enrollTotalElements = enrollData?.data?.totalElements ?? 0;

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
    {
      label: 'Learners',
      value: enrollTotalElements,
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

      {/* Enrollments */}
      <div className='px-4 space-y-4'>
        <Header
          variant='section'
          title={<span className='flex items-center gap-2'><Users size={15} /> Learners ({enrollTotalElements})</span>}
          description='Users enrolled in this course'
        />
        {enrollments.length === 0 ? (
          <p className='text-sm text-muted-foreground px-1'>No enrollments yet.</p>
        ) : (
          <>
            <div className='rounded-xl border border-border overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/30'>
                    <th className='text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest opacity-50'>Name</th>
                    <th className='text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest opacity-50'>Email</th>
                    <th className='text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest opacity-50'>Enrolled At</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id} className='border-b border-border/50 last:border-0 hover:bg-muted/20'>
                      <td className='px-4 py-2.5 font-medium'>{e.userName ?? '—'}</td>
                      <td className='px-4 py-2.5 text-muted-foreground'>{e.userEmail}</td>
                      <td className='px-4 py-2.5 text-muted-foreground text-xs'>
                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {enrollTotalPages > 1 && (
              <div className='flex items-center gap-2'>
                <Button
                  size='icon'
                  variant='outline'
                  disabled={enrollPage === 0}
                  onClick={() => setEnrollPage((p) => p - 1)}
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className='text-xs text-muted-foreground'>{enrollPage + 1} / {enrollTotalPages}</span>
                <Button
                  size='icon'
                  variant='outline'
                  disabled={enrollPage >= enrollTotalPages - 1}
                  onClick={() => setEnrollPage((p) => p + 1)}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
