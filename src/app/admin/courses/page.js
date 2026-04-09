'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import CourseHeader from '@/features/courses/components/header/course-page-header';
import CoursesTableContainer from '@/features/courses/components/table/courses-table-container';
import CourseGenerateModal from '@/features/courses/components/generate/course-generate-modal';
import { HeaderAction } from '@/components/common/layout/page-header';

export default function Home() {
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className='max-w-7xl mx-auto space-y-10 py-8'>
      <CourseHeader
        type='main'
        actions={
          <>
            <HeaderAction
              variant='outline'
              onClick={() => setGenerateOpen(true)}
            >
              <Sparkles size={14} className='mr-1.5' />
              Generate with AI
            </HeaderAction>
            <HeaderAction asChild variant='outline'>
              <Link href='/admin/courses/create'>Create Course</Link>
            </HeaderAction>
          </>
        }
      />
      <CoursesTableContainer />

      <CourseGenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
      />
    </div>
  );
}
