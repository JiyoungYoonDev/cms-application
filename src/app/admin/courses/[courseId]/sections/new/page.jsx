'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SectionForm } from '@/components/admin/cms/section-form';
import { Header } from '@/components/common/layout/page-header';
import { useCreateSection } from '@/features/sections/hooks/use-section-mutation';

export default function NewSectionPage({ params }) {
  const { bookId } = use(params);
  const router = useRouter();
  const { mutate: createSection, isPending } = useCreateSection();

  const [values, setValues] = useState({
    title: '',
    description: '',
    hours: 0,
    points: 0,
    sortOrder: 1,
  });

  const handleSave = () => {
    createSection(
      {
        bookId,
        payload: values,
      },
      {
        onSuccess: () => {
          router.push(`/admin/courses/${bookId}`);
        },
        onError: (error) => {
          console.error(error);
          window.alert('Failed to create section');
        },
      },
    );
  };

  return (
    <div className='space-y-6'>
      <Header
        title='New Section'
        description='Add a new section to this course.'
        actions={
          <>
            <Button variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Section</Button>
          </>
        }
      />

      <section className='rounded-2xl border bg-card p-6 shadow-sm'>
        <SectionForm values={values} onChange={setValues} />
      </section>
    </div>
  );
}
