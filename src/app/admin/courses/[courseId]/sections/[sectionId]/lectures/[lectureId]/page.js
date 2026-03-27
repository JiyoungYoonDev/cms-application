'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/layout/page-header';
import { LectureItemsManager } from '@/features/lectures/components/items/lecture-items-manager';
import { useLectureById } from '@/features/lectures/hooks';
import { useSectionById } from '@/features/sections/hooks/use-section';

export default function LectureManagePage({ params }) {
  const router = useRouter();
  const { courseId, sectionId, lectureId } = use(params);

  const { data: lectureData, isLoading } = useLectureById(sectionId, lectureId);
  const { data: sectionData } = useSectionById(courseId, sectionId);

  const lectureName = lectureData?.data?.title ?? lectureData?.title;
  const sectionName = sectionData?.data?.title ?? sectionData?.title ?? `Section #${sectionId}`;

  return (
    <div className='max-w-4xl mx-auto space-y-8 py-8'>
      <Header
        title={isLoading ? 'Loading...' : (lectureName || 'Lecture')}
        description={sectionName}
        actions={
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <section className='rounded-2xl border bg-card p-6 shadow-sm'>
        <h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4'>
          Lecture Items
        </h2>
        <LectureItemsManager
          lectureId={lectureId}
          basePath={`/admin/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`}
        />
      </section>
    </div>
  );
}
