'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SectionBasicInfoFields from '@/features/sections/components/form/section-basic-info-fields';
import FormPageShell from '@/components/common/forms/form-page-shell';
import FormSidebar from '@/components/common/forms/form-sidebar';
import { useCreateSection } from '@/features/sections/hooks/use-section-mutation';
import { Save } from 'lucide-react';

export default function NewSectionPage({ params }) {
  const { courseId } = use(params);
  const router = useRouter();
  const { mutate: createSection, isPending } = useCreateSection();

  const [values, setValues] = useState({
    title: '',
    description: '',
    hours: 0,
    points: 0,
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
          toast.error('Failed to create section');
        },
      },
    );
  };

  return (
    <FormPageShell
      main={
        <div className='space-y-12'>
          <SectionBasicInfoFields formData={values} setFormData={setValues} />
        </div>
      }
      sidebar={
        <FormSidebar
          description='Fill in the section details and save.'
          onBack={() => router.back()}
        >
          <Button
            variant='publish'
            size='lg'
            onClick={handleSave}
            disabled={isPending}
          >
            <Save size={18} className='mr-2' />
            {isPending ? 'Saving...' : 'Save Section'}
          </Button>
        </FormSidebar>
      }
    />
  );
}
