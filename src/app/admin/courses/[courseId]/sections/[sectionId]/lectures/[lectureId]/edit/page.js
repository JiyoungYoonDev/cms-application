'use client';

import { use } from 'react';
import LectureEditorPage from '@/app/admin/sections/[sectionId]/lectures/[lectureId]/edit/page';

export default function CourseNestedLectureEditPage({ params }) {
  const resolvedParams = typeof params?.then === 'function' ? use(params) : params;
  return (
    <LectureEditorPage
      params={{
        sectionId: resolvedParams.sectionId,
        lectureId: resolvedParams.lectureId,
      }}
    />
  );
}
