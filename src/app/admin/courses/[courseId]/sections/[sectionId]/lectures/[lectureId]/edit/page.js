'use client';

import { use } from 'react';
import { LectureEditorShell } from '@/features/lectures/components/editor/lecture-editor-shell';

export default function CourseNestedLectureEditPage({ params }) {
  const { courseId, sectionId, lectureId } = use(params);
  return (
    <LectureEditorShell
      sectionId={sectionId}
      lectureId={lectureId}
      basePath={`/admin/courses/${courseId}/sections/${sectionId}/lectures`}
    />
  );
}
