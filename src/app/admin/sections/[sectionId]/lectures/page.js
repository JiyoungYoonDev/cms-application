'use client';

import { use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/layout/page-header';
import { Button } from '@/components/ui/button';
import { useLecture } from '@/features/lectures/hooks';
import LecturesTableContainer from '@/features/lectures/components/table/lectures-table-container';

export default function SectionLecturesPage({ params }) {
  const router = useRouter();
  const { sectionId } = use(params);
  const { data, isLoading, error } = useLecture(sectionId);

  const rawLectures =
    data?.data?.content ??
    data?.data ??
    data?.content ??
    (Array.isArray(data) ? data : []);

  const lectures = [...rawLectures].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const handleAddLecture = useCallback(() => {
    router.push(`/admin/sections/${sectionId}/lectures/new`);
  }, [router, sectionId]);

  return (
    <div className='max-w-7xl mx-auto space-y-10 py-8'>
      <Header
        title='Lectures'
        description={`Section #${sectionId}`}
        actions={
          <>
            <Button variant='outline' size='sm' onClick={() => router.back()}>
              Back
            </Button>
            <Button variant='add' size='sm' onClick={handleAddLecture}>
              Add Lecture
            </Button>
          </>
        }
      />

      <LecturesTableContainer
        sectionId={sectionId}
        lectures={lectures}
        isLoading={isLoading}
      />
    </div>
  );
}
