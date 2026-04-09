'use client';

import { use, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/layout/page-header';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useLecture } from '@/features/lectures/hooks';
import LectureGenerateModal from '@/features/courses/components/generate/lecture-generate-modal';
import { useSectionById } from '@/features/sections/hooks/use-section';
import LecturesTableContainer from '@/features/lectures/components/table/lectures-table-container';

export default function CourseSectionLecturesPage({ params }) {
  const router = useRouter();
  const { courseId, sectionId } = use(params);
  const [showLectureGenModal, setShowLectureGenModal] = useState(false);
  const { data, isLoading } = useLecture(sectionId);
  const { data: sectionData } = useSectionById(courseId, sectionId);
  const sectionName = sectionData?.data?.title ?? sectionData?.title ?? `Section #${sectionId}`;

  const rawLectures =
    data?.data?.content ??
    data?.data ??
    data?.content ??
    (Array.isArray(data) ? data : []);

  const lectures = [...rawLectures].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const handleAddLecture = useCallback(() => {
    router.push(`/admin/courses/${courseId}/sections/${sectionId}/lectures/new`);
  }, [router, courseId, sectionId]);

  return (
    <div className='max-w-7xl mx-auto space-y-10 py-8'>
      <LectureGenerateModal
        open={showLectureGenModal}
        onClose={() => setShowLectureGenModal(false)}
        sectionId={sectionId}
      />
      <Header
        title='Lectures'
        description={sectionName}
        actions={
          <>
            <Button variant='outline' size='sm' onClick={() => router.back()}>
              Back
            </Button>
            <Button variant='add' size='sm' onClick={handleAddLecture}>
              Add Lecture
            </Button>
            <Button
              variant='add'
              size='sm'
              onClick={() => setShowLectureGenModal(true)}
            >
              <Sparkles size={14} className='mr-1' />
              AI Add Lecture
            </Button>
          </>
        }
      />

      <LecturesTableContainer
        sectionId={sectionId}
        lectures={lectures}
        isLoading={isLoading}
        baseUrl={`/admin/courses/${courseId}/sections/${sectionId}/lectures`}
      />
    </div>
  );
}
