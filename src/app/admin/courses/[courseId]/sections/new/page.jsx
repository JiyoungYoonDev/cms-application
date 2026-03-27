'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SectionForm } from '@/components/admin/cms/section-form';
import FormPageShell from '@/components/common/forms/form-page-shell';
import { useCreateSection } from '@/features/sections/hooks/use-section-mutation';
import { Save, ChevronLeft } from 'lucide-react';

export default function NewSectionPage({ params }) {
  const { courseId } = use(params);
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
      { courseId, payload: values },
      {
        onSuccess: () => {
          router.push(`/admin/courses/${courseId}`);
        },
        onError: (error) => {
          console.error(error);
          window.alert('Failed to create section');
        },
      },
    );
  };

  return (
    <FormPageShell
      main={
        <div className='space-y-8'>
          <div>
            <h2 className='text-xs font-black uppercase tracking-widest opacity-40 mb-4'>
              Section Info
            </h2>
            <SectionForm values={values} onChange={setValues} />
          </div>
        </div>
      }
      sidebar={
        <div className='sticky top-10 space-y-6'>
          <div className='p-8 border rounded-[32px] bg-card shadow-sm space-y-8'>
            <div className='space-y-2'>
              <h3 className='text-xs font-black uppercase tracking-widest opacity-40'>
                Actions
              </h3>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Fill in the section details and save.
              </p>
            </div>

            <div className='flex flex-col gap-3'>
              <Button
                variant='publish'
                size='lg'
                onClick={handleSave}
                disabled={isPending}
              >
                <Save size={18} className='mr-2' />
                {isPending ? 'Saving...' : 'Save Section'}
              </Button>
            </div>

            <div className='pt-4 border-t'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start text-muted-foreground'
                onClick={() => router.back()}
              >
                <ChevronLeft size={16} className='mr-1' /> Back
              </Button>
            </div>
          </div>
        </div>
      }
    />
  );
}
