'use client';

import { use } from 'react';
import { LectureEditorShell } from '@/features/lectures/components/editor/lecture-editor-shell';

export default function NewLecturePage({ params }) {
  const { courseId, sectionId } = use(params);
  return (
    <LectureEditorShell
      sectionId={sectionId}
      lectureId='new'
      basePath={`/admin/courses/${courseId}/sections/${sectionId}/lectures`}
    />
  );
}
