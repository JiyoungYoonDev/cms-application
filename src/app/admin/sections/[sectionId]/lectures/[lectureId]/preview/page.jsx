'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SimpleEditor } from '@/components/common/tiptap/simple/simple-editor';
import { mockLecturesBySection } from '@/data/admin-cms-mock';
import { Header } from '@/components/common/layout/page-header';

export default function LecturePreviewPage({ params }) {
  const resolvedParams =
    typeof params?.then === 'function' ? use(params) : params;
  const { sectionId, lectureId } = resolvedParams;
  const router = useRouter();
  const [previewData, setPreviewData] = useState(null);

  const lecture = useMemo(() => {
    const lectures = mockLecturesBySection[sectionId] ?? [];
    return lectures.find((item) => item.id === lectureId);
  }, [lectureId, sectionId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(`lecture-preview:${lectureId}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setPreviewData(parsed);
    } catch (error) {
      console.error('Failed to load lecture preview data:', error);
    }
  }, [lectureId]);

  const previewTitle = previewData?.title || lecture?.title;
  const previewContent = previewData?.contentJson || lecture?.contentJson;

  if (!previewContent) {
    return (
      <div className='space-y-4'>
        <Header
          title='Lecture Preview'
          description='Lecture not found.'
          actions={
            <Button variant='outline' onClick={() => router.back()}>
              Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Header
        title={previewTitle}
        description='Preview mode'
        actions={
          <Button variant='outline' onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <section className='rounded-2xl border bg-card p-6 shadow-sm'>
        <SimpleEditor initialData={previewContent} readOnly />
      </section>
    </div>
  );
}
